import { notFound, ok, route } from "@/lib/api";
import { slugSchema } from "@/lib/schemas";
import { getNearbyPlaces, getStayBySlug } from "@/services/stay.service";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/stays/[slug]/nearby
 *
 * "Places to visit around this stay" — scoped to one stay by design. There is
 * no destination-wide activities table, so there is no /api/nearby.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { slug } = await params;

    // Resolve the slug through the same published-only path the detail page
    // uses, so an unpublished stay cannot leak its data one endpoint sideways.
    const stay = await getStayBySlug(slugSchema.parse(slug));
    if (!stay) return notFound("No such stay.");

    return ok(await getNearbyPlaces(stay.id));
  });
}
