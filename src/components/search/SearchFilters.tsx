"use client";

import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

export type FilterOption = { label: string; value: string };

/**
 * SearchFilters — the Explore filter chip row.
 *
 * A horizontal, wrapping row of multi-select `Chip`s (Price · Couples · Family
 * · Luxury · Pet Friendly · Pool · Coffee Estate · Workation); a selected chip
 * fills clay. Presentational: it holds no state. The page owns the selected set
 * — the spec keeps it in the URL query string so a filtered view is shareable —
 * and passes `selected` down and `onToggle` up.
 */
export function SearchFilters({
  options,
  selected,
  onToggle,
  className,
}: {
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}) {
  const selectedSet = new Set(selected);

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label="Filter stays"
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          selected={selectedSet.has(option.value)}
          onClick={() => onToggle(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}
