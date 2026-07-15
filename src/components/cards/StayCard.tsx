import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { StayCard as StayCardData } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { FitScoreBadge } from "@/components/shared/FitScoreBadge";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StayCard — the one component that matters most.
 *
 * It appears on Home, Explore, related stays, guides and experiences, so it is
 * built once and takes a `StayCard` DTO exactly as the services return it. The
 * whole card is a single link to the stay; "View →" is an affordance, not a
 * second link.
 *
 * The three rules from the spec live here, not in the caller:
 *  - The gold **FitScore stamp** shows only when `fitScore` is set.
 *  - **`ratingAvg == null` shows a "New stay" badge, never a zero** — a zero
 *    would display a brand-new property as one star.
 *  - The **price is mono and always carries `/night`**.
 *
 * `unavailable` marks a stay the guest's dates can't take (Explore's soft date
 * filter) without hiding it — a bad availability row must not silently lose a
 * booking.
 */
export function StayCard({
  stay,
  priority = false,
  unavailable = false,
  className,
}: {
  stay: StayCardData;
  priority?: boolean;
  unavailable?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/stays/${stay.slug}`}
      aria-label={`${stay.name} — view stay`}
      className={cn(
        "group card-surface focus-visible:ring-ring hover:shadow-float focus-visible:ring-offset-paper flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
    >
      {/* Photo well with the stamp and rating overlaid. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Thumbnail
          src={stay.heroImageUrl}
          alt={stay.heroImageAlt ?? stay.name}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* A soft bottom gradient so the rating pill reads over any photo. */}
        <div
          aria-hidden
          className="from-bark/45 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent"
        />

        {stay.fitScore !== null && (
          <FitScoreBadge
            score={stay.fitScore}
            className="absolute top-3 left-3"
          />
        )}

        {unavailable && (
          <span className="bg-bark/85 text-paper absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            Unavailable for your dates
          </span>
        )}

        {/* Rating, or a "New stay" mark when there is nothing to average yet. */}
        <div className="absolute bottom-3 left-3">
          {stay.ratingAvg !== null ? (
            <span className="bg-bark/85 text-paper inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs backdrop-blur-sm">
              <Star className="fill-gold text-gold size-3" aria-hidden />
              <span className="num font-medium">
                {stay.ratingAvg.toFixed(1)}
              </span>
            </span>
          ) : (
            <Badge tone="neutral">New stay</Badge>
          )}
        </div>
      </div>

      {/* Body. */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="heading-3 text-bark group-hover:text-clay transition-colors">
          {stay.name}
        </h3>
        <p className="text-mist mt-0.5 text-sm font-medium">{stay.type}</p>

        {stay.highlights.length > 0 && (
          <p className="text-muted-ink mt-1.5 text-sm">
            {stay.highlights.slice(0, 3).join(" · ")}
          </p>
        )}

        {/* Price + affordance, pinned to the card's foot. */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <Price amount={stay.basePricePerNight} currency={stay.currency} />
          <span className="text-clay inline-flex items-center gap-1 text-sm font-medium">
            View
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
