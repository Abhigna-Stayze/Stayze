"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/components/search/SearchFilters";
import {
  BUDGET_OPTIONS,
  GUEST_OPTIONS,
  SORT_OPTIONS,
  TAG_FILTERS,
  type ExploreFilters,
} from "@/lib/explore-filters";

const TAG_OPTIONS = TAG_FILTERS.map((t) => ({ label: t.label, value: t.slug }));

function budgetLabel(value: string) {
  return (
    BUDGET_OPTIONS.find((b) => b.value === value && b.value)?.label ?? null
  );
}
function guestLabel(guests: number | null) {
  const v = guests ? String(guests) : "";
  return GUEST_OPTIONS.find((g) => g.value === v && g.value)?.label ?? null;
}

/**
 * ExploreToolbar — the page's persistent filter controls.
 *
 * Budget and group size are no longer selects here — the visitor picks those in
 * the welcome chooser (`ExploreIntro`). This bar instead **shows their choices
 * as removable pills** and offers an "Adjust" button to reopen the chooser.
 * Sort and the tag chips stay inline. Purely presentational: the parent owns
 * the `ExploreFilters` (mirrored in the URL) and receives changes via `onUpdate`
 * / `onEditPreferences`.
 */
export function ExploreToolbar({
  filters,
  onUpdate,
  onEditPreferences,
}: {
  filters: ExploreFilters;
  onUpdate: (patch: Partial<ExploreFilters>) => void;
  onEditPreferences: () => void;
}) {
  const toggleTag = (slug: string) =>
    onUpdate({
      tags: filters.tags.includes(slug)
        ? filters.tags.filter((t) => t !== slug)
        : [...filters.tags, slug],
    });

  const budget = budgetLabel(filters.budget);
  const guests = guestLabel(filters.guests);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selected preferences, as pills, with a way to change them. */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEditPreferences}>
            <SlidersHorizontal className="size-4" aria-hidden />
            {budget || guests ? "Adjust" : "Set preferences"}
          </Button>
          {budget && (
            <PreferencePill onRemove={() => onUpdate({ budget: "" })}>
              {budget}
            </PreferencePill>
          )}
          {guests && (
            <PreferencePill onRemove={() => onUpdate({ guests: null })}>
              {guests}
            </PreferencePill>
          )}
        </div>

        {/* Sort. */}
        <div className="flex items-center gap-2">
          <span className="eyebrow text-muted-ink hidden sm:inline">Sort</span>
          <Dropdown
            ariaLabel="Sort stays by"
            className="min-w-44"
            value={filters.sort}
            options={SORT_OPTIONS.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
            onChange={(v) => onUpdate({ sort: v as ExploreFilters["sort"] })}
          />
        </div>
      </div>

      <SearchFilters
        options={TAG_OPTIONS}
        selected={filters.tags}
        onToggle={toggleTag}
      />
    </div>
  );
}

function PreferencePill({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="border-clay/40 bg-clay/10 text-bark inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-sm">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${typeof children === "string" ? children : "filter"}`}
        className="text-clay hover:bg-clay/15 focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  );
}
