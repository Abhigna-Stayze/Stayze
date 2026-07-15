import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A photo well with a brand-correct fallback.
 *
 * Every card and gallery tile shows a Supabase-hosted photo, but a freshly
 * onboarded stay may have none yet. Rather than a broken image or a grey box,
 * an empty well shows the roofline mark on a paper-2 ground — the same fallback
 * the design specifies for a stay with no photo.
 *
 * Presentational only: it is handed a resolved `src` (the services already
 * turned `bucket`+`path` into a URL) and never touches storage. `alt` is
 * mandatory — the API returns alt text on every image, so callers have one.
 *
 * The parent must be positioned and sized; this fills it (`object-cover`).
 */
export function Thumbnail({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  /** Responsive hint for the optimiser, e.g. "(max-width: 768px) 100vw, 33vw". */
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "bg-paper-2 flex h-full w-full items-center justify-center",
          className,
        )}
        aria-hidden
      >
        {/* The roofline mark, muted — a quiet "photo coming soon". */}
        <svg
          viewBox="0 0 48 40"
          className="text-bark/15 h-10 w-12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 26 L24 10 L42 26" />
          <path d="M6 26 L6 34 L42 34 L42 26" />
        </svg>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
