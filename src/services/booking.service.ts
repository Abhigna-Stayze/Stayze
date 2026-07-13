import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { num, toStayCard } from "@/services/mappers";
import { getSiteSettings } from "@/services/site.service";
import type { BookingView } from "@/services/types";

/**
 * Booking — a WhatsApp enquiry, not a transaction.
 *
 * There is no payment and no login. A guest submits the form, we store what
 * they typed, build a prefilled WhatsApp message, and hand them off to the
 * Stayze number. The reference code is the only way they get back to their
 * trip timeline afterwards, so it has to be readable out loud over a phone.
 */

/**
 * Reference alphabet: no 0/O, no 1/I. A guest will read this to us over a bad
 * line from a coffee estate, and "STZ-0I1O" is unusable.
 */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 5;

function generateReference(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `STZ-${code}`;
}

export type CreateBookingInput = {
  staySlug: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children?: number;
  note?: string | null;
};

export type CreateBookingResult = {
  reference: string;
  /** wa.me link, prefilled. The caller opens this; the service does not. */
  whatsappUrl: string;
  estimatedTotal: number;
  nights: number;
};

/** Whole nights between two dates. */
function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/**
 * Create a booking request and return the WhatsApp handoff.
 *
 * Deliberately strict about the things that would produce a nonsense booking:
 * unknown stay, checkout before checkin, more guests than the stay sleeps. The
 * UI should validate too, but this is the layer that actually guarantees it.
 */
export async function createBookingRequest(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const stay = await prisma.stay.findFirst({
    where: { slug: input.staySlug, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      maxGuests: true,
      basePricePerNight: true,
    },
  });

  if (!stay) {
    throw new BookingError(`No published stay with slug "${input.staySlug}".`);
  }

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) {
    throw new BookingError(
      "Check-out must be at least one night after check-in.",
    );
  }

  const children = input.children ?? 0;
  const guests = input.adults + children;
  if (guests > stay.maxGuests) {
    throw new BookingError(
      `${stay.name} sleeps ${stay.maxGuests}. You asked for ${guests}.`,
    );
  }

  // Price the stay night by night, so weekend and festival overrides are
  // reflected. This is an ESTIMATE for the guest's benefit — nothing is charged.
  const estimatedTotal = await estimateTotal(
    stay.id,
    input.checkIn,
    nights,
    Number(stay.basePricePerNight),
  );

  const settings = await getSiteSettings();
  if (!settings) {
    throw new BookingError(
      "SiteSetting row is missing — no WhatsApp number to send to.",
    );
  }

  // The reference is public and short, so a collision is possible rather than
  // theoretical. Retry a few times before giving up.
  let booking: { id: string; reference: string } | null = null;
  for (let attempt = 0; attempt < 5 && !booking; attempt++) {
    const reference = generateReference();
    const whatsappMessage = buildWhatsappMessage({
      reference,
      stayName: stay.name,
      guestName: input.guestName,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      adults: input.adults,
      children,
      note: input.note ?? null,
    });

    try {
      booking = await prisma.bookingRequest.create({
        data: {
          reference,
          stayId: stay.id,
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          guestEmail: input.guestEmail ?? null,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          nights,
          adults: input.adults,
          children,
          note: input.note ?? null,
          estimatedTotal,
          whatsappMessage,
          whatsappSentAt: new Date(),
          status: "NEW",
          source: "WEBSITE",
        },
        select: { id: true, reference: true },
      });
    } catch (e) {
      // P2002 = unique constraint. Any other failure is real; do not swallow it.
      if (!isUniqueViolation(e)) throw e;
    }
  }

  if (!booking) {
    throw new BookingError("Could not allocate a unique booking reference.");
  }

  const row = await prisma.bookingRequest.findUniqueOrThrow({
    where: { id: booking.id },
    select: { whatsappMessage: true },
  });

  const whatsappUrl =
    `https://wa.me/${settings.whatsappNumber}` +
    `?text=${encodeURIComponent(row.whatsappMessage ?? "")}`;

  return {
    reference: booking.reference,
    whatsappUrl,
    estimatedTotal,
    nights,
  };
}

/**
 * Look up a booking by its public reference — the Trip Timeline entry point.
 *
 * The caretaker's phone number is PRIVATE and is withheld until the booking is
 * actually confirmed. Anyone can guess at a reference code, so this is the line
 * that protects a caretaker's personal number from a stranger.
 */
export async function getBookingByReference(
  reference: string,
): Promise<BookingView | null> {
  const booking = await prisma.bookingRequest.findUnique({
    where: { reference: reference.trim().toUpperCase() },
    include: {
      timeline: { orderBy: { sortOrder: "asc" } },
      stay: {
        include: {
          images: { where: { isHero: true }, take: 1 },
          highlights: { orderBy: { sortOrder: "asc" }, take: 3 },
          tags: { include: { tag: true } },
        },
      },
    },
  });

  if (!booking) return null;

  const confirmed =
    booking.status === "CONFIRMED" || booking.status === "COMPLETED";

  return {
    id: booking.id,
    reference: booking.reference,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestEmail: booking.guestEmail,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    adults: booking.adults,
    children: booking.children,
    note: booking.note,
    estimatedTotal: num(booking.estimatedTotal),
    status: booking.status,
    // Recorded, not enforced — nothing here derives status from these.
    cancelledAt: booking.cancelledAt,
    cancellationReason: booking.cancellationReason,
    createdAt: booking.createdAt,
    stay: toStayCard(booking.stay),
    timeline: booking.timeline.map((step) => ({
      id: step.id,
      stepKey: step.stepKey,
      title: step.title,
      content: step.content,
      status: step.status,
      sortOrder: step.sortOrder,
      completedAt: step.completedAt,
    })),
    caretakerName: confirmed ? booking.stay.caretakerName : null,
    caretakerPhone: confirmed ? booking.stay.caretakerPhone : null,
  };
}

// ---------------------------------------------------------------------------

/**
 * Sum the per-night price across the stay, honouring availability overrides.
 * Nights with no availability row fall back to the base price.
 */
async function estimateTotal(
  stayId: string,
  checkIn: Date,
  nights: number,
  basePrice: number,
): Promise<number> {
  const lastNight = new Date(checkIn);
  lastNight.setDate(lastNight.getDate() + nights - 1);

  const days = await prisma.stayAvailability.findMany({
    where: { stayId, date: { gte: checkIn, lte: lastNight } },
    select: { date: true, priceOverride: true },
  });

  const overrideByDate = new Map(
    days.map((d) => [d.date.toISOString().slice(0, 10), num(d.priceOverride)]),
  );

  let total = 0;
  for (let i = 0; i < nights; i++) {
    const date = new Date(checkIn);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    total += overrideByDate.get(key) ?? basePrice;
  }

  return total;
}

function buildWhatsappMessage(args: {
  reference: string;
  stayName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  note: string | null;
}): string {
  const date = (d: Date) => d.toISOString().slice(0, 10);
  const guests =
    args.children > 0
      ? `${args.adults} adults and ${args.children} children`
      : `${args.adults} adults`;

  return (
    `Hi Stayze! I'd like to book ${args.stayName} ` +
    `from ${date(args.checkIn)} to ${date(args.checkOut)} (${args.nights} nights) ` +
    `for ${guests}. ` +
    `Name: ${args.guestName}. ` +
    (args.note ? `Note: ${args.note}. ` : "") +
    `Ref: ${args.reference}.`
  );
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}
