"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = { checkIn: Date | null; checkOut: Date | null };

/** Sunday-first, matching the grid the design shows. */
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Midnight, local — the only granularity a night cares about. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** "2026-08-14" — the wire format the booking flow reads from the URL. */
export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Whole nights between two dates. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

/**
 * Calendar — Stayze's own date-range picker.
 *
 * Built rather than borrowed, so the ledger's rules hold: **every day number is
 * mono**, the month is Fraunces, and the selection is **mist** — the brand's
 * verification/affirmation green — never a generic black. A picked range draws
 * a soft mist band between its two filled ends.
 *
 * Selection is the usual two-tap contract: the first tap sets check-in, the
 * second sets check-out; tapping a date on or before the current check-in
 * starts over rather than inverting the range. Unavailable days are struck
 * through instead of hidden — a guest should see the shape of the month.
 *
 * Presentational and controlled: it owns only which month is on screen. The
 * range lives with the caller, which is what carries it into the booking flow.
 *
 * Accessibility: real `<button>`s (so tab and Enter work with no JS of ours),
 * a full date in each `aria-label`, `aria-pressed` on the chosen ends, and a
 * live region naming the current month.
 */
export function Calendar({
  value,
  onChange,
  minDate,
  disabled,
  onClear,
  className,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** The earliest selectable day. Defaults to today. */
  minDate?: Date;
  /** Mark a day unavailable — struck through, not clickable. */
  disabled?: (date: Date) => boolean;
  onClear?: () => void;
  className?: string;
}) {
  const min = startOfDay(minDate ?? new Date());
  const [month, setMonth] = useState<Date>(() =>
    value.checkIn
      ? new Date(value.checkIn.getFullYear(), value.checkIn.getMonth(), 1)
      : new Date(min.getFullYear(), min.getMonth(), 1),
  );

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthName = new Intl.DateTimeFormat("en-IN", { month: "long" }).format(
    month,
  );
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = new Date(year, monthIndex, 1).getDay();

  // Never page back past the first selectable month.
  const canGoBack =
    year > min.getFullYear() ||
    (year === min.getFullYear() && monthIndex > min.getMonth());

  const isUnavailable = (date: Date) =>
    date < min || (disabled ? disabled(date) : false);

  const select = (date: Date) => {
    const { checkIn, checkOut } = value;
    if (!checkIn || checkOut || date <= checkIn) {
      onChange({ checkIn: date, checkOut: null });
      return;
    }
    onChange({ checkIn, checkOut: date });
  };

  const cells: Array<Date | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, monthIndex, i + 1),
    ),
  ];

  return (
    <div className={cn("select-none", className)}>
      {/* Month header. */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="text-bark hover:bg-paper-2 focus-visible:ring-ring focus-visible:ring-offset-card inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>

        <p className="text-bark font-serif text-base" aria-live="polite">
          {monthName} <span className="num">{year}</span>
        </p>

        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Next month"
          className="text-bark hover:bg-paper-2 focus-visible:ring-ring focus-visible:ring-offset-card inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      {/* Weekday rail. */}
      <div className="mt-3 grid grid-cols-7">
        {WEEKDAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            aria-hidden
            className="eyebrow text-muted-ink flex h-7 items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days. */}
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />;

          const unavailable = isUnavailable(date);
          const isStart = isSameDay(date, value.checkIn);
          const isEnd = isSameDay(date, value.checkOut);
          const inRange =
            value.checkIn !== null &&
            value.checkOut !== null &&
            date > value.checkIn &&
            date < value.checkOut;
          const banded = (isStart && value.checkOut) || isEnd || inRange;

          return (
            <div
              key={toISODate(date)}
              className={cn(
                "flex justify-center py-0.5",
                // The soft band that ties the two ends together.
                banded && "bg-mist/12",
                isStart && value.checkOut && "rounded-l-full",
                isEnd && "rounded-r-full",
              )}
            >
              <button
                type="button"
                onClick={() => select(date)}
                disabled={unavailable}
                aria-pressed={isStart || isEnd}
                aria-label={new Intl.DateTimeFormat("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(date)}
                className={cn(
                  "num focus-visible:ring-ring focus-visible:ring-offset-card inline-flex size-9 items-center justify-center rounded-full text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                  isStart || isEnd
                    ? "bg-mist text-paper font-medium"
                    : unavailable
                      ? "text-muted-ink/40 line-through"
                      : "text-bark hover:bg-paper-2",
                )}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      {onClear && (value.checkIn || value.checkOut) && (
        <button
          type="button"
          onClick={onClear}
          className="text-bark hover:text-clay focus-visible:ring-ring focus-visible:ring-offset-card mt-3 rounded-sm text-sm font-medium underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}
