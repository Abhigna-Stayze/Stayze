import { z } from "zod";
import { ok, parseBody, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import {
  publishReview,
  unpublishReview,
  deleteReview,
} from "@/services/review.service";

type Params = { params: Promise<{ reviewId: string }> };

const patchSchema = z.object({ isPublished: z.boolean() });

/**
 * PATCH  /api/admin/reviews/:reviewId  — approve (publish) / hide (unpublish).
 * DELETE /api/admin/reviews/:reviewId  — remove entirely.
 *
 * Content is never edited — moderation only. All three go through the review
 * service, which recomputes the stay's denormalised rating in the same
 * transaction, so the star average on the public card stays true.
 */
export async function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { reviewId } = await params;
    const { isPublished } = await parseBody(patchSchema, request);
    const result = isPublished
      ? await publishReview(reviewId)
      : await unpublishReview(reviewId);
    return ok(result);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { reviewId } = await params;
    return ok(await deleteReview(reviewId));
  });
}
