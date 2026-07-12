import { getSupabaseAdmin, supabaseBrowser } from "@/lib/supabase";

/**
 * Storage service — the single door to Supabase Storage.
 *
 * Nothing else in the app talks to `supabase.storage` directly. Pages,
 * components, services and server actions all come through here.
 *
 * The rule this enforces: Postgres stores a REFERENCE (bucket + path), never a
 * URL and never binary. The public URL is derived at read time. That keeps the
 * project ref out of the database and makes a future move to a CDN a config
 * change rather than a data migration.
 */

/** The five buckets. Anything outside this list is a bug, not a new feature. */
export const BUCKETS = [
  "stays",
  "owners",
  "reviews",
  "guides",
  "experiences",
] as const;

export type Bucket = (typeof BUCKETS)[number];

/** A stored object, exactly as Postgres holds it. */
export type MediaRef = {
  bucket: string;
  path: string;
};

/** A media reference that may be absent — Owner.photo*, Room.image*, etc. */
export type MaybeMediaRef = {
  bucket?: string | null;
  path?: string | null;
};

export type UploadOptions = {
  /** MIME type. Supabase defaults to octet-stream without it, which breaks <img>. */
  contentType?: string;
  /** Overwrite an object at the same path. Default false — fail rather than clobber. */
  upsert?: boolean;
  /** Browser cache lifetime in seconds. Default 1 hour. */
  cacheControlSeconds?: number;
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Resolve a stored reference to a public URL.
 *
 * Pure string-building — no network call, no credentials — so it is safe to
 * call on the server and in the browser.
 */
export function getPublicUrl(ref: MediaRef): string {
  const { data } = supabaseBrowser.storage
    .from(ref.bucket)
    .getPublicUrl(ref.path);
  return data.publicUrl;
}

/**
 * Same, for the nullable reference columns (an owner with no photo, a room
 * with no image). Returns null rather than a URL that would 404.
 */
export function getPublicUrlOrNull(ref: MaybeMediaRef): string | null {
  if (!ref.bucket || !ref.path) return null;
  return getPublicUrl({ bucket: ref.bucket, path: ref.path });
}

/**
 * A time-limited URL for an object in a private bucket.
 *
 * Not needed today — all five buckets are public. It will be needed if
 * `reviews` moves to a private bucket, which it should before real guests
 * upload personal photos.
 */
export async function getSignedUrl(
  ref: MediaRef,
  expiresInSeconds = 60 * 60,
): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(ref.bucket)
    .createSignedUrl(ref.path, expiresInSeconds);

  if (error || !data) {
    throw new StorageError(`sign ${ref.bucket}/${ref.path}`, error?.message);
  }
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Write — server only. These use the service-role key.
// ---------------------------------------------------------------------------

/**
 * Upload a file and return the reference to store in Postgres.
 *
 * The caller stores `{ bucket, path }` on the row. It never stores the URL.
 */
export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: File | Blob | ArrayBuffer | Buffer,
  options: UploadOptions = {},
): Promise<MediaRef> {
  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(path, file, {
      contentType: options.contentType,
      upsert: options.upsert ?? false,
      cacheControl: String(options.cacheControlSeconds ?? 3600),
    });

  if (error) throw new StorageError(`upload ${bucket}/${path}`, error.message);

  return { bucket, path };
}

/**
 * Delete an object.
 *
 * Call this whenever the row that referenced it is deleted. Postgres cascades
 * delete child ROWS; nothing deletes the FILE. Skip this and the buckets fill
 * up with objects no row points at.
 */
export async function deleteFile(ref: MediaRef): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .storage.from(ref.bucket)
    .remove([ref.path]);

  if (error) {
    throw new StorageError(`delete ${ref.bucket}/${ref.path}`, error.message);
  }
}

/** Delete many objects from the same bucket in one call. */
export async function deleteFiles(
  bucket: Bucket,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;

  const { error } = await getSupabaseAdmin().storage.from(bucket).remove(paths);

  if (error) {
    throw new StorageError(
      `delete ${paths.length} from ${bucket}`,
      error.message,
    );
  }
}

/**
 * Move or rename an object within a bucket, returning the new reference.
 *
 * Storage and Postgres must be updated together: this only moves the object.
 * The caller is responsible for writing the returned reference back to the row,
 * or the row will point at a path that no longer exists.
 */
export async function moveFile(
  bucket: Bucket,
  fromPath: string,
  toPath: string,
): Promise<MediaRef> {
  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .move(fromPath, toPath);

  if (error) {
    throw new StorageError(
      `move ${bucket}/${fromPath} -> ${toPath}`,
      error.message,
    );
  }

  return { bucket, path: toPath };
}

// ---------------------------------------------------------------------------
// Path helpers — one place that knows the layout, so it stays consistent
// ---------------------------------------------------------------------------

export const paths = {
  stayHero: (propertyCode: string) => `${folder(propertyCode)}/hero.jpg`,
  stayGallery: (propertyCode: string, n: number) =>
    `${folder(propertyCode)}/gallery-${n}.jpg`,
  stayRoom: (propertyCode: string, roomSlug: string) =>
    `${folder(propertyCode)}/rooms/${roomSlug}.jpg`,
  stayNearby: (propertyCode: string, placeSlug: string) =>
    `${folder(propertyCode)}/nearby/${placeSlug}.jpg`,
  experience: (propertyCode: string, experienceSlug: string) =>
    `${folder(propertyCode)}/${experienceSlug}.jpg`,
  ownerProfile: (ownerRef: string) => `${ownerRef}/profile.jpg`,
  guideCover: (guideSlug: string) => `${guideSlug}/cover.jpg`,
  reviewImage: (reviewRef: string, n: number) => `${reviewRef}/img-${n}.jpg`,
};

/** P001 -> property-001, matching how the seed lays the buckets out. */
function folder(propertyCode: string): string {
  const digits = propertyCode.replace(/\D/g, "");
  return `property-${digits.padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------

export class StorageError extends Error {
  constructor(operation: string, detail?: string) {
    super(`Storage: ${operation}${detail ? ` — ${detail}` : ""}`);
    this.name = "StorageError";
  }
}
