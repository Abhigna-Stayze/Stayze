"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinOff, SlidersHorizontal } from "lucide-react";
import type { StayCard as StayCardData } from "@/services/types";
import {
  activeFilterCount,
  EMPTY_FILTERS,
  parseFilters,
  sortStays,
  toApiQuery,
  toPageQuery,
  type ExploreFilters,
} from "@/lib/explore-filters";
import { StayCard } from "@/components/cards/StayCard";
import { ExploreToolbar } from "./ExploreToolbar";
import { ExploreIntro } from "./ExploreIntro";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/home/skeletons";

/**
 * ExploreClient — the interactive half of the hybrid.
 *
 * The Server Component renders the first result set (via the service) and hands
 * it in as `initialStays`, so the initial paint is real SSR HTML — no client
 * fetch on load (the `skipInitialFetch` guard). From then on, every filter
 * change:
 *   1. updates the filter state,
 *   2. pushes the new query to the URL with the History API — shareable,
 *      bookmarkable, and (via `popstate`) back/forward-navigable — *without* a
 *      server round-trip, and
 *   3. re-fetches `GET /api/stays` client-side for the new filters.
 * Sort is applied client-side (the API has no sort), so changing it re-orders
 * without a network call.
 */
export function ExploreClient({
  initialStays,
  initialFilters,
}: {
  initialStays: StayCardData[];
  initialFilters: ExploreFilters;
}) {
  const [filters, setFilters] = useState<ExploreFilters>(initialFilters);
  const [stays, setStays] = useState<StayCardData[]>(initialStays);
  const [loading, setLoading] = useState(false);
  // The welcome chooser opens on every entry (a fresh mount = a fresh visit).
  // `introKey` remounts it when reopened via "Adjust", so it restarts at step 1
  // with the current selections. Radix defers the dialog portal to the client,
  // so nothing flashes during hydration.
  const [introOpen, setIntroOpen] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  const skipInitialFetch = useRef(true);

  const dismissIntro = () => setIntroOpen(false);
  const openIntro = () => {
    setIntroKey((k) => k + 1);
    setIntroOpen(true);
  };

  // The part of the filters that actually hits the API (sort is client-side).
  const apiQuery = toApiQuery(filters);

  // Re-fetch when the fetch-affecting filters change — but not on first mount,
  // where the SSR `initialStays` already match the URL.
  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/stays?${apiQuery}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setStays(json.data as StayCardData[]);
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") console.error(error);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [apiQuery]);

  // Back/forward: re-read the filters from the URL (no history push here).
  useEffect(() => {
    const onPopState = () =>
      setFilters(parseFilters(new URLSearchParams(window.location.search)));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // A user-driven change: update state AND push the URL (new history entry).
  const update = (patch: Partial<ExploreFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const qs = toPageQuery(next);
    window.history.pushState(null, "", qs ? `/explore?${qs}` : "/explore");
  };

  const reset = () => update({ ...EMPTY_FILTERS, sort: filters.sort });

  const sorted = useMemo(
    () => sortStays(stays, filters.sort),
    [stays, filters.sort],
  );
  const activeCount = activeFilterCount(filters);

  return (
    <>
      <ExploreIntro
        key={introKey}
        open={introOpen}
        initial={{ budget: filters.budget, guests: filters.guests }}
        onApply={(selection) => {
          update(selection);
          dismissIntro();
        }}
        onSkip={dismissIntro}
      />

      {/* Filters — deliberately NOT sticky; they scroll away with the page. */}
      <div className="border-border border-b">
        <div className="container-page py-3">
          <ExploreToolbar
            filters={filters}
            onUpdate={update}
            onEditPreferences={openIntro}
          />
        </div>
      </div>

      <div className="container-page py-6">
        {/* Count + reset. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-ink text-sm" aria-live="polite">
            <span className="num text-bark font-medium">{sorted.length}</span>{" "}
            {sorted.length === 1 ? "stay" : "stays"}
            {activeCount > 0 &&
              (sorted.length === 1
                ? " matches your filters"
                : " match your filters")}
          </p>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <SlidersHorizontal className="size-4" aria-hidden />
              Clear filters
            </Button>
          )}
        </div>

        {/* Results. While a filter is being fetched, show skeleton cards in
            place of the grid — keeping the previous count so the layout holds
            steady — rather than dimming the old results. */}
        <div className="mt-5">
          {loading ? (
            <CardGridSkeleton count={sorted.length || 6} />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={MapPinOff}
              title="No stays match your filters"
              description="Try widening your budget or removing a filter — our collection is small and every stay is verified."
              action={<Button onClick={reset}>Reset filters</Button>}
            />
          ) : (
            <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((stay, i) => (
                <li key={stay.id}>
                  <StayCard stay={stay} priority={i < 3} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
