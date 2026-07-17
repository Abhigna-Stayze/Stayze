"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Compass, X } from "lucide-react";
import type { ExperienceCard as ExperienceCardData } from "@/services/types";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/Reveal";
import { availableThemes, filterExperiences } from "@/lib/experience-themes";

/**
 * ExperiencesExplorer — the interactive half of the listing.
 *
 * The whole set is small and already loaded on the server, so filtering happens
 * **in the browser over that array** — instant, no REST round-trip (the
 * architecture reserves the API for interactivity that genuinely needs the
 * server, and this doesn't). What it does keep honest is the *URL*: the search
 * text and selected themes live in the query string via the History API, so a
 * filtered view is shareable, bookmarkable and survives back/forward — the same
 * contract Explore holds.
 *
 * Filtering and the theme vocabulary come from the pure `experience-themes`
 * module, shared with the server's first paint, so there is one classifier.
 */
export function ExperiencesExplorer({
  experiences,
  initialQuery = "",
  initialThemes = [],
}: {
  experiences: ExperienceCardData[];
  initialQuery?: string;
  initialThemes?: string[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [themes, setThemes] = useState<string[]>(initialThemes);

  // Only themes with real experiences behind them ever become chips.
  const themeOptions = useMemo(
    () =>
      availableThemes(experiences).map((t) => ({
        label: t.label,
        value: t.value,
      })),
    [experiences],
  );

  const results = useMemo(
    () => filterExperiences(experiences, { query, themes }),
    [experiences, query, themes],
  );

  // Reflect state into the URL without a server round-trip. Keeps the address
  // bar shareable and the back button meaningful.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    themes.forEach((t) => params.append("theme", t));
    const qs = params.toString();
    const url = qs ? `/experiences?${qs}` : "/experiences";
    window.history.replaceState(window.history.state, "", url);
  }, [query, themes]);

  // Honour back/forward: re-read the query string when the user navigates.
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setThemes(params.getAll("theme"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toggleTheme = useCallback((value: string) => {
    setThemes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setThemes([]);
  }, []);

  const isFiltered = query.trim() !== "" || themes.length > 0;

  return (
    <div>
      {/* Search + filters. Not sticky — it scrolls away with the page, matching
          Explore, so the first row of experiences is never crowded. */}
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
            placeholder="Search experiences — coffee, sunrise, a walk…"
            aria-label="Search experiences"
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

        {themeOptions.length > 0 && (
          <SearchFilters
            options={themeOptions}
            selected={themes}
            onToggle={toggleTheme}
          />
        )}
      </div>

      {/* Count + reset. Announced politely so a filter change reaches a screen
          reader without stealing focus. */}
      <div className="border-border/70 mt-6 flex items-center justify-between gap-4 border-t pt-4">
        <p className="text-muted-ink text-sm" aria-live="polite">
          <span className="num text-bark font-medium">{results.length}</span>{" "}
          {results.length === 1 ? "experience" : "experiences"}
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
          {results.map((experience, i) => (
            <Reveal key={experience.id} delayMs={Math.min(i, 5) * 40}>
              <ExperienceCard experience={experience} priority={i < 3} />
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          icon={Compass}
          title="Nothing matches that yet"
          description="Try a different word or clear the filters — every Stayze experience is a short drive from a stay."
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
