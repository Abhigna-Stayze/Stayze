import type { StayCard } from "@/services/types";

/**
 * The Explore filter/sort vocabulary and the pure functions that move it
 * between a URL and a filter object, and sort a result set.
 *
 * This module is **pure and framework-free** — no `server-only`, no data
 * access, no React. Both sides use it: the Server Component parses `searchParams`
 * with `parseFilters`, and the Client Component serialises back to the URL and
 * builds the `/api/stays` query. `StayCard` is a **type-only** import, so the
 * `server-only` guard in `services/types` is erased at compile time and never
 * reaches the client bundle.
 *
 * Filters live entirely in the URL query string, which is what makes an Explore
 * view shareable, bookmarkable and back/forward-navigable.
 */

export type SortValue =
  "recommended" | "price-asc" | "price-desc" | "rating" | "newest";

/** The filter chips — real tag slugs the API filters on (AND semantics). */
export const TAG_FILTERS = [
  { label: "Couples", slug: "couples" },
  { label: "Family", slug: "family" },
  { label: "Luxury", slug: "luxury" },
  { label: "Pet friendly", slug: "pet-friendly" },
  { label: "Pool", slug: "pool" },
  { label: "Coffee estate", slug: "coffee-estate" },
  { label: "Workation", slug: "workation" },
] as const;

/** Budget brackets → the API's minPrice/maxPrice. */
export const BUDGET_OPTIONS: Array<{
  value: string;
  label: string;
  min?: number;
  max?: number;
}> = [
  { value: "", label: "Any budget" },
  { value: "0-5000", label: "Under ₹5,000", max: 5000 },
  { value: "5000-10000", label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { value: "10000-", label: "₹10,000+", min: 10000 },
];

/** Minimum group size → the API's `guests` (stays that sleep at least N). */
export const GUEST_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Any group size" },
  { value: "2", label: "2+ guests" },
  { value: "4", label: "4+ guests" },
  { value: "6", label: "6+ guests" },
  { value: "8", label: "8+ guests" },
];

export const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

export type ExploreFilters = {
  tags: string[];
  /** A `BUDGET_OPTIONS` value, or "" for any. */
  budget: string;
  /** Minimum group size, or null for any. */
  guests: number | null;
  sort: SortValue;
};

export const EMPTY_FILTERS: ExploreFilters = {
  tags: [],
  budget: "",
  guests: null,
  sort: "recommended",
};

const VALID_TAGS = new Set<string>(TAG_FILTERS.map((t) => t.slug));
const VALID_BUDGETS = new Set(BUDGET_OPTIONS.map((b) => b.value));
const VALID_GUESTS = new Set(GUEST_OPTIONS.map((g) => g.value));
const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((s) => s.value));

/** Read a validated filter set from URL params (unknown values are dropped). */
export function parseFilters(params: URLSearchParams): ExploreFilters {
  const tags = [...new Set(params.getAll("tag"))].filter((t) =>
    VALID_TAGS.has(t),
  );
  const budget = params.get("budget") ?? "";
  const guestsRaw = params.get("guests") ?? "";
  const sort = params.get("sort") ?? "recommended";

  return {
    tags,
    budget: VALID_BUDGETS.has(budget) ? budget : "",
    guests: VALID_GUESTS.has(guestsRaw) && guestsRaw ? Number(guestsRaw) : null,
    sort: (VALID_SORTS.has(sort) ? sort : "recommended") as SortValue,
  };
}

export function budgetRange(budget: string): { min?: number; max?: number } {
  const opt = BUDGET_OPTIONS.find((b) => b.value === budget);
  return { min: opt?.min, max: opt?.max };
}

/** Query string for `GET /api/stays` — filters only; the API does not sort. */
export function toApiQuery(f: ExploreFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach((t) => p.append("tag", t));
  const { min, max } = budgetRange(f.budget);
  if (min !== undefined) p.set("minPrice", String(min));
  if (max !== undefined) p.set("maxPrice", String(max));
  if (f.guests) p.set("guests", String(f.guests));
  return p.toString();
}

/** Query string for the page URL — includes budget + sort for shareability. */
export function toPageQuery(f: ExploreFilters): string {
  const p = new URLSearchParams();
  f.tags.forEach((t) => p.append("tag", t));
  if (f.budget) p.set("budget", f.budget);
  if (f.guests) p.set("guests", String(f.guests));
  if (f.sort !== "recommended") p.set("sort", f.sort);
  return p.toString();
}

/** How many *filters* (not sort) are active — drives the reset affordance. */
export function activeFilterCount(f: ExploreFilters): number {
  return f.tags.length + (f.budget ? 1 : 0) + (f.guests ? 1 : 0);
}

/**
 * Sort a result set client-side (the API returns "recommended" order —
 * fitScore desc, then newest). `createdAt` may arrive as a Date (from the SSR
 * prop) or an ISO string (from the REST fetch), so it is coerced.
 */
export function sortStays(stays: StayCard[], sort: SortValue): StayCard[] {
  const arr = [...stays];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.basePricePerNight - b.basePricePerNight);
    case "price-desc":
      return arr.sort((a, b) => b.basePricePerNight - a.basePricePerNight);
    case "rating":
      return arr.sort((a, b) => (b.ratingAvg ?? -1) - (a.ratingAvg ?? -1));
    case "newest":
      return arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    default:
      return arr;
  }
}
