import { ok, parseQuery, route } from "@/lib/api";
import { stayQuerySchema } from "@/lib/schemas";
import { getAllStays, getFeaturedStays } from "@/services/stay.service";

/**
 * GET /api/stays
 *
 *   ?featured=true            the Home row, ordered by featuredOrder
 *   ?tag=pool&tag=luxury      AND semantics — a stay must carry every tag
 *   ?area=Mallandur
 *   ?minPrice= &maxPrice=
 *   ?guests=4                 stays that sleep at least this many
 *   ?limit=10
 *
 * Only published stays are ever returned; the service enforces that.
 */
export async function GET(request: Request) {
  return route(async () => {
    const query = parseQuery(stayQuerySchema, request);

    // Featured is its own ordering (manual, by featuredOrder), so it is a
    // different query rather than a filter on the general one.
    if (query.featured) {
      return ok(await getFeaturedStays(query.limit ?? 3));
    }

    const stays = await getAllStays({
      tags: query.tag,
      area: query.area,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      guests: query.guests,
    });

    return ok(query.limit ? stays.slice(0, query.limit) : stays);
  });
}
