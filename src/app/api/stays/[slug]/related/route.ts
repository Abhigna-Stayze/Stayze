import { notFound, ok, parseQuery, route } from "@/lib/api";
import { slugSchema, stayQuerySchema } from "@/lib/schemas";
import { getRelatedStays, getStayBySlug } from "@/services/stay.service";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/stays/[slug]/related?limit=3
 *
 * "Similar stays" — ranked by shared tags, then same area, then FitScore.
 * Never empty for a published stay: it falls back to any other published one.
 */
export async function GET(request: Request, { params }: Params) {
  return route(async () => {
    const { slug } = await params;
    const { limit } = parseQuery(stayQuerySchema, request);

    const stay = await getStayBySlug(slugSchema.parse(slug));
    if (!stay) return notFound("No such stay.");

    return ok(await getRelatedStays(stay.id, limit ?? 3));
  });
}
