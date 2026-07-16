import type { StayDetail } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { Rating } from "@/components/ui/rating";

const VISIBLE = 4;

/**
 * Guest memories — the aggregate, then the reviews themselves.
 *
 * Reuses `ReviewCard` (which drops an expired signed photo URL rather than
 * rendering a broken image). Two brand rules hold here:
 *
 *  - **A stay with no reviews reads "New stay", never zero stars.** `ratingAvg`
 *    is null until someone reviews it; zero is a rating, and would show a new
 *    property as one star.
 *  - Beyond the first few, the rest sit inside a native `<details>` — "show all"
 *    with no client JavaScript at all, and keyboard/screen-reader correct for
 *    free.
 */
export function StayReviews({ stay }: { stay: StayDetail }) {
  const reviews = stay.reviews;
  const shown = reviews.slice(0, VISIBLE);
  const rest = reviews.slice(VISIBLE);

  return (
    <section aria-labelledby="reviews-heading">
      <SectionHeading
        id="reviews-heading"
        title="Guest memories"
        subtitle={
          stay.ratingAvg !== null ? (
            <Rating
              value={stay.ratingAvg}
              reviewCount={stay.reviewCount}
              showCount
            />
          ) : undefined
        }
      />

      {reviews.length === 0 ? (
        <div className="border-border bg-card/60 mt-5 rounded-lg border border-dashed p-6">
          <p className="text-bark text-sm font-medium">
            New stay — no reviews yet.
          </p>
          <p className="text-muted-ink mt-1 text-sm">
            This one has been inspected and vouched for, but nobody has written
            about it yet. You could be the first.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-6">
          {shown.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {rest.length > 0 && (
            <details className="group">
              <summary className="text-clay focus-visible:ring-ring focus-visible:ring-offset-paper inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
                <span className="group-open:hidden">
                  Show all <span className="num">{reviews.length}</span> reviews
                </span>
                <span className="hidden group-open:inline">Show fewer</span>
              </summary>
              <div className="mt-6 flex flex-col gap-6">
                {rest.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
