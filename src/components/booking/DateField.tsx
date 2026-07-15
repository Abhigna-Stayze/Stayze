"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/** "14 Aug" / "14 Aug 2026" from a Date; a placeholder dash when unset. */
function formatDate(date: Date | null | undefined, withYear: boolean): string {
  if (!date) return "Add date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(date);
}

/**
 * DateField — a labelled date value styled as a form control (UI only).
 *
 * The check-in / check-out cells in the search bar and booking form. It shows
 * the mono formatted date under a mono eyebrow and, when `onClick` is given,
 * behaves as a button that opens the page's own date picker — this component
 * carries no calendar of its own. Static (a read-only value) when no handler is
 * passed. Wiring an actual picker is a later phase; here it is the trigger.
 */
export function DateField({
  label,
  value,
  onClick,
  withYear = true,
  disabled = false,
  className,
}: {
  label: string;
  value: Date | null | undefined;
  onClick?: () => void;
  withYear?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <span className="eyebrow text-muted-ink">{label}</span>
      <span className="text-bark mt-1 flex items-center gap-2 text-sm">
        <Calendar className="text-muted-ink size-4" aria-hidden />
        <span className={cn("num", !value && "text-muted-ink font-sans")}>
          {formatDate(value, withYear)}
        </span>
      </span>
    </>
  );

  const base =
    "border-input bg-card flex w-full flex-col rounded-md border px-3 py-2 text-left";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          base,
          "focus-visible:ring-ring hover:border-clay focus-visible:ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {body}
      </button>
    );
  }

  return <div className={cn(base, className)}>{body}</div>;
}
