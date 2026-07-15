import Image from "next/image";
import { Star } from "lucide-react";
import type { ReviewView } from "@/services/types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** "March 2026" from a Date, or null to render nothing. */
function formatStayedOn(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Five stars, filled to the (rounded) rating. */
function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < filled ? "fill-gold text-gold" : "text-border",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

/**
 * ReviewCard — one guest memory.
 *
 * Avatar, name and stars on a line, an optional title, then the comment. Guest
 * photos, when present, sit below as small tiles.
 *
 * **Review photos are signed URLs that expire in ~1h.** The service returns
 * `url: null` when it could not sign one; this renders the review *without* the
 * photo rather than a broken image, and never caches or bakes the URL. The
 * caller must not store these either.
 */
export function ReviewCard({
  review,
  className,
}: {
  review: ReviewView;
  className?: string;
}) {
  const stayedOn = formatStayedOn(review.stayedOn);
  const photos = review.images.filter(
    (img): img is { id: string; url: string } => Boolean(img.url),
  );

  return (
    <article className={cn("flex gap-3", className)}>
      <Avatar src={null} name={review.guestName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-bark text-sm font-medium">
            {review.guestName}
          </span>
          <Stars rating={review.rating} />
        </div>

        {review.title && (
          <p className="text-bark mt-1.5 text-sm font-medium">{review.title}</p>
        )}
        <p className="text-ink/90 mt-1 text-sm leading-relaxed">
          {review.comment}
        </p>

        {photos.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {photos.map((photo) => (
              <li key={photo.id}>
                <span className="border-border relative block size-16 overflow-hidden rounded-md border">
                  <Image
                    src={photo.url}
                    alt={`Photo from ${review.guestName}'s stay`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
              </li>
            ))}
          </ul>
        )}

        {stayedOn && (
          <p className="text-muted-ink mt-2 text-xs">Stayed {stayedOn}</p>
        )}
      </div>
    </article>
  );
}
