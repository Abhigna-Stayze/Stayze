import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import type { StayCard as StayCardData } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { FitScoreBadge } from "@/components/shared/FitScoreBadge";
import { Price } from "@/components/ui/price";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

/**
 * StayCard — the one component that matters most.
 *
 * It appears on Home, Explore, related stays, guides and experiences, so it is
 * built once and takes a `StayCard` DTO exactly as the services return it. The
 * whole card is a single link to the stay; "View →" is an affordance, not a
 * second link.
 *
 * An editorial layout: a clean photo, then in the body a bordered
 * "● VERIFIED · 89/100" mark beside the rating, the name in Fraunces, the
 * location, its tags, and the price. The three data rules from the spec live
 * here, not in the caller:
 *  - The **verified/FitScore mark shows only when `fitScore` is set**.
 *  - **`ratingAvg == null` shows "New stay", never a zero**.
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
  const location = [stay.area, stay.type].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/stays/${stay.slug}`}
      aria-label={`${stay.name} — view stay`}
      className={cn(
        "group card-surface focus-visible:ring-ring hover:shadow-float focus-visible:ring-offset-paper flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
    >
      {/* Clean photo. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Thumbnail
          src={stay.heroImageUrl}
          alt={stay.heroImageAlt ?? stay.name}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {unavailable && (
          <span className="bg-bark/85 text-paper absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            Unavailable for your dates
          </span>
        )}
      </div>

      {/* Body. */}
      <div className="flex flex-1 flex-col p-4">
        {/* Verification mark + rating. */}
        <div className="flex min-h-7 items-center justify-between gap-2">
          {stay.fitScore !== null ? (
            <FitScoreBadge
              variant="outline"
              label="Verified"
              score={stay.fitScore}
              outOf={100}
            />
          ) : (
            <span />
          )}
          {stay.ratingAvg !== null ? (
            <span className="text-bark inline-flex items-center gap-1 text-sm">
              <Star className="fill-gold text-gold size-3.5" aria-hidden />
              <span className="num font-medium">
                {stay.ratingAvg.toFixed(1)}
              </span>
            </span>
          ) : (
            <span className="text-muted-ink text-xs font-medium">New stay</span>
          )}
        </div>

        <h3 className="heading-3 text-bark group-hover:text-clay mt-3 transition-colors">
          {stay.name}
        </h3>

        {location && (
          <p className="text-muted-ink mt-1 inline-flex items-center gap-1 text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {location}
          </p>
        )}

        {stay.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stay.tags.slice(0, 3).map((tag) => (
              <Tag key={tag.slug} variant="outline">
                {tag.name}
              </Tag>
            ))}
          </div>
        )}

        {/* Price + affordance, pinned to the card's foot. */}
        <div className="border-border/70 mt-4 flex items-center justify-between border-t pt-4">
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
