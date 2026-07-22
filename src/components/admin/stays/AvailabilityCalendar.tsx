"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  getAvailability,
  mutateAvailability,
  type AvailabilityDay,
} from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function todayIso(): string {
  return iso(new Date());
}

/**
 * Availability calendar — block/unblock dates and set price overrides. A month
 * grid: pick one or more dates, then apply an action. Booked dates (set by the
 * booking flow) can't be selected, so the admin can't clobber a real booking.
 * Reads a month's availability over REST and refetches after each change.
 */
export function AvailabilityCalendar({ stayId }: { stayId: string }) {
  // First of the shown month.
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [byDate, setByDate] = useState<Map<string, AvailabilityDay>>(new Map());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const monthStart = iso(cursor);
  const monthEnd = iso(
    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const days = await getAvailability(stayId, monthStart, monthEnd);
      setByDate(new Map(days.map((d) => [d.date, d])));
    } finally {
      setLoading(false);
    }
  }, [stayId, monthStart, monthEnd]);

  useEffect(() => {
    // Fetch when the shown month changes; state updates after the round trip.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const goMonth = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
    setSelected(new Set());
  };

  // Build the 6-week grid (Monday-first).
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Mon=0
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const today = todayIso();

  const toggle = (key: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const apply = async (
    body:
      | {
          action: "set";
          dates: string[];
          status: "AVAILABLE" | "BLOCKED";
          priceOverride?: number | null;
        }
      | { action: "clear"; dates: string[] },
  ) => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await mutateAvailability(stayId, body);
      await load();
      setSelected(new Set());
      setPrice("");
    } finally {
      setBusy(false);
    }
  };

  const dates = [...selected];

  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-bark font-serif text-lg">
          {cursor.toLocaleString("en-IN", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => goMonth(-1)}
            className="text-muted-ink hover:bg-paper-2 grid size-8 place-items-center rounded-md"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => goMonth(1)}
            className="text-muted-ink hover:bg-paper-2 grid size-8 place-items-center rounded-md"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-muted-ink py-1 text-center text-xs font-medium"
          >
            {w}
          </div>
        ))}
        {cells.map((d) => {
          const key = iso(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isPast = key < today;
          const info = byDate.get(key);
          const status = info?.status ?? "AVAILABLE";
          const booked = status === "BOOKED";
          const blocked = status === "BLOCKED";
          const disabled = !inMonth || isPast || booked;
          const isSelected = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key, disabled)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors",
                !inMonth && "opacity-30",
                disabled && "cursor-not-allowed",
                isSelected
                  ? "border-clay bg-clay text-primary-foreground"
                  : booked
                    ? "border-border bg-paper-2 text-muted-ink"
                    : blocked
                      ? "border-error/30 bg-error/10 text-error"
                      : "border-border bg-card text-bark hover:border-clay/50",
              )}
            >
              <span className="num">{d.getDate()}</span>
              {info?.priceOverride != null && (
                <span className="num text-[0.6rem] leading-none opacity-80">
                  ₹{info.priceOverride}
                </span>
              )}
              {booked && (
                <span className="text-[0.55rem] leading-none">booked</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend + actions */}
      <div className="text-muted-ink mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="border-error/30 bg-error/10 inline-block size-3 rounded border" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-paper-2 border-border inline-block size-3 rounded border" />
          Booked
        </span>
        {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      </div>

      <div className="border-border mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-muted-ink text-sm">
          <span className="num text-bark font-medium">{selected.size}</span>{" "}
          selected
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={busy || selected.size === 0}
            onClick={() => apply({ action: "set", dates, status: "BLOCKED" })}
          >
            Block
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || selected.size === 0}
            onClick={() => apply({ action: "clear", dates })}
          >
            Unblock / reset
          </Button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="₹ / night"
            aria-label="Price override"
            className="border-input bg-card num focus-visible:ring-ring h-9 w-28 rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
          />
          <Button
            size="sm"
            disabled={busy || selected.size === 0 || !price}
            onClick={() =>
              apply({
                action: "set",
                dates,
                status: "AVAILABLE",
                priceOverride: Number(price),
              })
            }
          >
            Set price
          </Button>
        </div>
      </div>
    </div>
  );
}
