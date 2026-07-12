import { notFound, ok, route } from "@/lib/api";
import { slugSchema } from "@/lib/schemas";
import { getStayBySlug, getStayReviews } from "@/services/stay.service";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/stays/[slug]/reviews
 *
 * Published reviews only, most recent stay first, with guest photos.
 * Unpublished reviews are awaiting moderation and never leave the database.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { slug } = await params;

    const stay = await getStayBySlug(slugSchema.parse(slug));
    if (!stay) return notFound("No such stay.");

    return ok(await getStayReviews(stay.id));
  });
}
