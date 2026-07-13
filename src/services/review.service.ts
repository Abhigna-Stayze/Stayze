import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { ReviewSource } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { toReviews } from "@/services/mappers";
import type { ReviewView } from "@/services/types";

/**
 * Reviews — and the denormalised rating on Stay.
 *
 * `Stay.ratingAvg` and `Stay.reviewCount` are copies. Nothing in Postgres keeps
 * them true: no trigger, no computed column. They exist because the Explore
 * grid and the stay cards must be fast, and recomputing an average across every
 * review on every card render is not fast.
 *
 * **That means every write that could change the answer must recompute it.**
 * Publishing a review, unpublishing it, editing its rating, deleting it — all of
 * them. Miss one and the number on the card quietly drifts away from the
 * reviews underneath it, which is the kind of bug nobody reports and everybody
 * notices.
 *
 * So: no route, and no other service, writes `ratingAvg` or `reviewCount`. They
 * are written here and only here, inside the same transaction as the change
 * that made them stale.
 *
 * Only PUBLISHED reviews count. An unpublished review is awaiting moderation
 * and must not move the average.
 */

/**
 * Recompute the stay's rating from its published reviews.
 *
 * Runs inside the caller's transaction, so the review change and the rating
 * update commit together or not at all. A crash between them would leave a
 * published review that the card does not count.
 *
 * A stay with no published reviews gets `ratingAvg: null` — not zero. Zero is a
 * rating, and it would render as a one-star property; null means "no reviews
 * yet", which is what the UI must show.
 */
async function recalculateRating(
  tx: Prisma.TransactionClient,
  stayId: string,
): Promise<{ ratingAvg: number | null; reviewCount: number }> {
  const result = await tx.review.aggregate({
    where: { stayId, isPublished: true },
    _avg: { rating: true },
    _count: true,
  });

  const reviewCount = result._count;
  const average = result._avg.rating;

  // Decimal(3,2): 4.6, not 4.6000000000000005.
  const ratingAvg =
    reviewCount > 0 && average !== null
      ? Number(Number(average).toFixed(2))
      : null;

  await tx.stay.update({
    where: { id: stayId },
    data: { ratingAvg, reviewCount },
  });

  return { ratingAvg, reviewCount };
}

/** The shape every mutating call returns, so a caller can show the new number. */
export type RatingResult = {
  stayId: string;
  ratingAvg: number | null;
  reviewCount: number;
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Published reviews for a stay. Guest photos come back as signed URLs. */
export async function getReviewsForStay(stayId: string): Promise<ReviewView[]> {
  const reviews = await prisma.review.findMany({
    where: { stayId, isPublished: true },
    orderBy: { stayedOn: "desc" },
    include: { images: true },
  });

  return toReviews(reviews);
}

/**
 * Every review for a stay, published or not — the moderation queue.
 * Admin only; the public endpoints must never call this.
 */
export async function getAllReviewsForStay(
  stayId: string,
): Promise<ReviewView[]> {
  const reviews = await prisma.review.findMany({
    where: { stayId },
    orderBy: [{ isPublished: "asc" }, { stayedOn: "desc" }],
    include: { images: true },
  });

  return toReviews(reviews);
}

// ---------------------------------------------------------------------------
// Writes — each one recomputes the rating
// ---------------------------------------------------------------------------

export type CreateReviewInput = {
  staySlug: string;
  guestName: string;
  rating: number;
  title?: string | null;
  comment: string;
  stayedOn?: Date | null;
  source: ReviewSource;
  /** Defaults to false: moderate before it counts. */
  isPublished?: boolean;
};

export async function createReview(
  input: CreateReviewInput,
): Promise<{ id: string } & RatingResult> {
  const stay = await prisma.stay.findUnique({
    where: { slug: input.staySlug },
    select: { id: true },
  });
  if (!stay) throw new ReviewError(`No stay with slug "${input.staySlug}".`);
  assertRating(input.rating);

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        stayId: stay.id,
        guestName: input.guestName,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment,
        stayedOn: input.stayedOn ?? null,
        source: input.source,
        isPublished: input.isPublished ?? false,
      },
      select: { id: true },
    });

    // Only matters if it was created already-published, but recomputing
    // unconditionally is cheaper than remembering to think about it.
    const rating = await recalculateRating(tx, stay.id);
    return { id: review.id, stayId: stay.id, ...rating };
  });
}

export type UpdateReviewInput = {
  guestName?: string;
  rating?: number;
  title?: string | null;
  comment?: string;
  stayedOn?: Date | null;
  source?: ReviewSource;
  isPublished?: boolean;
};

/**
 * Edit a review. Covers publish and unpublish too — they are just
 * `isPublished` changing, and both move the average.
 */
export async function updateReview(
  id: string,
  input: UpdateReviewInput,
): Promise<RatingResult> {
  const existing = await prisma.review.findUnique({
    where: { id },
    select: { stayId: true },
  });
  if (!existing) throw new ReviewError(`No review with id "${id}".`);
  if (input.rating !== undefined) assertRating(input.rating);

  return prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id }, data: input });
    const rating = await recalculateRating(tx, existing.stayId);
    return { stayId: existing.stayId, ...rating };
  });
}

/** Publish a review — it now counts towards the stay's rating. */
export function publishReview(id: string): Promise<RatingResult> {
  return updateReview(id, { isPublished: true });
}

/** Unpublish — it stops counting, and the average moves back. */
export function unpublishReview(id: string): Promise<RatingResult> {
  return updateReview(id, { isPublished: false });
}

/**
 * Delete a review and its photos.
 *
 * The ReviewImage ROWS cascade. The storage OBJECTS do not — the caller is
 * responsible for those, because storage and the database are separate systems
 * and this service does not reach into Supabase. Use media.service to remove
 * the images first, or they are orphaned. See the API route.
 */
export async function deleteReview(id: string): Promise<RatingResult> {
  const existing = await prisma.review.findUnique({
    where: { id },
    select: { stayId: true },
  });
  if (!existing) throw new ReviewError(`No review with id "${id}".`);

  return prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });
    const rating = await recalculateRating(tx, existing.stayId);
    return { stayId: existing.stayId, ...rating };
  });
}

/**
 * Recompute every stay's rating from scratch.
 *
 * A repair tool, not part of any request path. If the denormalised numbers ever
 * drift — a bad import, a hand-written UPDATE, a bug in here — this is what puts
 * them right.
 */
export async function recalculateAllRatings(): Promise<RatingResult[]> {
  const stays = await prisma.stay.findMany({ select: { id: true } });

  const results: RatingResult[] = [];
  for (const stay of stays) {
    const rating = await prisma.$transaction((tx) =>
      recalculateRating(tx, stay.id),
    );
    results.push({ stayId: stay.id, ...rating });
  }
  return results;
}

// ---------------------------------------------------------------------------

function assertRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewError("Rating must be a whole number from 1 to 5.");
  }
}

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}
