import { MapPin } from "lucide-react";
import type { StayDetail } from "@/services/types";
import { FitScoreBadge } from "@/components/shared/FitScoreBadge";
import { Rating } from "@/components/ui/rating";
import { Tag } from "@/components/ui/tag";

/** "March 2026" — the month a stay was inspected. */
function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * The identity block: who this place is, where it is, and why it is here.
 *
 * Carries the page's single `<h1>`. The verification mark and rating sit above
 * the name (the reassurance arrives before the pitch), the location and type
 * below it, then the stay's own highlights.
 *
 * The Inspected note is the differentiator no OTA can print, so it is rendered
 * as a gold-tinted panel — and **only when there is a real FitScore and a real
 * visit to name**. It is never invented.
 */
export function StayHeader({ stay }: { stay: StayDetail }) {
  const inspected = stay.fitScore !== null && stay.inspectedOn !== null;

  return (
    <header>
      <div className="flex flex-wrap items-center gap-3">
        {stay.fitScore !== null && (
          <FitScoreBadge
            variant="outline"
            label="Verified"
            score={stay.fitScore}
            outOf={100}
          />
        )}
        {stay.ratingAvg !== null ? (
          <Rating
            value={stay.ratingAvg}
            reviewCount={stay.reviewCount}
            showCount
          />
        ) : (
          <span className="text-muted-ink text-xs font-medium">New stay</span>
        )}
      </div>

      <h1 className="heading-1 text-bark mt-3">{stay.name}</h1>

      <p className="text-mist mt-1.5 text-sm font-medium">{stay.type}</p>

      <p className="text-muted-ink mt-2 flex flex-wrap items-center gap-1.5 text-sm">
        <MapPin className="size-4 shrink-0" aria-hidden />
        {stay.area}, Chikmagalur
        {stay.distanceFromTownKm !== null && (
          <span>
            {" · "}
            <span className="num">{stay.distanceFromTownKm}</span> km from town
          </span>
        )}
      </p>

      {stay.highlights.length > 0 && (
        <ul className="mt-5 flex list-none flex-wrap gap-2">
          {stay.highlights.map((highlight) => (
            <li key={highlight}>
              <Tag variant="outline">{highlight}</Tag>
            </li>
          ))}
        </ul>
      )}

      {inspected && (
        <div className="border-gold/50 bg-gold/12 mt-6 flex flex-col gap-1 rounded-lg border p-4">
          <FitScoreBadge
            score={stay.fitScore as number}
            label="Inspected"
            className="self-start"
          />
          <p className="text-bark mt-1.5 text-sm">
            {stay.inspectedBy
              ? `Visited by ${stay.inspectedBy}, ${formatMonth(stay.inspectedOn as Date)}.`
              : `Visited in ${formatMonth(stay.inspectedOn as Date)}.`}{" "}
            <span className="text-muted-ink">
              Every stay here has been visited, not just listed.
            </span>
          </p>
        </div>
      )}
    </header>
  );
}
