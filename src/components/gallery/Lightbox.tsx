"use client";

import * as React from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { StayImageView } from "@/services/types";
import { cn } from "@/lib/utils";

/**
 * Lightbox — the full-screen photo viewer.
 *
 * Built on Radix Dialog so the focus trap, Escape-to-close, body scroll lock,
 * `aria-modal` and focus return come correct for free — the same reasons the
 * mobile Sheet uses it. Left/right arrow keys and the on-screen chevrons page
 * through, wrapping at the ends; a mono counter shows position.
 *
 * Controlled and presentational: `index` (null = closed) and navigation are
 * owned by the parent via `onClose` and `onIndexChange`. It renders the
 * resolved image URLs it is given and stores nothing.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: StayImageView[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const open = index !== null;
  const current = index ?? 0;
  const count = images.length;

  const go = React.useCallback(
    (delta: number) => {
      if (count === 0) return;
      onIndexChange((current + delta + count) % count);
    },
    [current, count, onIndexChange],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const image = images[current];

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-bark/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
        <Dialog.Content
          onKeyDown={onKeyDown}
          aria-label="Photo gallery"
          className="fixed inset-0 z-50 flex flex-col outline-none"
        >
          <Dialog.Title className="sr-only">Photo gallery</Dialog.Title>

          {/* Top bar: counter + close. */}
          <div className="text-paper flex items-center justify-between p-4">
            <span className="num text-sm">
              {count > 0 ? current + 1 : 0} / {count}
            </span>
            <Dialog.Close
              aria-label="Close gallery"
              className="text-paper/80 hover:text-paper focus-visible:ring-paper inline-flex size-10 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-6" aria-hidden />
            </Dialog.Close>
          </div>

          {/* Stage. */}
          <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
            {image && (
              <div className="relative h-full w-full max-w-5xl">
                <Image
                  src={image.url}
                  alt={image.altText ?? `Photo ${current + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {count > 1 && (
              <>
                <NavButton side="left" onClick={() => go(-1)} />
                <NavButton side="right" onClick={() => go(1)} />
              </>
            )}
          </div>

          {image?.caption && (
            <p className="text-paper/80 px-4 pb-6 text-center text-sm">
              {image.caption}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "bg-paper/10 text-paper hover:bg-paper/20 focus-visible:ring-paper absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-6" aria-hidden />
    </button>
  );
}
