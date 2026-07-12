import { ok, parseQuery, route } from "@/lib/api";
import { guideQuerySchema } from "@/lib/schemas";
import { getAllGuides, getFeaturedGuides } from "@/services/guide.service";

/**
 * GET /api/guides
 *
 *   ?featured=true       the latest few — the "Travel Inspiration" row on Home
 *   ?category=itineraries
 *   ?limit=10
 *
 * Published guides only.
 */
export async function GET(request: Request) {
  return route(async () => {
    const query = parseQuery(guideQuerySchema, request);

    if (query.featured) {
      return ok(await getFeaturedGuides(query.limit ?? 3));
    }

    const guides = await getAllGuides(query.category);
    return ok(query.limit ? guides.slice(0, query.limit) : guides);
  });
}
