import "server-only";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/services/types";

/**
 * Site settings — a single-row config table.
 *
 * The one genuinely important field is `whatsappNumber`: it is the number every
 * booking enquiry is sent to. Without it there is no booking flow at all, which
 * is why booking.service.ts refuses to proceed if this row is missing.
 */

/** The row uses a fixed id rather than an arbitrary cuid. */
const SETTINGS_ID = "default";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_ID },
    select: {
      whatsappNumber: true,
      supportPhone: true,
      supportEmail: true,
      instagramUrl: true,
    },
  });

  return settings;
}

/**
 * Store a support enquiry from the floating "Need help" button.
 *
 * Optional by design — the schema treats ContactMessage as a nice-to-have. If
 * we ever stop storing these, delete this and the table, not just the caller.
 */
export async function createContactMessage(input: {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
  channel: "WHATSAPP" | "CALL" | "EMAIL";
}): Promise<{ id: string }> {
  return prisma.contactMessage.create({
    data: {
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      message: input.message,
      channel: input.channel,
    },
    select: { id: true },
  });
}

/** The Explore filter chips. Fixed vocabulary — see the schema note on Tag. */
export async function getTags(): Promise<
  Array<{ id: string; name: string; slug: string; type: string }>
> {
  return prisma.tag.findMany({
    select: { id: true, name: true, slug: true, type: true },
    orderBy: { name: "asc" },
  });
}

/** The master amenity list, for the Stay Detail amenities block. */
export async function getAmenities(): Promise<
  Array<{
    id: string;
    name: string;
    icon: string | null;
    category: string | null;
  }>
> {
  return prisma.amenity.findMany({
    select: { id: true, name: true, icon: true, category: true },
    orderBy: { name: "asc" },
  });
}
