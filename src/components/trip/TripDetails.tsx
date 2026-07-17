import type { BookingView } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StatItem } from "@/components/shared/StatItem";
import { formatPrice } from "@/components/ui/price";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Booking details — the full record on ledger lines.
 *
 * Everything the guest gave us, back for reference: stay, dates, guests, the
 * contact we'll reply to, and the reference again. Reuses `StatItem`, so each
 * fact lands on a dotted leader with its figure in mono. The estimate shows
 * only when there is one — and it is the server's night-by-night figure,
 * carried on the booking, never recomputed here.
 */
export function TripDetails({ booking }: { booking: BookingView }) {
  return (
    <section aria-labelledby="details-heading">
      <SectionHeading id="details-heading" title="Booking details" />
      <div className="card-surface mt-5 grid gap-x-10 gap-y-3 p-5 sm:grid-cols-2">
        <StatItem label="Stay" value={booking.stay.name} mono={false} />
        <StatItem label="Reference" value={booking.reference} />
        <StatItem label="Check-in" value={formatDate(booking.checkIn)} />
        <StatItem label="Check-out" value={formatDate(booking.checkOut)} />
        <StatItem label="Nights" value={booking.nights} />
        <StatItem
          label="Guests"
          mono={false}
          value={
            <>
              <span className="num">{booking.adults}</span>{" "}
              {booking.adults === 1 ? "adult" : "adults"}
              {booking.children > 0 && (
                <>
                  , <span className="num">{booking.children}</span>{" "}
                  {booking.children === 1 ? "child" : "children"}
                </>
              )}
            </>
          }
        />
        <StatItem label="Name" value={booking.guestName} mono={false} />
        <StatItem label="Phone" value={booking.guestPhone} />
        {booking.guestEmail && (
          <StatItem label="Email" value={booking.guestEmail} mono={false} />
        )}
        {booking.estimatedTotal !== null && (
          <StatItem
            label="Estimated total"
            emphasis
            value={formatPrice(booking.estimatedTotal, booking.stay.currency)}
          />
        )}
      </div>
      <p className="text-muted-ink mt-3 text-xs">
        The total is an estimate — nothing is charged through Stayze. You settle
        with your host.
      </p>
    </section>
  );
}
