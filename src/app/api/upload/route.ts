import { BadRequestError, created, fail, requireAdmin, route } from "@/lib/api";
import { rateLimit, UPLOAD_LIMIT } from "@/lib/rate-limit";
import {
  ALLOWED_UPLOAD_TYPES,
  attachSchema,
  MAX_UPLOAD_BYTES,
  uploadSchema,
  type AttachTarget,
} from "@/lib/schemas";
import {
  deleteFile,
  getPublicUrl,
  uploadFile,
  type MediaRef,
} from "@/lib/storage";
import {
  addReviewImage,
  addStayImage,
  setExperienceImage,
  setGuideCover,
  setNearbyPlaceImage,
  setOwnerPhoto,
  setRoomImage,
  type ImageMeta,
} from "@/services/media.service";

/**
 * POST /api/upload   (multipart/form-data)
 *
 * Fields:
 *   file      the image
 *   bucket    stays | owners | reviews | guides | experiences
 *   path      e.g. property-001/hero.jpg
 *   upsert    "true" to overwrite an existing object (default false)
 *
 * Optionally, attach it to a row in the same request:
 *   target    stay-image | review-image | owner-photo | room-image |
 *             experience-image | nearby-image | guide-cover
 *   targetId  the row's id — except stay-image and guide-cover, which take a SLUG
 *   altText, caption, isHero, sortOrder   (stay-image only)
 *
 * 201 -> { bucket, path, publicUrl, size, contentType, attached? }
 *
 * PROTECTED. Requires the `x-admin-key` header — this writes to Storage with the
 * service-role key, so leaving it open would let anyone fill the buckets or
 * overwrite a hero image.
 *
 * **Attach failures roll the upload back.** If the row cannot be written — an
 * unknown stay, a duplicate path — the object we just put in the bucket is
 * deleted again. Without that, every failed attach leaves an orphan.
 *
 * Upload without a `target` is still allowed, and still leaves an orphan if the
 * caller never attaches it. Pass `target` unless you have a reason not to.
 */
export async function POST(request: Request) {
  return route(async () => {
    requireAdmin(request);
    rateLimit(request, UPLOAD_LIMIT);

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new BadRequestError("Expected multipart/form-data.");
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new BadRequestError("Field 'file' is required and must be a file.");
    }

    // Validate everything before touching the bytes.
    const { bucket, path, upsert } = uploadSchema.parse({
      bucket: form.get("bucket"),
      path: form.get("path"),
      upsert: form.get("upsert") ?? undefined,
    });

    const rawTarget = form.get("target");
    const attach = rawTarget
      ? attachSchema.parse({
          target: rawTarget,
          targetId: form.get("targetId"),
          altText: form.get("altText") ?? undefined,
          caption: form.get("caption") ?? undefined,
          isHero: form.get("isHero") ?? undefined,
          sortOrder: form.get("sortOrder") ?? undefined,
        })
      : null;

    // Refuse anything that is not an image we are prepared to serve. Trusting
    // the client's Content-Type is weak, but combined with a bucket allowlist,
    // a size cap and an admin key it is proportionate.
    const contentType = file.type;
    if (
      !ALLOWED_UPLOAD_TYPES.includes(
        contentType as (typeof ALLOWED_UPLOAD_TYPES)[number],
      )
    ) {
      return fail(
        `Unsupported type "${contentType || "unknown"}". Allowed: ${ALLOWED_UPLOAD_TYPES.join(", ")}.`,
        415,
      );
    }

    if (file.size === 0) throw new BadRequestError("File is empty.");
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail(
        `File is ${(file.size / 1_048_576).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1_048_576} MB.`,
        413,
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Everything goes through the storage service; the route never touches the
    // Supabase client.
    const ref = await uploadFile(bucket, path, bytes, { contentType, upsert });

    if (!attach) {
      return created({
        ...ref,
        publicUrl: getPublicUrl(ref),
        size: file.size,
        contentType,
      });
    }

    const meta: ImageMeta = { fileSize: file.size, mimeType: contentType };

    let attached: { id: string } | { ok: true };
    try {
      attached = await attachToRow(attach, ref, meta);
    } catch (error) {
      // The row was not written. Do not leave the object behind.
      await deleteFile(ref).catch((cleanupError) => {
        console.error(
          `[upload] rollback failed — ${ref.bucket}/${ref.path} is now orphaned:`,
          cleanupError,
        );
      });
      throw error;
    }

    return created({
      ...ref,
      publicUrl: getPublicUrl(ref),
      size: file.size,
      contentType,
      attached: { target: attach.target, ...attached },
    });
  });
}

type Attach = {
  target: AttachTarget;
  targetId: string;
  altText?: string;
  caption?: string;
  isHero?: boolean;
  sortOrder?: number;
};

/** Dispatch to the media service. No Prisma here. */
async function attachToRow(
  attach: Attach,
  ref: MediaRef,
  meta: ImageMeta,
): Promise<{ id: string } | { ok: true }> {
  switch (attach.target) {
    case "stay-image":
      // targetId is the stay's SLUG.
      return addStayImage({
        staySlug: attach.targetId,
        ref,
        altText: attach.altText ?? null,
        caption: attach.caption ?? null,
        isHero: attach.isHero ?? false,
        sortOrder: attach.sortOrder,
        meta,
      });

    case "review-image":
      return addReviewImage({ reviewId: attach.targetId, ref, meta });

    case "owner-photo":
      await setOwnerPhoto(attach.targetId, ref);
      return { ok: true };

    case "room-image":
      await setRoomImage(attach.targetId, ref);
      return { ok: true };

    case "experience-image":
      await setExperienceImage(attach.targetId, ref);
      return { ok: true };

    case "nearby-image":
      await setNearbyPlaceImage(attach.targetId, ref);
      return { ok: true };

    case "guide-cover":
      // targetId is the guide's SLUG.
      await setGuideCover(attach.targetId, ref);
      return { ok: true };
  }
}
