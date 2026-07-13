import {
  created,
  notFound,
  ok,
  parseBody,
  parseQuery,
  requireAdmin,
  route,
} from "@/lib/api";
import { createReviewSchema, reviewQuerySchema } from "@/lib/schemas";
import {
  createReview,
  getAllReviewsForStay,
  getReviewsForStay,
} from "@/services/review.service";
import { getStayBySlug } from "@/services/stay.service";

/**
 * GET /api/reviews?stay=coffeecharm
 *
 * The flat form of /api/stays/[slug]/reviews. `stay` is required — there is no
 * global review feed, because a review only means something attached to the
 * property it is about.
 *
 * `?includeUnpublished=true` returns the moderation queue and REQUIRES the
 * admin key. Unpublished reviews have not been moderated and must never reach
 * the public site.
 *
 * Guest photos come back as short-lived SIGNED urls — the reviews bucket is
 * private. Do not cache them.
 */
export async function GET(request: Request) {
  return route(async () => {
    const { stay: slug, includeUnpublished } = parseQuery(
      reviewQuerySchema,
      request,
    );

    if (includeUnpublished) requireAdmin(request);

    const stay = await getStayBySlug(slug);
    if (!stay) return notFound("No such stay.");

    return ok(
      includeUnpublished
        ? await getAllReviewsForStay(stay.id)
        : await getReviewsForStay(stay.id),
    );
  });
}

/**
 * POST /api/reviews
 *
 * Create a review. ADMIN ONLY, and deliberately so: `Review` has no link to
 * `BookingRequest`, so there is no way to establish that whoever posted it ever
 * stayed. Until that link exists, reviews are entered by ops — including the
 * imported Airbnb and Google ones, which is what `source` is for.
 *
 * Defaults to `isPublished: false`. A new review does not move the stay's
 * rating until someone publishes it.
 */
export async function POST(request: Request) {
  return route(async () => {
    requireAdmin(request);

    const body = await parseBody(createReviewSchema, request);
    const result = await createReview({
      staySlug: body.staySlug,
      guestName: body.guestName,
      rating: body.rating,
      title: body.title ?? null,
      comment: body.comment,
      stayedOn: body.stayedOn ?? null,
      source: body.source,
      isPublished: body.isPublished ?? false,
    });

    return created(result);
  });
}
