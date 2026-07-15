"use client";

import type { StayImageView } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { cn } from "@/lib/utils";

const COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

/**
 * ImageGrid — an even grid of photos.
 *
 * The full gallery route (`/stays/[slug]/gallery`) and anywhere a flat set of
 * images is shown. Each tile is a square; when `onImageClick` is passed the
 * tiles open the `Lightbox`. Presentational: it renders the resolved image URLs
 * it is given and raises the clicked index; it owns no modal state.
 */
export function ImageGrid({
  images,
  columns = 3,
  onImageClick,
  className,
}: {
  images: StayImageView[];
  columns?: 2 | 3 | 4;
  onImageClick?: (index: number) => void;
  className?: string;
}) {
  if (images.length === 0) return null;

  return (
    <div className={cn("grid gap-2 sm:gap-3", COLS[columns], className)}>
      {images.map((image, index) => {
        const inner = (
          <Thumbnail
            src={image.url}
            alt={image.altText ?? "Stay photo"}
            sizes="(max-width: 768px) 50vw, 33vw"
            className={
              onImageClick
                ? "transition-transform duration-300 hover:scale-[1.03]"
                : undefined
            }
          />
        );
        const shape =
          "relative aspect-square overflow-hidden rounded-md border border-border";
        return onImageClick ? (
          <button
            key={image.id}
            type="button"
            onClick={() => onImageClick(index)}
            aria-label={`Open photo ${index + 1} of ${images.length}`}
            className={cn(
              shape,
              "focus-visible:ring-ring focus-visible:ring-offset-paper focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            {inner}
          </button>
        ) : (
          <div key={image.id} className={shape}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
