import { notFound, ok, route } from "@/lib/api";
import { slugSchema } from "@/lib/schemas";
import { getStayBySlug } from "@/services/stay.service";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/stays/[slug]
 *
 * The full Stay Detail payload: images, rooms, highlights, experiences,
 * amenities, nearby places, published reviews and the owner's public profile.
 *
 * 404 for an unknown slug AND for a stay that exists but is not published —
 * the two are indistinguishable from outside, which is the point.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { slug } = await params;
    const stay = await getStayBySlug(slugSchema.parse(slug));

    if (!stay) return notFound("No such stay.");
    return ok(stay);
  });
}
