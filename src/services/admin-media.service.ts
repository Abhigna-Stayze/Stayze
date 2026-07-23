import "server-only";
import { prisma } from "@/lib/prisma";
import {
  BUCKETS,
  deleteFile,
  getPublicUrl,
  isPrivateBucket,
  listBucket,
  signRefs,
  uploadFile,
  type Bucket,
  type MediaRef,
  type StorageObject,
} from "@/lib/storage";

/**
 * Admin Media Library — a **derived** index, not a stored one.
 *
 * Schema v1.1 has no media/asset table, and this phase adds no columns. So the
 * library is computed on read from the two things that DO exist:
 *
 *   what exists   → the objects actually in the Supabase buckets (`listBucket`)
 *   what uses it  → every media reference across the eight referencing sources
 *                   (StayImage, Room, NearbyPlace, Owner, Stay.menuImage,
 *                    Experience, TravelGuide, ReviewImage)
 *
 * Joining those on `bucket/path` is what makes "Used by" and "Unused" real
 * rather than guessed, and it surfaces a third state the brief didn't ask for
 * but which matters: **missing** — a row points at an object that is no longer
 * in Storage (a broken image on the public site).
 *
 * The cost of having no table: `altText`/`caption` can only be persisted for
 * **stay images**, because `StayImage` is the only model carrying those columns.
 * Everything else is read-only metadata.
 */

export type MediaUsageKind =
  | "STAY_IMAGE"
  | "ROOM"
  | "NEARBY"
  | "OWNER"
  | "STAY_MENU"
  | "EXPERIENCE"
  | "GUIDE"
  | "REVIEW";

export type MediaUsage = {
  kind: MediaUsageKind;
  /** What the media is used AS — "Stay gallery", "Room photo". */
  label: string;
  /** What it belongs to — "CoffeeCharm", "The Estate Room". */
  entityName: string;
  /** Where to go and change it, when a module for it exists. */
  href: string | null;
};

export type MediaItem = {
  bucket: string;
  path: string;
  fileName: string;
  /** Public URL, or a short-lived signed URL for the private `reviews` bucket. */
  url: string | null;
  isPrivate: boolean;
  size: number | null;
  mimeType: string | null;
  createdAt: Date | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  /** A row references it, but the object is gone from Storage. */
  missing: boolean;
  usedBy: MediaUsage[];
  /** Only stay images can persist alt text / caption — nothing else has columns. */
  editableMeta: boolean;
};

export type MediaList = {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Counts across the WHOLE library, not just this page — drives the filter chips. */
  stats: { all: number; unused: number; missing: number; bytes: number };
};

export type MediaListParams = {
  search?: string;
  bucket?: string;
  filter?: "all" | "images" | "videos" | "unused" | "recent" | "missing";
  sort?: "newest" | "oldest" | "name" | "size";
  page?: number;
  pageSize?: number;
};

export class MediaAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaAdminError";
  }
}

/** Anything uploaded in the last week counts as "recently uploaded". */
const RECENT_DAYS = 7;

// ---------------------------------------------------------------------------
// The reference map — every place a media object can be pointed at
// ---------------------------------------------------------------------------

type RefInfo = {
  usages: MediaUsage[];
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  editableMeta: boolean;
};

function key(bucket: string, path: string): string {
  return `${bucket}/${path}`;
}

/**
 * Walk every model that stores a `{ bucket, path }` and index them by key.
 *
 * Add a model here the moment it gains a media column, or its images will show
 * in the library as "unused" and be offered up for deletion.
 */
async function collectReferences(): Promise<Map<string, RefInfo>> {
  const [
    stayImages,
    rooms,
    nearby,
    owners,
    menus,
    experiences,
    guides,
    reviews,
  ] = await Promise.all([
    prisma.stayImage.findMany({
      select: {
        bucket: true,
        path: true,
        altText: true,
        caption: true,
        width: true,
        height: true,
        isHero: true,
        stay: { select: { id: true, name: true } },
      },
    }),
    prisma.room.findMany({
      where: { imagePath: { not: null } },
      select: {
        imageBucket: true,
        imagePath: true,
        name: true,
        stay: { select: { id: true, name: true } },
      },
    }),
    prisma.nearbyPlace.findMany({
      where: { imagePath: { not: null } },
      select: {
        imageBucket: true,
        imagePath: true,
        name: true,
        stay: { select: { id: true, name: true } },
      },
    }),
    prisma.owner.findMany({
      where: { photoPath: { not: null } },
      select: {
        photoBucket: true,
        photoPath: true,
        name: true,
        stays: { select: { id: true }, take: 1 },
      },
    }),
    prisma.stay.findMany({
      where: { menuImagePath: { not: null } },
      select: {
        id: true,
        name: true,
        menuImageBucket: true,
        menuImagePath: true,
      },
    }),
    prisma.experience.findMany({
      where: { path: { not: null } },
      select: { id: true, title: true, bucket: true, path: true },
    }),
    prisma.travelGuide.findMany({
      where: { coverImagePath: { not: null } },
      select: {
        title: true,
        coverImageBucket: true,
        coverImagePath: true,
      },
    }),
    prisma.reviewImage.findMany({
      select: {
        bucket: true,
        path: true,
        width: true,
        height: true,
        review: {
          select: {
            guestName: true,
            stay: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  const map = new Map<string, RefInfo>();

  const add = (
    bucket: string | null,
    path: string | null,
    usage: MediaUsage,
    extra: Partial<RefInfo> = {},
  ) => {
    if (!bucket || !path) return;
    const k = key(bucket, path);
    const existing = map.get(k);
    if (existing) {
      existing.usages.push(usage);
      // First writer wins for metadata; a second reference to the same object
      // does not overwrite the dimensions/alt we already resolved.
      existing.width ??= extra.width ?? null;
      existing.height ??= extra.height ?? null;
      existing.altText ??= extra.altText ?? null;
      existing.caption ??= extra.caption ?? null;
      existing.editableMeta ||= extra.editableMeta ?? false;
      return;
    }
    map.set(k, {
      usages: [usage],
      width: extra.width ?? null,
      height: extra.height ?? null,
      altText: extra.altText ?? null,
      caption: extra.caption ?? null,
      editableMeta: extra.editableMeta ?? false,
    });
  };

  for (const i of stayImages) {
    add(
      i.bucket,
      i.path,
      {
        kind: "STAY_IMAGE",
        label: i.isHero ? "Stay cover" : "Stay gallery",
        entityName: i.stay.name,
        href: `/admin/stays/${i.stay.id}/edit`,
      },
      {
        width: i.width,
        height: i.height,
        altText: i.altText,
        caption: i.caption,
        editableMeta: true,
      },
    );
  }
  for (const r of rooms) {
    add(r.imageBucket, r.imagePath, {
      kind: "ROOM",
      label: `Room photo · ${r.name}`,
      entityName: r.stay.name,
      href: `/admin/stays/${r.stay.id}/edit`,
    });
  }
  for (const p of nearby) {
    add(p.imageBucket, p.imagePath, {
      kind: "NEARBY",
      label: `Nearby place · ${p.name}`,
      entityName: p.stay.name,
      href: `/admin/stays/${p.stay.id}/edit`,
    });
  }
  for (const o of owners) {
    add(o.photoBucket, o.photoPath, {
      kind: "OWNER",
      label: "Host photo",
      entityName: o.name,
      href: o.stays[0] ? `/admin/stays/${o.stays[0].id}/edit` : null,
    });
  }
  for (const s of menus) {
    add(s.menuImageBucket, s.menuImagePath, {
      kind: "STAY_MENU",
      label: "Food menu",
      entityName: s.name,
      href: `/admin/stays/${s.id}/edit`,
    });
  }
  for (const e of experiences) {
    add(e.bucket, e.path, {
      kind: "EXPERIENCE",
      label: "Experience cover",
      entityName: e.title,
      href: `/admin/experiences/${e.id}/edit`,
    });
  }
  for (const g of guides) {
    add(g.coverImageBucket, g.coverImagePath, {
      kind: "GUIDE",
      label: "Guide cover",
      entityName: g.title,
      // No Travel Guides admin module yet — nowhere to send them.
      href: null,
    });
  }
  for (const ri of reviews) {
    add(
      ri.bucket,
      ri.path,
      {
        kind: "REVIEW",
        label: `Guest photo · ${ri.review.guestName}`,
        entityName: ri.review.stay.name,
        href: `/admin/stays/${ri.review.stay.id}/edit`,
      },
      { width: ri.width, height: ri.height },
    );
  }

  return map;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** The library — storage objects joined to their references, then filtered. */
export async function listMedia(
  params: MediaListParams = {},
): Promise<MediaList> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(96, Math.max(1, params.pageSize ?? 24));

  const buckets: readonly string[] =
    params.bucket && (BUCKETS as readonly string[]).includes(params.bucket)
      ? [params.bucket]
      : BUCKETS;

  const [refs, objectLists] = await Promise.all([
    collectReferences(),
    Promise.all(
      buckets.map(async (b) => {
        try {
          return await listBucket(b);
        } catch (error) {
          // One unreachable bucket must not take down the whole library.
          console.error(`[admin-media] listing ${b} failed:`, error);
          return [] as StorageObject[];
        }
      }),
    ),
  ]);

  const objects = objectLists.flat();
  const seen = new Set<string>();
  let items: MediaItem[] = [];

  for (const obj of objects) {
    const k = key(obj.bucket, obj.path);
    seen.add(k);
    const ref = refs.get(k);
    items.push(toItem(obj, ref, false));
  }

  // Referenced but absent from Storage — a broken image somewhere on the site.
  for (const [k, ref] of refs) {
    if (seen.has(k)) continue;
    const slash = k.indexOf("/");
    const bucket = k.slice(0, slash);
    const path = k.slice(slash + 1);
    if (!buckets.includes(bucket)) continue;
    items.push(
      toItem(
        { bucket, path, size: null, mimeType: null, createdAt: null },
        ref,
        true,
      ),
    );
  }

  const stats = {
    all: items.length,
    unused: items.filter((i) => i.usedBy.length === 0 && !i.missing).length,
    missing: items.filter((i) => i.missing).length,
    bytes: items.reduce((sum, i) => sum + (i.size ?? 0), 0),
  };

  // --- filter ---
  const filter = params.filter ?? "all";
  const recentCutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  items = items.filter((i) => {
    switch (filter) {
      case "images":
        return (i.mimeType ?? "").startsWith("image/");
      case "videos":
        return (i.mimeType ?? "").startsWith("video/");
      case "unused":
        return i.usedBy.length === 0 && !i.missing;
      case "missing":
        return i.missing;
      case "recent":
        return i.createdAt !== null && i.createdAt.getTime() >= recentCutoff;
      default:
        return true;
    }
  });

  // --- search ---
  const q = params.search?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (i) =>
        i.path.toLowerCase().includes(q) ||
        (i.altText ?? "").toLowerCase().includes(q) ||
        (i.caption ?? "").toLowerCase().includes(q),
    );
  }

  // --- sort ---
  const sort = params.sort ?? "newest";
  items.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return time(a.createdAt) - time(b.createdAt);
      case "name":
        return a.fileName.localeCompare(b.fileName);
      case "size":
        return (b.size ?? 0) - (a.size ?? 0);
      default:
        return time(b.createdAt) - time(a.createdAt);
    }
  });

  const total = items.length;
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

  // Sign only what this page shows — the private bucket needs a round trip.
  await attachUrls(pageItems);

  return {
    items: pageItems,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    stats,
  };
}

/** One object, with everything known about it. Null when it is neither in
 *  Storage nor referenced anywhere. */
export async function getMediaItem(
  bucket: string,
  path: string,
): Promise<MediaItem | null> {
  const refs = await collectReferences();
  const ref = refs.get(key(bucket, path));

  let obj: StorageObject | null = null;
  try {
    const objects = await listBucket(bucket);
    obj = objects.find((o) => o.path === path) ?? null;
  } catch (error) {
    console.error(`[admin-media] listing ${bucket} failed:`, error);
  }

  if (!obj && !ref) return null;

  const item = obj
    ? toItem(obj, ref, false)
    : toItem(
        { bucket, path, size: null, mimeType: null, createdAt: null },
        ref,
        true,
      );

  await attachUrls([item]);
  return item;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/** Upload into the library. It lands "unused" until an editor attaches it. */
export async function uploadMedia(
  bucket: Bucket,
  path: string,
  bytes: Buffer,
  contentType: string,
): Promise<MediaRef> {
  return uploadFile(bucket, path, bytes, { contentType });
}

/**
 * Edit alt text / caption.
 *
 * Only `StayImage` carries these columns, so this is a stay-image-only
 * operation. Anything else is refused with a reason rather than silently
 * dropping the edit.
 */
export async function updateMediaMeta(
  bucket: string,
  path: string,
  data: { altText?: string | null; caption?: string | null },
): Promise<void> {
  const image = await prisma.stayImage.findUnique({
    where: { bucket_path: { bucket, path } },
    select: { id: true },
  });
  if (!image) {
    throw new MediaAdminError(
      "Alt text and caption are only stored for stay images — this file has nowhere to keep them.",
    );
  }
  await prisma.stayImage.update({
    where: { id: image.id },
    data: {
      ...(data.altText !== undefined
        ? { altText: emptyToNull(data.altText) }
        : {}),
      ...(data.caption !== undefined
        ? { caption: emptyToNull(data.caption) }
        : {}),
    },
  });
}

/**
 * Delete an object.
 *
 * Unused files delete freely. A file that is still used needs `force`, and then
 * every reference to it is **detached in the same transaction** before the
 * object goes — so "delete anyway" can never leave a row pointing at a path
 * that no longer exists. Every media column in the schema is nullable (or lives
 * on a child row that can be deleted), which is what makes this safe.
 */
export async function deleteMedia(
  bucket: string,
  path: string,
  opts: { force?: boolean } = {},
): Promise<{ detached: number }> {
  const refs = await collectReferences();
  const ref = refs.get(key(bucket, path));
  const usageCount = ref?.usages.length ?? 0;

  if (usageCount > 0 && !opts.force) {
    throw new MediaAdminError(
      `That file is still used by ${usageCount} item${usageCount === 1 ? "" : "s"}. Detach it first, or confirm to delete it anyway.`,
    );
  }

  if (usageCount > 0) await detachEverywhere(bucket, path);

  try {
    await deleteFile({ bucket, path });
  } catch (error) {
    // The references are already gone; a Storage failure here leaves an orphan,
    // which the library will simply list as unused next time.
    console.error(`[admin-media] delete ${bucket}/${path} failed:`, error);
    throw new MediaAdminError(
      "The file could not be removed from storage. Its references were detached.",
    );
  }

  return { detached: usageCount };
}

/**
 * Replace an object: upload the new bytes at a fresh path, repoint every row
 * that referenced the old one, then bin the old object. The new path is
 * generated server-side, so no caller chooses where bytes land.
 */
export async function replaceMedia(
  bucket: string,
  path: string,
  newPath: string,
  bytes: Buffer,
  contentType: string,
): Promise<MediaRef> {
  if (!(BUCKETS as readonly string[]).includes(bucket)) {
    throw new MediaAdminError(`"${bucket}" is not a known bucket.`);
  }

  const created = await uploadFile(bucket as Bucket, newPath, bytes, {
    contentType,
  });

  try {
    await repointEverywhere(bucket, path, created);
  } catch (error) {
    // Roll the new object back so a failed repoint does not leave a stray file.
    await deleteFile(created).catch(() => {});
    throw error;
  }

  try {
    await deleteFile({ bucket, path });
  } catch (error) {
    console.error(`[admin-media] replace: old ${bucket}/${path} kept:`, error);
  }

  return created;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Null out (or delete) every reference to an object, in one transaction. */
async function detachEverywhere(bucket: string, path: string): Promise<void> {
  await prisma.$transaction([
    prisma.stayImage.deleteMany({ where: { bucket, path } }),
    prisma.reviewImage.deleteMany({ where: { bucket, path } }),
    prisma.room.updateMany({
      where: { imageBucket: bucket, imagePath: path },
      data: { imagePath: null },
    }),
    prisma.nearbyPlace.updateMany({
      where: { imageBucket: bucket, imagePath: path },
      data: { imagePath: null },
    }),
    prisma.owner.updateMany({
      where: { photoBucket: bucket, photoPath: path },
      data: { photoPath: null },
    }),
    prisma.stay.updateMany({
      where: { menuImageBucket: bucket, menuImagePath: path },
      data: { menuImagePath: null },
    }),
    prisma.experience.updateMany({
      where: { bucket, path },
      data: { path: null },
    }),
    prisma.travelGuide.updateMany({
      where: { coverImageBucket: bucket, coverImagePath: path },
      data: { coverImagePath: null },
    }),
  ]);
}

/** Point every reference at a new object, in one transaction. */
async function repointEverywhere(
  bucket: string,
  path: string,
  next: MediaRef,
): Promise<void> {
  await prisma.$transaction([
    prisma.stayImage.updateMany({
      where: { bucket, path },
      data: { bucket: next.bucket, path: next.path },
    }),
    prisma.reviewImage.updateMany({
      where: { bucket, path },
      data: { bucket: next.bucket, path: next.path },
    }),
    prisma.room.updateMany({
      where: { imageBucket: bucket, imagePath: path },
      data: { imageBucket: next.bucket, imagePath: next.path },
    }),
    prisma.nearbyPlace.updateMany({
      where: { imageBucket: bucket, imagePath: path },
      data: { imageBucket: next.bucket, imagePath: next.path },
    }),
    prisma.owner.updateMany({
      where: { photoBucket: bucket, photoPath: path },
      data: { photoBucket: next.bucket, photoPath: next.path },
    }),
    prisma.stay.updateMany({
      where: { menuImageBucket: bucket, menuImagePath: path },
      data: { menuImageBucket: next.bucket, menuImagePath: next.path },
    }),
    prisma.experience.updateMany({
      where: { bucket, path },
      data: { bucket: next.bucket, path: next.path },
    }),
    prisma.travelGuide.updateMany({
      where: { coverImageBucket: bucket, coverImagePath: path },
      data: { coverImageBucket: next.bucket, coverImagePath: next.path },
    }),
  ]);
}

function toItem(
  obj: StorageObject,
  ref: RefInfo | undefined,
  missing: boolean,
): MediaItem {
  const slash = obj.path.lastIndexOf("/");
  return {
    bucket: obj.bucket,
    path: obj.path,
    fileName: slash >= 0 ? obj.path.slice(slash + 1) : obj.path,
    url: null, // filled by attachUrls
    isPrivate: isPrivateBucket(obj.bucket),
    size: obj.size,
    mimeType: obj.mimeType,
    createdAt: obj.createdAt,
    width: ref?.width ?? null,
    height: ref?.height ?? null,
    altText: ref?.altText ?? null,
    caption: ref?.caption ?? null,
    missing,
    usedBy: ref?.usages ?? [],
    editableMeta: ref?.editableMeta ?? false,
  };
}

/**
 * Resolve URLs for a page of items. Public buckets are pure string-building;
 * the private `reviews` bucket needs signing, batched into one call.
 */
async function attachUrls(items: MediaItem[]): Promise<void> {
  const privateRefs = items
    .filter((i) => i.isPrivate && !i.missing)
    .map((i) => ({ bucket: i.bucket, path: i.path }));
  const signed = privateRefs.length > 0 ? await signRefs(privateRefs) : null;

  for (const item of items) {
    if (item.missing) {
      item.url = null;
      continue;
    }
    if (item.isPrivate) {
      item.url = signed?.get(key(item.bucket, item.path)) ?? null;
      continue;
    }
    try {
      item.url = getPublicUrl({ bucket: item.bucket, path: item.path });
    } catch {
      item.url = null;
    }
  }
}

function time(date: Date | null): number {
  return date ? date.getTime() : 0;
}

function emptyToNull(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}
