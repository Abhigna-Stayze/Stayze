"use client";

import Link from "next/link";
import { Images } from "lucide-react";
import type { StayImageView } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { cn } from "@/lib/utils";

/**
 * Gallery — the stay page's hero photo mosaic.
 *
 * One large photo left, two stacked right, and a "View all N photos" control
 * over the corner. On mobile it collapses to the lead photo. Tiles open the
 * `Lightbox` when `onImageClick` is passed; "View all" either links to the
 * dedicated gallery route (`viewAllHref`) or fires `onViewAll`.
 *
 * Presentational: it renders the images it is handed (already URL-resolved by
 * the service) and raises intent through callbacks — it owns no open state.
 */
export function Gallery({
  images,
  viewAllHref,
  onViewAll,
  onImageClick,
  className,
}: {
  images: StayImageView[];
  viewAllHref?: string;
  onViewAll?: () => void;
  onImageClick?: (index: number) => void;
  className?: string;
}) {
  if (images.length === 0) return null;
  const tiles = images.slice(0, 3);

  const Tile = ({ image, index }: { image: StayImageView; index: number }) => {
    const inner = (
      <Thumbnail
        src={image.url}
        alt={image.altText ?? "Stay photo"}
        sizes={index === 0 ? "(max-width: 640px) 100vw, 66vw" : "33vw"}
        priority={index === 0}
        className={
          onImageClick
            ? "transition-transform duration-300 hover:scale-[1.02]"
            : undefined
        }
      />
    );
    const shape = cn(
      "relative overflow-hidden",
      index === 0 ? "sm:col-span-2 sm:row-span-2" : "hidden sm:block",
    );
    return onImageClick ? (
      <button
        type="button"
        onClick={() => onImageClick(index)}
        aria-label={`Open photo ${index + 1} of ${images.length}`}
        className={cn(
          shape,
          "focus-visible:ring-ring group focus-visible:ring-offset-paper focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        {inner}
      </button>
    ) : (
      <div className={shape}>{inner}</div>
    );
  };

  const viewAllLabel = (
    <>
      <Images className="size-4" aria-hidden />
      View all <span className="num">{images.length}</span> photos
    </>
  );
  const viewAllClass =
    "bg-card/95 text-bark shadow-card focus-visible:ring-ring absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none";

  return (
    <div
      className={cn(
        "relative grid aspect-[16/10] grid-cols-1 gap-2 sm:aspect-[16/9] sm:grid-cols-4 sm:grid-rows-2",
        className,
      )}
    >
      {tiles.map((image, index) => (
        <Tile key={image.id} image={image} index={index} />
      ))}

      {viewAllHref ? (
        <Link href={viewAllHref} className={viewAllClass}>
          {viewAllLabel}
        </Link>
      ) : (
        onViewAll && (
          <button type="button" onClick={onViewAll} className={viewAllClass}>
            {viewAllLabel}
          </button>
        )
      )}
    </div>
  );
}
