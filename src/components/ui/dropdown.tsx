"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownOption = { value: string; label: string };

/**
 * Dropdown — a small single-select menu, skinned to the ledger.
 *
 * A styled alternative to the native `<select>` for the places that want a
 * smooth, on-brand menu (e.g. the Explore sort). The menu stays mounted and
 * animates open/close with opacity + transform only (respecting the global
 * reduced-motion backstop); `visibility` hides it from the tab order when
 * closed. Closes on select, outside click, or Escape.
 *
 * Controlled and presentational — the parent owns `value` and gets changes via
 * `onChange`.
 */
export function Dropdown({
  value,
  onChange,
  options,
  ariaLabel,
  align = "end",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  ariaLabel?: string;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="border-input bg-card text-bark hover:border-clay/50 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="truncate">{current?.label ?? "Select"}</span>
        <ChevronDown
          className={cn(
            "text-muted-ink size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <ul
        role="listbox"
        aria-label={ariaLabel}
        aria-hidden={!open}
        className={cn(
          "border-border bg-card shadow-float absolute z-40 mt-2 max-h-72 w-max min-w-full origin-top overflow-auto rounded-lg border p-1 transition-[opacity,transform] duration-150 ease-out",
          align === "end" ? "right-0" : "left-0",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1 scale-95 opacity-0",
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "hover:bg-paper-2 focus-visible:bg-paper-2 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none",
                  selected ? "text-clay font-medium" : "text-bark",
                )}
              >
                {option.label}
                {selected && <Check className="size-4 shrink-0" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
