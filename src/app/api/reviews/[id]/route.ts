import { ok, parseBody, requireAdmin, route } from "@/lib/api";
import { updateReviewSchema } from "@/lib/schemas";
import { deleteReview, updateReview } from "@/services/review.service";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/reviews/[id]
 *
 * Edit a review — including publishing and unpublishing it, which are just
 * `isPublished` changing.
 *
 * ADMIN ONLY.
 *
 * Every one of these moves the stay's denormalised rating, and the service
 * recomputes it inside the same transaction. That is why the response carries
 * the new `ratingAvg` and `reviewCount`: the caller can update its view without
 * a second request, and — more importantly — it makes the recalculation
 * something you can see rather than something you have to trust.
 *
 * The route contains no logic. It validates and calls the service.
 */
export async function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    requireAdmin(request);

    const { id } = await params;
    const body = await parseBody(updateReviewSchema, request);

    return ok(await updateReview(id, body));
  });
}

/**
 * DELETE /api/reviews/[id]
 *
 * ADMIN ONLY. Removes the review and recomputes the stay's rating.
 *
 * The review's photo ROWS cascade with it. The storage OBJECTS do not — delete
 * those through `DELETE /api/media/review-image/[id]` BEFORE deleting the
 * review, or they are orphaned in the bucket. Postgres cannot reach into
 * Supabase Storage, and pretending otherwise is how buckets fill up with files
 * nothing points at.
 */
export async function DELETE(request: Request, { params }: Params) {
  return route(async () => {
    requireAdmin(request);

    const { id } = await params;
    return ok(await deleteReview(id));
  });
}
