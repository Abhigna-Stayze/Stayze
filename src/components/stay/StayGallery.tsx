"use client";

import { useState } from "react";
import type { StayImageView } from "@/services/types";
import { Gallery } from "@/components/gallery/Gallery";
import { Lightbox } from "@/components/gallery/Lightbox";

/**
 * The stay's hero gallery — the Phase 3 `Gallery` mosaic wired to the
 * `Lightbox`.
 *
 * The only client state on the page's upper half: which photo is open. "View
 * all N photos" opens the lightbox at the first image rather than routing to a
 * dedicated gallery page, which does not exist yet — a control that navigates
 * nowhere is worse than one that does the obvious thing here.
 */
export function StayGallery({ images }: { images: StayImageView[] }) {
  const [index, setIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <Gallery
        images={images}
        onImageClick={setIndex}
        onViewAll={() => setIndex(0)}
        className="overflow-hidden rounded-lg"
      />
      <Lightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </>
  );
}
