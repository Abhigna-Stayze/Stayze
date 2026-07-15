import "server-only";
import { getAllStays } from "@/services/stay.service";
import { budgetRange, type ExploreFilters } from "./explore-filters";
import type { StayCard } from "@/services/types";

/**
 * The Explore page's initial, server-rendered result set.
 *
 * A Server Component calls this with the filters parsed from the URL; it reads
 * through the service layer (never a self-fetch of `/api/stays`, per the
 * architecture) so the first paint is real, SSR'd HTML for any filter URL —
 * good for SEO and shareable links. Subsequent interactive filtering is done
 * client-side against the REST API. Degrades to an empty list on a DB error so
 * the page renders its empty state rather than 500-ing.
 */
export async function getExploreStays(
  filters: ExploreFilters,
): Promise<StayCard[]> {
  try {
    const { min, max } = budgetRange(filters.budget);
    return await getAllStays({
      tags: filters.tags,
      minPrice: min,
      maxPrice: max,
      guests: filters.guests ?? undefined,
    });
  } catch (error) {
    console.error("[explore] getExploreStays failed:", error);
    return [];
  }
}
