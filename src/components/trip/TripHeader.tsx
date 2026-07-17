import { CalendarDays, MapPin, Users } from "lucide-react";
import type { BookingView } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { statusMeta, type BadgeTone } from "@/lib/trip-status";

/** The status dot's colour — legible over the photo where a tinted pill isn't. */
const DOT: Record<BadgeTone, string> = {
  mist: "bg-mist",
  gold: "bg-gold",
  error: "bg-error",
  neutral: "bg-bark/50",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatYear(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { year: "numeric" }).format(date);
}

/**
 * The trip header — the first thing a returning guest sees.
 *
 * Photo, stay name, the dates and party size, and — largest of all — the
 * status and the reference. The reference is mono and prominent because with no
 * accounts it is the only key to this page; a guest may well be here to read it
 * back to us over the phone.
 */
export function TripHeader({ booking }: { booking: BookingView }) {
  const meta = statusMeta(booking.status);
  const guests = booking.adults + booking.children;

  return (
    <header className="card-surface overflow-hidden">
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <Thumbnail
          src={booking.stay.heroImageUrl}
          alt={booking.stay.heroImageAlt ?? booking.stay.name}
          sizes="(max-width: 1024px) 100vw, 900px"
          priority
        />
        <div
          aria-hidden
          className="from-bark/70 absolute inset-0 bg-gradient-to-t to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5">
          <div>
            <p className="text-paper/80 text-sm font-medium">
              {booking.stay.type}
            </p>
            <h1 className="heading-2 text-paper mt-0.5">{booking.stay.name}</h1>
          </div>
          <span className="bg-card/95 text-bark mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
            <span
              aria-hidden
              className={`size-1.5 rounded-full ${DOT[meta.tone]}`}
            />
            {meta.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <dt className="eyebrow text-muted-ink flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              Dates
            </dt>
            <dd className="text-bark mt-1 text-sm font-medium">
              <span className="num">{formatDate(booking.checkIn)}</span> –{" "}
              <span className="num">{formatDate(booking.checkOut)}</span>{" "}
              <span className="num text-muted-ink">
                {formatYear(booking.checkOut)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-ink flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              Nights
            </dt>
            <dd className="text-bark mt-1 text-sm font-medium">
              <span className="num">{booking.nights}</span>{" "}
              {booking.nights === 1 ? "night" : "nights"}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-ink flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              Guests
            </dt>
            <dd className="text-bark mt-1 text-sm font-medium">
              <span className="num">{guests}</span>{" "}
              {guests === 1 ? "guest" : "guests"}
            </dd>
          </div>
        </dl>

        <div className="text-right">
          <p className="eyebrow text-muted-ink">Reference</p>
          <p className="num text-bark mt-1 text-lg font-semibold tracking-wide">
            {booking.reference}
          </p>
        </div>
      </div>
    </header>
  );
}
