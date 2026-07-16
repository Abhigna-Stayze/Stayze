import "server-only";
import { cache } from "react";
import { getStayBySlug, getRelatedStays } from "@/services/stay.service";
import type { StayCard, StayDetail } from "@/services/types";

/**
 * The Stay Detail page's data, read the architecture's way: a Server Component
 * calls these server-only helpers, which call the service layer — never a
 * self-`fetch` of the REST API, never Prisma directly.
 *
 * `getStayBySlug` is deliberately the only call for the page body. It already
 * returns the images, rooms, experiences, amenities, nearby places, owner and
 * published reviews in one query — the same service the `/reviews` and
 * `/nearby` routes delegate to. Re-fetching those separately would be extra
 * round-trips for data already in hand. Related stays are a genuinely separate
 * query, so they get their own helper (and their own Suspense boundary).
 *
 * `cache()` dedupes within a render: `generateMetadata` and the page body both
 * call `getStayDetail`, and that runs a single query.
 */
export const getStayDetail = cache(
  async (slug: string): Promise<StayDetail | null> => {
    try {
      return await getStayBySlug(slug);
    } catch (error) {
      console.error(`[stay] getStayDetail failed for "${slug}":`, error);
      return null;
    }
  },
);

export const getRelated = cache(async (stayId: string): Promise<StayCard[]> => {
  try {
    return await getRelatedStays(stayId, 3);
  } catch (error) {
    console.error(`[stay] getRelated failed for "${stayId}":`, error);
    return [];
  }
});
