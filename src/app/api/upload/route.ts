import { BadRequestError, created, fail, requireAdmin, route } from "@/lib/api";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  uploadSchema,
} from "@/lib/schemas";
import { getPublicUrl, uploadFile } from "@/lib/storage";

/**
 * POST /api/upload   (multipart/form-data)
 *
 * Fields:
 *   file    the image
 *   bucket  stays | owners | reviews | guides | experiences
 *   path    e.g. property-001/hero.jpg
 *   upsert  "true" to overwrite an existing object (default false)
 *
 * 201 -> { bucket, path, publicUrl, size, contentType }
 *
 * PROTECTED. Requires the `x-admin-key` header — see requireAdmin(). This
 * writes to Supabase Storage with the service-role key, so leaving it open
 * would let anyone fill the buckets or overwrite a hero image.
 *
 * This endpoint returns the reference; it does NOT write it to a row. Attaching
 * media to a Stay or a Review is a database write, and the service layer has no
 * function for it yet. Uploading and then attaching is therefore two calls, and
 * an upload that is never attached leaves an orphaned object in the bucket.
 * See CONTEXT.md — the storage/row lifecycle is a known gap.
 */
export async function POST(request: Request) {
  return route(async () => {
    requireAdmin(request);

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

    // Validate the metadata before touching the bytes.
    const { bucket, path, upsert } = uploadSchema.parse({
      bucket: form.get("bucket"),
      path: form.get("path"),
      upsert: form.get("upsert") ?? undefined,
    });

    // Refuse anything that is not an image we are prepared to serve. Trusting
    // the client's Content-Type is weak, but combined with a bucket allowlist
    // and a size cap it is proportionate for an admin-only endpoint.
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

    if (file.size === 0) {
      throw new BadRequestError("File is empty.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail(
        `File is ${(file.size / 1_048_576).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1_048_576} MB.`,
        413,
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Everything goes through the storage service. The route never touches the
    // Supabase client.
    const ref = await uploadFile(bucket, path, bytes, {
      contentType,
      upsert,
    });

    return created({
      ...ref,
      publicUrl: getPublicUrl(ref),
      size: file.size,
      contentType,
    });
  });
}
