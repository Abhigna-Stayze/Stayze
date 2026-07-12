import { notFound, ok, parseQuery, route } from "@/lib/api";
import { reviewQuerySchema } from "@/lib/schemas";
import { getStayBySlug, getStayReviews } from "@/services/stay.service";

/**
 * GET /api/reviews?stay=coffeecharm
 *
 * The flat form of /api/stays/[slug]/reviews, for clients that hold a stay
 * slug and want reviews without walking the nested path — an admin table, say.
 *
 * `stay` is required: there is no global review feed. Reviews only mean
 * anything attached to the property they are about.
 *
 * There is no POST. Guests cannot submit reviews through the API — Review has
 * no link to BookingRequest, so there is no way to establish that a reviewer
 * actually stayed. Reviews are added by ops and moderated with `isPublished`.
 */
export async function GET(request: Request) {
  return route(async () => {
    const { stay: slug } = parseQuery(reviewQuerySchema, request);

    const stay = await getStayBySlug(slug);
    if (!stay) return notFound("No such stay.");

    return ok(await getStayReviews(stay.id));
  });
}
