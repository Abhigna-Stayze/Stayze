import { randomUUID } from "node:crypto";
import { BadRequestError, created, fail, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/schemas";
import { BUCKETS } from "@/lib/storage";
import { replaceMedia } from "@/services/admin-media.service";

/**
 * POST /api/admin/media/replace  (multipart/form-data)
 *
 * Swap the bytes behind an existing object: the new file is uploaded at a fresh
 * server-generated path, every row that referenced the old one is repointed in a
 * transaction, and the old object is binned. Everything showing that image
 * updates at once, with no dangling reference.
 *
 * Fields: `file`, `bucket`, `path`. SUPER_ADMIN only.
 */
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  return route(async () => {
    await requireSuperAdmin();

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

    const bucket = String(form.get("bucket") ?? "");
    const path = String(form.get("path") ?? "");
    if (!bucket || !path) {
      throw new BadRequestError("Fields 'bucket' and 'path' are required.");
    }
    if (!(BUCKETS as readonly string[]).includes(bucket)) {
      throw new BadRequestError(`Unknown bucket "${bucket}".`);
    }

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

    const newPath = `library/${randomUUID()}.${EXT[contentType] ?? "jpg"}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const ref = await replaceMedia(bucket, path, newPath, bytes, contentType);

    return created(ref);
  });
}
