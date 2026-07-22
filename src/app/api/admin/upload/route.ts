import { randomUUID } from "node:crypto";
import { BadRequestError, created, fail, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/schemas";
import { getPublicUrl, uploadFile, type Bucket } from "@/lib/storage";

/**
 * POST /api/admin/upload  (multipart/form-data)
 *
 * The admin form's image pipeline: upload one file to Supabase Storage and get
 * back a reference + public URL for preview. It does **not** attach the image to
 * a row — the stay's images are written when the form is saved (the payload
 * carries the refs), so uploads work before a draft even has an id.
 *
 * Fields: `file`, `kind` (owner-photo → `owners`, experience → `experiences`,
 * everything else → `stays`), optional `width`/`height` (read client-side, echoed back so the
 * gallery can avoid layout shift). The **path is generated server-side** — a
 * random object key — so a client can never choose where bytes land.
 *
 * SUPER_ADMIN only. Same type allowlist and size cap as the public uploader.
 * Returns `{ bucket, path, url, width, height }`.
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

    const kind = String(form.get("kind") ?? "");
    const bucket: Bucket =
      kind === "owner-photo"
        ? "owners"
        : kind === "experience"
          ? "experiences"
          : "stays";
    const path = `admin/${randomUUID()}.${EXT[contentType] ?? "jpg"}`;

    const width = numOrNull(form.get("width"));
    const height = numOrNull(form.get("height"));

    const bytes = Buffer.from(await file.arrayBuffer());
    const ref = await uploadFile(bucket, path, bytes, { contentType });

    return created({ ...ref, url: getPublicUrl(ref), width, height });
  });
}

function numOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}
