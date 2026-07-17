"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, BookOpen, X } from "lucide-react";
import type { GuideCard as GuideCardData } from "@/services/types";
import { GuideCard } from "@/components/cards/GuideCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/Reveal";

/**
 * GuideExplorer — the interactive half of the Travel Guide listing.
 *
 * The guide set is small and already loaded on the server, so search and
 * category filtering run **in the browser** over that array — instant, no REST
 * round-trip (the `?category=` endpoint exists for other consumers, but the
 * page doesn't need it). State lives in the URL via the History API, so a
 * filtered view is shareable and back/forward works — the same contract Explore
 * and Experiences hold. Because this renders on the server for the initial HTML
 * too, a shared `?q=`/`?category=` link is already filtered on first paint.
 *
 * Categories come straight from the loaded guides (their real `category`
 * relation), so a chip only ever appears when a guide sits behind it.
 */
export function GuideExplorer({
  guides,
  initialQuery = "",
  initialCategories = [],
}: {
  guides: GuideCardData[];
  initialQuery?: string;
  initialCategories?: string[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const g of guides) {
      if (!seen.has(g.category.slug))
        seen.set(g.category.slug, g.category.name);
    }
    return Array.from(seen, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [guides]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const wanted = new Set(categories);
    return guides.filter((g) => {
      if (wanted.size > 0 && !wanted.has(g.category.slug)) return false;
      if (q) {
        const hay =
          `${g.title} ${g.excerpt ?? ""} ${g.category.name} ${g.author ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [guides, query, categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    categories.forEach((c) => params.append("category", c));
    const qs = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      qs ? `/travel-guide?${qs}` : "/travel-guide",
    );
  }, [query, categories]);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setCategories(params.getAll("category"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toggleCategory = useCallback((value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setCategories([]);
  }, []);

  const isFiltered = query.trim() !== "" || categories.length > 0;

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl">
          <Search
            className="text-muted-ink pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides — waterfalls, cafés, a weekend…"
            aria-label="Search travel guides"
            className="border-input bg-card text-ink placeholder:text-muted-ink/70 focus-visible:ring-ring focus-visible:ring-offset-background h-11 w-full rounded-md border pr-10 pl-10 text-sm transition-[color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-muted-ink hover:text-bark focus-visible:ring-ring absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {categoryOptions.length > 0 && (
          <SearchFilters
            options={categoryOptions}
            selected={categories}
            onToggle={toggleCategory}
          />
        )}
      </div>

      <div className="border-border/70 mt-6 flex items-center justify-between gap-4 border-t pt-4">
        <p className="text-muted-ink text-sm" aria-live="polite">
          <span className="num text-bark font-medium">{results.length}</span>{" "}
          {results.length === 1 ? "guide" : "guides"}
          {isFiltered && " match your search"}
        </p>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((guide, i) => (
            <Reveal key={guide.id} delayMs={Math.min(i, 5) * 40}>
              <GuideCard guide={guide} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={BookOpen}
          title="No guides match that yet"
          description="Try a different word or clear the filters — we’re writing more of Chikmagalur down all the time."
          action={
            <Button variant="outline" onClick={reset}>
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}
