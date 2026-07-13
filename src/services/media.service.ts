import "server-only";
import { prisma } from "@/lib/prisma";
import { deleteFile, type MediaRef } from "@/lib/storage";
import type { MediaType } from "@/generated/prisma/enums";

/**
 * Media — the bridge between a Storage object and the row that points at it.
 *
 * Postgres holds `bucket` + `path`; Supabase Storage holds the bytes. Nothing
 * keeps the two in step automatically: a cascade delete removes child ROWS and
 * leaves the FILES behind. Every function here changes both, in the order that
 * fails least badly.
 *
 * **The ordering rule.** When removing media, the ROW goes first, then the
 * OBJECT. If the object delete then fails we are left with an orphaned file —
 * wasted bytes nobody sees. The other order risks a row pointing at a file that
 * no longer exists, which renders as a broken image on the live site. An
 * invisible orphan beats a visible hole.
 *
 * When REPLACING single-reference media (an owner's photo, a room's image), the
 * row is repointed first and only then is the old object deleted, so a failure
 * mid-way leaves the new image working and the old one orphaned.
 */

export type ImageMeta = {
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  mimeType?: string | null;
};

// ---------------------------------------------------------------------------
// StayImage — the gallery. A collection, so add/remove rather than set.
// ---------------------------------------------------------------------------

export async function addStayImage(input: {
  staySlug: string;
  ref: MediaRef;
  altText?: string | null;
  caption?: string | null;
  mediaType?: MediaType;
  isHero?: boolean;
  sortOrder?: number;
  meta?: ImageMeta;
}): Promise<{ id: string }> {
  const stay = await prisma.stay.findUnique({
    where: { slug: input.staySlug },
    select: { id: true },
  });
  if (!stay) throw new MediaError(`No stay with slug "${input.staySlug}".`);

  // A stay has exactly one hero. Promoting a new one demotes the old, in a
  // transaction — two heroes would make the card image non-deterministic.
  return prisma.$transaction(async (tx) => {
    if (input.isHero) {
      await tx.stayImage.updateMany({
        where: { stayId: stay.id, isHero: true },
        data: { isHero: false },
      });
    }

    // Append to the end unless told otherwise.
    const sortOrder =
      input.sortOrder ??
      (await tx.stayImage.count({ where: { stayId: stay.id } }));

    return tx.stayImage.create({
      data: {
        stayId: stay.id,
        bucket: input.ref.bucket,
        path: input.ref.path,
        altText: input.altText ?? null,
        caption: input.caption ?? null,
        mediaType: input.mediaType ?? "PHOTO",
        isHero: input.isHero ?? false,
        sortOrder,
        width: input.meta?.width ?? null,
        height: input.meta?.height ?? null,
        fileSize: input.meta?.fileSize ?? null,
        mimeType: input.meta?.mimeType ?? null,
      },
      select: { id: true },
    });
  });
}

/**
 * Removes the row and the object. Returns false if the row did not exist.
 *
 * If the image was the hero, the next one by sort order is promoted. A stay
 * with images but no hero renders from a fallback, which is a silent trap: the
 * card looks fine until someone reorders the gallery and the picture changes
 * for no visible reason. A stay with images always has exactly one hero.
 */
export async function deleteStayImage(id: string): Promise<boolean> {
  const image = await prisma.stayImage.findUnique({
    where: { id },
    select: { bucket: true, path: true, stayId: true, isHero: true },
  });
  if (!image) return false;

  await prisma.$transaction(async (tx) => {
    await tx.stayImage.delete({ where: { id } });

    if (image.isHero) {
      const successor = await tx.stayImage.findFirst({
        where: { stayId: image.stayId },
        orderBy: { sortOrder: "asc" },
        select: { id: true },
      });
      if (successor) {
        await tx.stayImage.update({
          where: { id: successor.id },
          data: { isHero: true },
        });
      }
    }
  });

  await deleteObjectQuietly({ bucket: image.bucket, path: image.path });
  return true;
}

// ---------------------------------------------------------------------------
// ReviewImage — guest photos. Also a collection.
// ---------------------------------------------------------------------------

export async function addReviewImage(input: {
  reviewId: string;
  ref: MediaRef;
  meta?: ImageMeta;
}): Promise<{ id: string }> {
  const review = await prisma.review.findUnique({
    where: { id: input.reviewId },
    select: { id: true },
  });
  if (!review) throw new MediaError(`No review with id "${input.reviewId}".`);

  return prisma.reviewImage.create({
    data: {
      reviewId: review.id,
      bucket: input.ref.bucket,
      path: input.ref.path,
      width: input.meta?.width ?? null,
      height: input.meta?.height ?? null,
      fileSize: input.meta?.fileSize ?? null,
      mimeType: input.meta?.mimeType ?? null,
    },
    select: { id: true },
  });
}

export async function deleteReviewImage(id: string): Promise<boolean> {
  const image = await prisma.reviewImage.findUnique({
    where: { id },
    select: { bucket: true, path: true },
  });
  if (!image) return false;

  await prisma.reviewImage.delete({ where: { id } });
  await deleteObjectQuietly(image);
  return true;
}

// ---------------------------------------------------------------------------
// Single-reference media — one image per row. Set, or clear.
// ---------------------------------------------------------------------------

/** Repoint the row, then bin whatever it used to point at. */
export async function setOwnerPhoto(
  ownerId: string,
  ref: MediaRef | null,
): Promise<void> {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { photoBucket: true, photoPath: true },
  });
  if (!owner) throw new MediaError(`No owner with id "${ownerId}".`);

  await prisma.owner.update({
    where: { id: ownerId },
    data: {
      photoBucket: ref?.bucket ?? null,
      photoPath: ref?.path ?? null,
    },
  });

  await replaceObject(
    { bucket: owner.photoBucket, path: owner.photoPath },
    ref,
  );
}

export async function setRoomImage(
  roomId: string,
  ref: MediaRef | null,
): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { imageBucket: true, imagePath: true },
  });
  if (!room) throw new MediaError(`No room with id "${roomId}".`);

  await prisma.room.update({
    where: { id: roomId },
    data: { imageBucket: ref?.bucket ?? null, imagePath: ref?.path ?? null },
  });

  await replaceObject({ bucket: room.imageBucket, path: room.imagePath }, ref);
}

/**
 * The image now lives on the standalone Experience, not on the per-stay row.
 * `experienceRef` is the experience's SLUG — StayExperience no longer has an id
 * of its own, it is a junction.
 */
export async function setExperienceImage(
  experienceSlug: string,
  ref: MediaRef | null,
): Promise<void> {
  const exp = await prisma.experience.findUnique({
    where: { slug: experienceSlug },
    select: { id: true, bucket: true, path: true },
  });
  if (!exp) {
    throw new MediaError(`No experience with slug "${experienceSlug}".`);
  }

  await prisma.experience.update({
    where: { id: exp.id },
    data: { bucket: ref?.bucket ?? null, path: ref?.path ?? null },
  });

  await replaceObject({ bucket: exp.bucket, path: exp.path }, ref);
}

export async function setNearbyPlaceImage(
  placeId: string,
  ref: MediaRef | null,
): Promise<void> {
  const place = await prisma.nearbyPlace.findUnique({
    where: { id: placeId },
    select: { imageBucket: true, imagePath: true },
  });
  if (!place) throw new MediaError(`No nearby place with id "${placeId}".`);

  await prisma.nearbyPlace.update({
    where: { id: placeId },
    data: { imageBucket: ref?.bucket ?? null, imagePath: ref?.path ?? null },
  });

  await replaceObject(
    { bucket: place.imageBucket, path: place.imagePath },
    ref,
  );
}

export async function setGuideCover(
  guideSlug: string,
  ref: MediaRef | null,
): Promise<void> {
  const guide = await prisma.travelGuide.findUnique({
    where: { slug: guideSlug },
    select: { id: true, coverImageBucket: true, coverImagePath: true },
  });
  if (!guide) throw new MediaError(`No guide with slug "${guideSlug}".`);

  await prisma.travelGuide.update({
    where: { id: guide.id },
    data: {
      coverImageBucket: ref?.bucket ?? null,
      coverImagePath: ref?.path ?? null,
    },
  });

  await replaceObject(
    { bucket: guide.coverImageBucket, path: guide.coverImagePath },
    ref,
  );
}

// ---------------------------------------------------------------------------

/**
 * Bin the object a row used to point at — unless the row still points at it.
 *
 * That guard matters: re-uploading over the same path (`upsert=true`) means the
 * old and new reference are identical, and deleting the "old" one would delete
 * the file we just wrote.
 */
async function replaceObject(
  previous: { bucket: string | null; path: string | null },
  next: MediaRef | null,
): Promise<void> {
  if (!previous.bucket || !previous.path) return;
  if (next && next.bucket === previous.bucket && next.path === previous.path) {
    return;
  }
  await deleteObjectQuietly({ bucket: previous.bucket, path: previous.path });
}

/**
 * The row is already gone. A failure to delete the file leaves an orphan —
 * wasted storage, but nothing a user can see — so it is logged, not thrown.
 * Throwing here would report failure for an operation that mostly succeeded.
 */
async function deleteObjectQuietly(ref: MediaRef): Promise<void> {
  try {
    await deleteFile(ref);
  } catch (error) {
    console.error(
      `[media] orphaned object ${ref.bucket}/${ref.path} — row deleted, file remains:`,
      error,
    );
  }
}

export class MediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaError";
  }
}
