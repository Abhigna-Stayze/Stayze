import type { StayCard as StayCardData } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { StatItem } from "@/components/shared/StatItem";
import { Price, formatPrice } from "@/components/ui/price";
import { cn } from "@/lib/utils";

/** "14 Aug 2026" from a Date, or a dash when absent. */
function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * BookingSummary — the card that stays visible through the whole booking flow.
 *
 * Photo, name, the trip's facts on dotted-leader lines, and — once there is a
 * real one — the estimated total in large mono. Every figure is mono, and this
 * component derives nothing and fetches nothing: the caller passes the current
 * dates, nights and total, and the summary renders them.
 *
 * **It never multiplies the nightly rate by the nights.** `estimateTotal` in
 * the booking service prices a stay night by night, so weekend and festival
 * overrides are included; `base × nights` would quote a figure the server
 * disagrees with. The only total shown here is the authoritative one that
 * `POST /api/booking` returns — pass `estimatedTotal` and it appears, omit it
 * and the card simply doesn't guess.
 *
 * The `note` slot carries the "an estimate, not a charge" line and `action`
 * the WhatsApp handoff, so both stay the caller's.
 */
export function BookingSummary({
  stay,
  checkIn,
  checkOut,
  nights,
  adults,
  childGuests,
  estimatedTotal,
  note,
  action,
  className,
}: {
  stay: StayCardData;
  checkIn?: Date | null;
  checkOut?: Date | null;
  nights?: number | null;
  adults?: number;
  /** Child guests. Not `children` — that name is React's reserved slot. */
  childGuests?: number;
  estimatedTotal?: number | null;
  note?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const guests = adults !== undefined ? adults + (childGuests ?? 0) : undefined;

  return (
    <div className={cn("card-float overflow-hidden", className)}>
      <div className="relative aspect-[16/9] w-full">
        <Thumbnail
          src={stay.heroImageUrl}
          alt={stay.heroImageAlt ?? stay.name}
          sizes="(max-width: 1024px) 100vw, 380px"
        />
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="heading-3 text-bark">{stay.name}</h3>
          <p className="text-mist text-sm font-medium">{stay.type}</p>
        </div>

        <div className="flex flex-col gap-2">
          <StatItem label="Check-in" value={formatDate(checkIn)} />
          <StatItem label="Check-out" value={formatDate(checkOut)} />
          {nights != null && <StatItem label="Nights" value={nights} />}
          {guests !== undefined && <StatItem label="Guests" value={guests} />}
        </div>

        <hr className="border-border border-t border-dashed" />
        <StatItem
          label="Rate"
          mono={false}
          value={
            <>
              <span className="num">
                {formatPrice(stay.basePricePerNight, stay.currency)}
              </span>
              <span className="text-muted-ink"> /night</span>
            </>
          }
        />

        {estimatedTotal != null && (
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-bark text-sm font-medium">
              Estimated total
            </span>
            <Price
              amount={estimatedTotal}
              currency={stay.currency}
              unit={null}
              size="lg"
            />
          </div>
        )}

        {note && <p className="text-muted-ink text-xs">{note}</p>}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}
