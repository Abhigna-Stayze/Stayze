"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Chip — an interactive pill: a filter toggle or a discovery link.
 *
 * Two lives, one look:
 *  - **As a link** (`href`) — the Home "Coffee Estates / Waterfalls …" chips
 *    that route to a filtered `/explore`.
 *  - **As a toggle** (`onClick` + `selected`) — the Explore filter row, where a
 *    selected chip fills clay.
 *
 * Purely presentational: it owns no state. The page holds which chips are
 * selected (in the URL query string, per the spec) and passes `selected` down.
 */
export function Chip({
  children,
  selected = false,
  href,
  onClick,
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  selected?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50",
    selected
      ? "border-clay bg-clay text-primary-foreground"
      : "border-border bg-card text-bark hover:border-clay/50 hover:bg-paper-2/60",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-pressed={selected}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={classes}
    >
      {children}
    </button>
  );
}
