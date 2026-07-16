import type { StayDetail } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StatItem } from "@/components/shared/StatItem";

/**
 * Quick facts — the spec sheet, on ledger lines.
 *
 * Reuses `StatItem`, so every fact lands on a dotted leader with its figure in
 * mono. Rows that have no data (a stay with no recorded acreage) are simply not
 * rendered rather than showing a dash.
 */
export function QuickFacts({ stay }: { stay: StayDetail }) {
  return (
    <section aria-labelledby="facts-heading">
      <SectionHeading id="facts-heading" title="Quick facts" />
      <div className="card-surface mt-5 grid gap-x-10 gap-y-3 p-5 sm:grid-cols-2">
        <StatItem label="Guests" value={stay.maxGuests} />
        <StatItem label="Bedrooms" value={stay.bedrooms} />
        <StatItem label="Bathrooms" value={stay.bathrooms} />
        <StatItem label="Property type" value={stay.type} mono={false} />
        {stay.acres !== null && (
          <StatItem
            label="Estate"
            mono={false}
            value={
              <>
                <span className="num">{stay.acres}</span> acres
              </>
            }
          />
        )}
        {stay.distanceFromTownKm !== null && (
          <StatItem
            label="From town"
            mono={false}
            value={
              <>
                <span className="num">{stay.distanceFromTownKm}</span> km
              </>
            }
          />
        )}
        <StatItem label="Check-in" value={stay.checkInTime} />
        <StatItem label="Check-out" value={stay.checkOutTime} />
      </div>
    </section>
  );
}
