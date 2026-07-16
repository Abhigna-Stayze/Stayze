"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Images, Pause, Play } from "lucide-react";
import type { StayImageView } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { cn } from "@/lib/utils";

/** How long each photo holds before the gallery moves on. */
const AUTO_MS = 5000;

/**
 * Gallery — the stay's hero photos, on a slow 5-second rotation.
 *
 * Two shapes from one component, because a phone and a desk want different
 * things from the same deck:
 *
 *  - **Mobile** — a full-width carousel of *every* photo. Native CSS
 *    scroll-snap, so swiping is the real thing (and works with no JS at all);
 *    autoplay simply scrolls it along. This replaces the old mobile treatment,
 *    which showed a single static photo and wasted the best asset on the page.
 *  - **Desktop** — the mosaic: one large lead tile beside two stacked
 *    supporting tiles. The lead crossfades (opacity only) through the photos
 *    that are *not* pinned to the side tiles — photo 0, then 3, 4, 5… — so the
 *    same image is never on screen twice, and the two side tiles stay calm.
 *
 * Motion is honest about consent and control:
 *  - `prefers-reduced-motion` → the rotation never starts.
 *  - Hovering or focusing the gallery pauses it (you're looking; it shouldn't
 *    move under you).
 *  - An explicit pause/play control, because content that animates on a loop
 *    needs a way to stop it (WCAG 2.2.2), not just a way to outrun it.
 *
 * Autoplay reads the carousel's *current* scroll position each tick rather than
 * tracking an index, so a guest who swipes ahead is never yanked back.
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [leadPos, setLeadPos] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);

  // The lead tile cycles the photos the side tiles don't already show.
  const side = images.slice(1, 3);
  const leadOrder =
    images.length > 3 ? [images[0], ...images.slice(3)] : images.slice(0, 1);

  const rotating = playing && !paused;
  const canRotate = images.length > 1;

  useEffect(() => {
    if (!rotating || !canRotate) return;
    // Never animate against a stated preference. Read at effect time so no
    // state is set during render or from an effect.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setLeadPos((p) => (p + 1) % leadOrder.length);

      // Mobile carousel: advance from wherever it actually sits right now.
      const el = scrollerRef.current;
      if (el && el.clientWidth > 0) {
        const width = el.clientWidth;
        const current = Math.round(el.scrollLeft / width);
        const next = (current + 1) % images.length;
        el.scrollTo({ left: next * width, behavior: "smooth" });
      }
    }, AUTO_MS);

    return () => clearInterval(id);
  }, [rotating, canRotate, images.length, leadOrder.length]);

  if (images.length === 0) return null;

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive((prev) => (prev === index ? prev : index));
  };

  const viewAllLabel = (
    <>
      <Images className="size-4" aria-hidden />
      View all <span className="num">{images.length}</span> photos
    </>
  );
  const viewAllClass =
    "bg-card/95 text-bark shadow-card focus-visible:ring-ring focus-visible:ring-offset-paper absolute right-3 bottom-3 z-10 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

  return (
    <div
      className={cn("relative", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Mobile — swipeable carousel of every photo.

          The aspect ratio must sit on a plain `div`, with the click target as
          an absolute overlay on top. A `<button>` sizes itself from its content
          and `aspect-ratio` does not give it a height — and the only content
          here is an absolutely-positioned fill image, so a button wrapper
          collapses to nothing and the photo never paints. (The same reason the
          desktop lead tile puts its button over the image rather than around
          it.) */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] sm:hidden [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <div key={image.id} className="w-full shrink-0 snap-center">
            <div className="relative aspect-[4/3] w-full">
              <Thumbnail
                src={image.url}
                alt={image.altText ?? "Stay photo"}
                sizes="100vw"
                priority={index === 0}
              />
              {onImageClick && (
                <button
                  type="button"
                  onClick={() => onImageClick(index)}
                  aria-label={`Open photo ${index + 1} of ${images.length}`}
                  className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile — dots. */}
      {canRotate && (
        <div
          className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5 sm:hidden"
          aria-hidden
        >
          {images.map((image, index) => (
            <span
              key={image.id}
              className={cn(
                "size-1.5 rounded-full transition-opacity duration-200",
                index === active ? "bg-paper" : "bg-paper/50",
              )}
            />
          ))}
        </div>
      )}

      {/* Desktop — the mosaic. */}
      <div className="hidden aspect-[16/9] grid-cols-4 grid-rows-2 gap-2 sm:grid">
        <div className="relative col-span-2 row-span-2 overflow-hidden">
          {leadOrder.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                index === leadPos % leadOrder.length
                  ? "opacity-100"
                  : "opacity-0",
              )}
            >
              <Thumbnail
                src={image.url}
                alt={image.altText ?? "Stay photo"}
                sizes="(max-width: 1024px) 66vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
          {onImageClick && (
            <button
              type="button"
              onClick={() =>
                onImageClick(
                  images.indexOf(leadOrder[leadPos % leadOrder.length]),
                )
              }
              aria-label="Open photo gallery"
              className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
            />
          )}
        </div>

        {side.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onImageClick?.(index + 1)}
            aria-label={`Open photo ${index + 2} of ${images.length}`}
            disabled={!onImageClick}
            className="group focus-visible:ring-ring relative col-span-2 overflow-hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          >
            <Thumbnail
              src={image.url}
              alt={image.altText ?? "Stay photo"}
              sizes="33vw"
              className={
                onImageClick
                  ? "transition-transform duration-300 group-hover:scale-[1.03]"
                  : undefined
              }
            />
          </button>
        ))}
      </div>

      {/* Counter + pause — the control the rotation owes the guest. */}
      {canRotate && (
        <div className="bg-bark/70 text-paper absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3 text-xs backdrop-blur-sm">
          <span className="num">
            <span className="sm:hidden">{active + 1}</span>
            <span className="hidden sm:inline">
              {images.indexOf(leadOrder[leadPos % leadOrder.length]) + 1}
            </span>
            {" / "}
            {images.length}
          </span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the gallery" : "Play the gallery"}
            className="hover:bg-paper/20 focus-visible:ring-paper inline-flex size-6 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {playing ? (
              <Pause className="size-3" aria-hidden />
            ) : (
              <Play className="size-3" aria-hidden />
            )}
          </button>
        </div>
      )}

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
