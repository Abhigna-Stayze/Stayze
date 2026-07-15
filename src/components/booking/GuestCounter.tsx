"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * GuestCounter — a bounded stepper for a guest count.
 *
 * The search bar's "Guests" (1–12) and the booking form's Adults / Children.
 * Controlled and presentational: the parent owns the number and passes `value`
 * + `onChange`; this clamps to `[min, max]` and disables the buttons at the
 * bounds. The value is mono.
 */
export function GuestCounter({
  value,
  onChange,
  min = 1,
  max = 12,
  label,
  hint,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  const control = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label={label ? `Decrease ${label.toLowerCase()}` : "Decrease"}
        className="border-border text-bark hover:border-clay hover:text-clay focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span
        className="num text-bark w-6 text-center text-base tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label={label ? `Increase ${label.toLowerCase()}` : "Increase"}
        className="border-border text-bark hover:border-clay hover:text-clay focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );

  if (!label && !hint) return <div className={className}>{control}</div>;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {(label || hint) && (
        <div>
          {label && <p className="text-bark text-sm font-medium">{label}</p>}
          {hint && <p className="text-muted-ink text-xs">{hint}</p>}
        </div>
      )}
      {control}
    </div>
  );
}
