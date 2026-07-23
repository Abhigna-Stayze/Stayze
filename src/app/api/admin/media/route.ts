import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  BadRequestError,
  created,
  fail,
  ok,
  parseBody,
  parseQuery,
  route,
} from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { mediaDeleteSchema, mediaMetaSchema } from "@/lib/settings-form";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/schemas";
import { BUCKETS, type Bucket } from "@/lib/storage";
import {
  deleteMedia,
  listMedia,
  updateMediaMeta,
  uploadMedia,
} from "@/services/admin-media.service";

/**
 * GET    /api/admin/media — the derived library (Storage joined to references).
 * POST   /api/admin/media — upload into a bucket (multipart). Lands "unused".
 * PATCH  /api/admin/media — edit alt text / caption (stay images only).
 * DELETE /api/admin/media — delete an object; `force` detaches its references.
 *
 * SUPER_ADMIN only. Identified by `{ bucket, path }` in the body rather than a
 * route param, because a storage path contains slashes.
 */

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const listQuerySchema = z.object({
  search: z.string().optional(),
  bucket: z.string().optional(),
  filter: z
    .enum(["all", "images", "videos", "unused", "recent", "missing"])
    .optional(),
  sort: z.enum(["newest", "oldest", "name", "size"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(96).optional(),
});

export async function GET(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const params = parseQuery(listQuerySchema, request);
    return ok(await listMedia(params));
  });
}

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

    const requested = String(form.get("bucket") ?? "stays");
    if (!(BUCKETS as readonly string[]).includes(requested)) {
      throw new BadRequestError(`Unknown bucket "${requested}".`);
    }
    // Guest photos are private and belong to a review, not the library.
    if (requested === "reviews") {
      throw new BadRequestError(
        "The reviews bucket holds guest photos and cannot be uploaded to here.",
      );
    }

    // Server-generated path — a client never chooses where bytes land.
    const path = `library/${randomUUID()}.${EXT[contentType] ?? "jpg"}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const ref = await uploadMedia(
      requested as Bucket,
      path,
      bytes,
      contentType,
    );

    return created(ref);
  });
}

export async function PATCH(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const input = await parseBody(mediaMetaSchema, request);
    await updateMediaMeta(input.bucket, input.path, {
      altText: input.altText,
      caption: input.caption,
    });
    return ok({ bucket: input.bucket, path: input.path });
  });
}

export async function DELETE(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const input = await parseBody(mediaDeleteSchema, request);
    const result = await deleteMedia(input.bucket, input.path, {
      force: input.force,
    });
    return ok({ ...input, deleted: true, detached: result.detached });
  });
}
