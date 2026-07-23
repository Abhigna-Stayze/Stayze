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

/**
 * Buckets whose objects are NOT world-readable.
 *
 * `reviews` holds photographs guests took on holiday. The other four hold
 * marketing media we publish on purpose. A guest's photo is not marketing
 * media, and a public URL to one is permanent, unguessable-only-by-obscurity,
 * and impossible to take back once it has been indexed.
 *
 * So the bucket is private in Supabase and objects are reached through
 * short-lived signed URLs. `getPublicUrl` THROWS for these rather than
 * returning a link that 400s — a broken image is a bug you notice; a link that
 * silently exposes a guest's photo is one you do not.
 */
export const PRIVATE_BUCKETS = new Set<string>(["reviews"]);

export function isPrivateBucket(bucket: string): boolean {
  return PRIVATE_BUCKETS.has(bucket);
}

/** How long a signed review URL lives. Long enough to render a page, no longer. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

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
  if (isPrivateBucket(ref.bucket)) {
    // Deliberately fatal. Returning a public URL for a private object gives you
    // a link that 400s — or worse, one that works because someone flipped the
    // bucket back. Use getSignedUrl / signRefs instead.
    throw new StorageError(
      `"${ref.bucket}" is a private bucket. Use a signed URL, not a public one.`,
    );
  }

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
 * This is how guest review photos are read. Prefer `signRefs` when signing more
 * than one — this is a network round trip each.
 */
export async function getSignedUrl(
  ref: MediaRef,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(ref.bucket)
    .createSignedUrl(ref.path, expiresInSeconds);

  if (error || !data) {
    throw new StorageError(`sign ${ref.bucket}/${ref.path}`, error?.message);
  }
  return data.signedUrl;
}

/**
 * Sign many objects in one round trip, keyed by `bucket/path`.
 *
 * A stay page can carry a dozen review photos. Signing them one at a time is a
 * dozen sequential calls to Supabase before the page can render; this is one
 * call per bucket.
 *
 * A path that cannot be signed maps to null rather than throwing — one missing
 * guest photo should not take down the stay page it appears on.
 */
export async function signRefs(
  refs: MediaRef[],
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  if (refs.length === 0) return out;

  const byBucket = new Map<string, string[]>();
  for (const ref of refs) {
    const paths = byBucket.get(ref.bucket) ?? [];
    if (!paths.includes(ref.path)) paths.push(ref.path);
    byBucket.set(ref.bucket, paths);
  }

  for (const [bucket, paths] of byBucket) {
    const { data, error } = await getSupabaseAdmin()
      .storage.from(bucket)
      .createSignedUrls(paths, expiresInSeconds);

    if (error) {
      // Log and degrade: the caller gets nulls and renders without the photos.
      console.error(
        `[storage] batch sign failed for ${bucket}:`,
        error.message,
      );
      for (const path of paths) out.set(`${bucket}/${path}`, null);
      continue;
    }

    for (const item of data ?? []) {
      // `path` comes back on each item; fall back to matching by order is not
      // safe, so a missing path is simply a miss.
      if (!item.path) continue;
      out.set(`${bucket}/${item.path}`, item.error ? null : item.signedUrl);
    }
    // Anything Supabase did not answer for at all.
    for (const path of paths) {
      const key = `${bucket}/${path}`;
      if (!out.has(key)) out.set(key, null);
    }
  }

  return out;
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

  if (error) {
    // An object already sits at this path and upsert was not requested. That is
    // a conflict the caller can act on (pick another path, or pass upsert), not
    // a storage failure — so it gets its own type and, at the API edge, a 409.
    if (/already exists|duplicate/i.test(error.message)) {
      throw new StorageConflictError(`${bucket}/${path} already exists.`);
    }
    throw new StorageError(`upload ${bucket}/${path}`, error.message);
  }

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
// Listing — what is actually IN a bucket
// ---------------------------------------------------------------------------

/** One stored object, as Storage knows it (Postgres may know nothing about it). */
export type StorageObject = {
  bucket: string;
  /** Full path inside the bucket, e.g. "property-001/rooms/estate.jpg". */
  path: string;
  /** Bytes. Null when Storage reports no metadata. */
  size: number | null;
  mimeType: string | null;
  /** When the object was created — the closest thing to an "upload date". */
  createdAt: Date | null;
};

/** How deep the walk will go, and how many objects it will return per bucket. */
const LIST_PAGE = 100;
const MAX_DEPTH = 6;
const MAX_OBJECTS_PER_BUCKET = 2000;

/**
 * Every object in a bucket, walked recursively.
 *
 * Supabase's `.list()` is **one folder at a time** and returns folders as
 * entries with no `id`, so a flat listing does not exist — this walks. Used by
 * the admin Media Library, which is a DERIVED index: there is no media table in
 * Schema v1.1, so "what exists" comes from Storage and "what uses it" comes from
 * the referencing rows.
 *
 * Bounded on purpose (depth, page size, total): this runs behind an admin page,
 * and an unbounded walk of a bucket someone filled with 100k objects would hang
 * it. Hitting the cap logs, it does not throw — a partial library beats none.
 */
export async function listBucket(bucket: string): Promise<StorageObject[]> {
  const out: StorageObject[] = [];

  const walk = async (prefix: string, depth: number): Promise<void> => {
    if (depth > MAX_DEPTH || out.length >= MAX_OBJECTS_PER_BUCKET) return;

    for (let offset = 0; ; offset += LIST_PAGE) {
      const { data, error } = await getSupabaseAdmin()
        .storage.from(bucket)
        .list(prefix, { limit: LIST_PAGE, offset });

      if (error) {
        throw new StorageError(`list ${bucket}/${prefix}`, error.message);
      }
      const entries = data ?? [];
      if (entries.length === 0) return;

      for (const entry of entries) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;

        // Supabase marks folders by returning them with a null id.
        if (entry.id === null || entry.id === undefined) {
          await walk(path, depth + 1);
          continue;
        }
        if (out.length >= MAX_OBJECTS_PER_BUCKET) {
          console.warn(
            `[storage] ${bucket}: hit the ${MAX_OBJECTS_PER_BUCKET}-object cap; listing truncated.`,
          );
          return;
        }

        const meta = entry.metadata as
          { size?: number; mimetype?: string } | null | undefined;
        out.push({
          bucket,
          path,
          size: typeof meta?.size === "number" ? meta.size : null,
          mimeType: meta?.mimetype ?? null,
          createdAt: entry.created_at ? new Date(entry.created_at) : null,
        });
      }

      if (entries.length < LIST_PAGE) return;
    }
  };

  await walk("", 0);
  return out;
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

/** An object already exists at that path. The caller's problem, not storage's. */
export class StorageConflictError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = "StorageConflictError";
  }
}
