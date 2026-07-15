import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Stayze horizontal lockup.
 *
 * Two brand assets: ink-on-light for the paper header, reversed for the dark
 * footer. SVGs are served `unoptimized` — a vector logo is already optimal, and
 * the image pipeline can only add a request and a rasterisation it does not
 * need. Given an explicit width/height so it never causes layout shift, and
 * `priority` in the header since it is above the fold.
 */
export function Logo({
  variant = "ink",
  priority = false,
  className,
}: {
  variant?: "ink" | "reversed";
  priority?: boolean;
  className?: string;
}) {
  const src =
    variant === "reversed"
      ? "/brand/stayze-logo-horizontal-reversed.svg"
      : "/brand/stayze-logo-horizontal-ink.svg";

  return (
    <Link
      href="/"
      aria-label="Stayze — home"
      className={cn(
        "focus-visible:ring-ring inline-flex items-center rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        variant === "reversed"
          ? "focus-visible:ring-offset-bark"
          : "focus-visible:ring-offset-paper",
        className,
      )}
    >
      <Image
        src={src}
        alt="Stayze"
        width={180}
        height={64}
        priority={priority}
        unoptimized
        className="h-9 w-auto"
      />
    </Link>
  );
}
