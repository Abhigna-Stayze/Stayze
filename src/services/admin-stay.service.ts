import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getPublicUrlOrNull, deleteFile, type MediaRef } from "@/lib/storage";
import { num, numReq } from "@/services/mappers";
import type { StayFormValues, StayStatusValue } from "@/lib/stay-form";

/**
 * Admin Stay management — the write side of stays, and the reads the CMS needs
 * (all statuses, private fields), kept entirely separate from the public
 * `stay.service` (published-only, no owner phone). Both talk to Prisma; neither
 * knows about React or routes. The admin API layer guards these with a
 * SUPER_ADMIN session before ever calling in.
 *
 * Media follows the project rule: Postgres stores `{ bucket, path }`, the URL is
 * derived at read time, and storage objects are cleaned up when their row goes.
 */

export type AdminStayListItem = {
  id: string;
  slug: string;
  name: string;
  type: string;
  ownerName: string;
  coverImageUrl: string | null;
  basePricePerNight: number;
  currency: string;
  bedrooms: number;
  maxGuests: number;
  status: string;
  isFeatured: boolean;
  createdAt: Date;
};

export type AdminStayList = {
  items: AdminStayListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminStayImage = {
  id: string;
  bucket: string;
  path: string;
  url: string | null;
  altText: string | null;
  caption: string | null;
  isHero: boolean;
  sortOrder: number;
  width: number | null;
  height: number | null;
};

export type AdminHighlight = { label: string; icon: string | null };
export type AdminRoom = {
  id: string;
  name: string;
  description: string | null;
  bedType: string | null;
  maxGuests: number;
  image: (MediaRef & { url: string | null }) | null;
};
export type AdminNearby = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  distanceKm: number | null;
  driveTimeMinutes: number | null;
  mapsUrl: string | null;
  image: (MediaRef & { url: string | null }) | null;
};
export type AdminExperience = {
  id: string;
  title: string;
  description: string | null;
  image: (MediaRef & { url: string | null }) | null;
};

export type AdminStayDetail = {
  id: string;
  propertyCode: string;
  slug: string;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string | null;
  ownerPhotoUrl: string | null;
  ownerPhotoRef: MediaRef | null;
  name: string;
  type: string;
  tagline: string | null;
  area: string;
  addressLine: string | null;
  mapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  story: string;
  storyExcerpt: string | null;
  basePricePerNight: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  acres: number | null;
  distanceFromTownKm: number | null;
  checkInTime: string;
  checkOutTime: string;
  verification: string;
  fitScore: number | null;
  inspectedBy: string | null;
  inspectedOn: Date | null;
  caretakerName: string | null;
  caretakerPhone: string | null;
  cancellationPolicy: string | null;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ownerBio: string | null;
  amenityIds: string[];
  images: AdminStayImage[];
  highlights: AdminHighlight[];
  rooms: AdminRoom[];
  nearbyPlaces: AdminNearby[];
  experiences: AdminExperience[];
  menuImageUrl: string | null;
  menuImageRef: MediaRef | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AmenityOption = {
  id: string;
  name: string;
  category: string | null;
};

export type ListParams = {
  search?: string;
  status?: StayStatusValue;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "price-asc" | "price-desc" | "name";
  page?: number;
  pageSize?: number;
};

export class StayAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StayAdminError";
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The amenity vocabulary, for the form's multi-select. */
export async function getAmenityOptions(): Promise<AmenityOption[]> {
  const amenities = await prisma.amenity.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
  });
  return amenities;
}

/** Distinct property types present, for the filter dropdown. */
export async function getStayTypes(): Promise<string[]> {
  const rows = await prisma.stay.findMany({
    where: { deletedAt: null },
    distinct: ["type"],
    select: { type: true },
    orderBy: { type: "asc" },
  });
  return rows.map((r) => r.type);
}

/** The admin table — server-side search, filter, sort and pagination. */
export async function listStays(params: ListParams): Promise<AdminStayList> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));
  const search = params.search?.trim();

  const where = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.type ? { type: params.type } : {}),
    ...(params.minPrice !== undefined || params.maxPrice !== undefined
      ? {
          basePricePerNight: {
            ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
            ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { type: { contains: search, mode: "insensitive" as const } },
            { area: { contains: search, mode: "insensitive" as const } },
            { addressLine: { contains: search, mode: "insensitive" as const } },
            {
              owner: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy = (() => {
    switch (params.sort) {
      case "oldest":
        return { createdAt: "asc" as const };
      case "price-asc":
        return { basePricePerNight: "asc" as const };
      case "price-desc":
        return { basePricePerNight: "desc" as const };
      case "name":
        return { name: "asc" as const };
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const [total, rows] = await Promise.all([
    prisma.stay.count({ where }),
    prisma.stay.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        basePricePerNight: true,
        currency: true,
        bedrooms: true,
        maxGuests: true,
        status: true,
        isFeatured: true,
        createdAt: true,
        owner: { select: { name: true } },
        images: {
          where: { isHero: true },
          take: 1,
          select: { bucket: true, path: true },
        },
      },
    }),
  ]);

  return {
    items: rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      type: s.type,
      ownerName: s.owner.name,
      coverImageUrl: getPublicUrlOrNull(s.images[0] ?? {}),
      basePricePerNight: numReq(s.basePricePerNight),
      currency: s.currency,
      bedrooms: s.bedrooms,
      maxGuests: s.maxGuests,
      status: s.status,
      isFeatured: s.isFeatured,
      createdAt: s.createdAt,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** One stay, everything the view and edit pages need. Null if missing/deleted. */
export async function getStayForAdmin(
  id: string,
): Promise<AdminStayDetail | null> {
  const stay = await prisma.stay.findFirst({
    where: { id, deletedAt: null },
    include: {
      owner: true,
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { select: { amenityId: true } },
      highlights: { orderBy: { sortOrder: "asc" } },
      rooms: { orderBy: { sortOrder: "asc" } },
      nearbyPlaces: { orderBy: { sortOrder: "asc" } },
      experiences: {
        orderBy: { sortOrder: "asc" },
        include: { experience: true },
      },
    },
  });
  if (!stay) return null;

  const ownerPhotoRef =
    stay.owner.photoBucket && stay.owner.photoPath
      ? { bucket: stay.owner.photoBucket, path: stay.owner.photoPath }
      : null;
  const menuImageRef =
    stay.menuImageBucket && stay.menuImagePath
      ? { bucket: stay.menuImageBucket, path: stay.menuImagePath }
      : null;

  return {
    id: stay.id,
    propertyCode: stay.propertyCode,
    slug: stay.slug,
    status: stay.status,
    ownerId: stay.ownerId,
    ownerName: stay.owner.name,
    ownerPhone: stay.owner.phone,
    ownerPhotoUrl: getPublicUrlOrNull({
      bucket: stay.owner.photoBucket,
      path: stay.owner.photoPath,
    }),
    ownerPhotoRef,
    name: stay.name,
    type: stay.type,
    tagline: stay.tagline,
    area: stay.area,
    addressLine: stay.addressLine,
    mapsUrl: stay.mapsUrl,
    latitude: num(stay.latitude),
    longitude: num(stay.longitude),
    story: stay.story,
    storyExcerpt: stay.storyExcerpt,
    basePricePerNight: numReq(stay.basePricePerNight),
    currency: stay.currency,
    bedrooms: stay.bedrooms,
    bathrooms: stay.bathrooms,
    maxGuests: stay.maxGuests,
    acres: num(stay.acres),
    distanceFromTownKm: num(stay.distanceFromTownKm),
    checkInTime: stay.checkInTime,
    checkOutTime: stay.checkOutTime,
    verification: stay.verification,
    fitScore: stay.fitScore,
    inspectedBy: stay.inspectedBy,
    inspectedOn: stay.inspectedOn,
    caretakerName: stay.caretakerName,
    caretakerPhone: stay.caretakerPhone,
    cancellationPolicy: stay.cancellationPolicy,
    isFeatured: stay.isFeatured,
    metaTitle: stay.metaTitle,
    metaDescription: stay.metaDescription,
    ownerBio: stay.owner.bio,
    amenityIds: stay.amenities.map((a) => a.amenityId),
    images: stay.images.map((img) => ({
      id: img.id,
      bucket: img.bucket,
      path: img.path,
      url: getPublicUrlOrNull(img),
      altText: img.altText,
      caption: img.caption,
      isHero: img.isHero,
      sortOrder: img.sortOrder,
      width: img.width,
      height: img.height,
    })),
    highlights: stay.highlights.map((h) => ({ label: h.label, icon: h.icon })),
    rooms: stay.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      bedType: r.bedType,
      maxGuests: r.maxGuests,
      image: mediaWithUrl(r.imageBucket, r.imagePath),
    })),
    nearbyPlaces: stay.nearbyPlaces.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      distanceKm: num(p.distanceKm),
      driveTimeMinutes: p.driveTimeMinutes,
      mapsUrl: p.mapsUrl,
      image: mediaWithUrl(p.imageBucket, p.imagePath),
    })),
    experiences: stay.experiences.map((link) => ({
      id: link.experience.id,
      title: link.experience.title,
      description: link.experience.excerpt ?? link.experience.story,
      image: mediaWithUrl(link.experience.bucket, link.experience.path),
    })),
    menuImageUrl: getPublicUrlOrNull({
      bucket: stay.menuImageBucket,
      path: stay.menuImagePath,
    }),
    menuImageRef,
    createdAt: stay.createdAt,
    updatedAt: stay.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/** Create a stay + its owner, amenities and images, in one transaction. */
export async function createStay(
  input: StayFormValues,
): Promise<{ id: string; slug: string }> {
  const [propertyCode, slug] = await Promise.all([
    nextPropertyCode(),
    uniqueSlug(input.name),
  ]);

  const desiredImages = orderImages(input);
  if (input.status === "PUBLISHED" && desiredImages.length === 0) {
    throw new StayAdminError("Add a cover photo before publishing.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const owner = await tx.owner.create({
      data: {
        name: input.ownerName.trim(),
        phone: emptyToNull(input.ownerPhone),
        bio: emptyToNull(input.ownerBio),
        photoBucket: input.ownerPhotoRef?.bucket ?? null,
        photoPath: input.ownerPhotoRef?.path ?? null,
      },
      select: { id: true },
    });

    const stay = await tx.stay.create({
      data: {
        ...scalarData(input),
        propertyCode,
        slug,
        ownerId: owner.id,
        menuImageBucket: input.menuImageRef?.bucket ?? "stays",
        menuImagePath: input.menuImageRef?.path ?? null,
        amenities: {
          create: input.amenityIds.map((amenityId) => ({ amenityId })),
        },
        images: { create: imageCreateData(desiredImages) },
      },
      select: { id: true, slug: true },
    });

    await replaceNested(tx, stay.id, input);
    return stay;
  });

  return created;
}

/** Update every editable field, plus owner, amenities, images and the menu. */
export async function updateStay(
  id: string,
  input: StayFormValues,
): Promise<{ id: string; slug: string }> {
  const existing = await prisma.stay.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      slug: true,
      ownerId: true,
      menuImageBucket: true,
      menuImagePath: true,
      owner: { select: { photoBucket: true, photoPath: true } },
      images: { select: { id: true, bucket: true, path: true } },
      rooms: { select: { imageBucket: true, imagePath: true } },
      nearbyPlaces: { select: { imageBucket: true, imagePath: true } },
    },
  });
  if (!existing) throw new StayAdminError("That stay no longer exists.");

  const desired = orderImages(input);
  if (input.status === "PUBLISHED" && desired.length === 0) {
    throw new StayAdminError("Add a cover photo before publishing.");
  }

  // Which stored objects become orphans, to bin after the row work commits.
  const desiredKeys = new Set(desired.map((i) => `${i.bucket}/${i.path}`));
  const removedImages = existing.images.filter(
    (i) => !desiredKeys.has(`${i.bucket}/${i.path}`),
  );
  const staleOwnerPhoto = refIfReplaced(
    { bucket: existing.owner.photoBucket, path: existing.owner.photoPath },
    input.ownerPhotoRef ?? null,
  );
  const staleMenu = refIfReplaced(
    { bucket: existing.menuImageBucket, path: existing.menuImagePath },
    input.menuImageRef ?? null,
  );
  // Nested images (rooms + nearby) are delete-and-recreate, so any old object
  // not present in the new set orphans.
  const oldNestedRefs = [...existing.rooms, ...existing.nearbyPlaces]
    .map((r) => ({ bucket: r.imageBucket, path: r.imagePath }))
    .filter((r): r is MediaRef => Boolean(r.bucket && r.path));
  const newNestedKeys = new Set(
    [...input.rooms, ...input.nearbyPlaces]
      .map((r) => r.image)
      .filter((r): r is MediaRef => Boolean(r?.bucket && r?.path))
      .map((r) => `${r.bucket}/${r.path}`),
  );
  const staleNested = oldNestedRefs.filter(
    (r) => !newNestedKeys.has(`${r.bucket}/${r.path}`),
  );

  const slug = input.slug?.trim()
    ? await uniqueSlug(input.slug, id)
    : existing.slug;

  await prisma.$transaction(async (tx) => {
    await tx.owner.update({
      where: { id: existing.ownerId },
      data: {
        name: input.ownerName.trim(),
        phone: emptyToNull(input.ownerPhone),
        bio: emptyToNull(input.ownerBio),
        photoBucket: input.ownerPhotoRef?.bucket ?? null,
        photoPath: input.ownerPhotoRef?.path ?? null,
      },
    });

    await tx.stay.update({
      where: { id },
      data: {
        ...scalarData(input),
        slug,
        menuImageBucket: input.menuImageRef?.bucket ?? "stays",
        menuImagePath: input.menuImageRef?.path ?? null,
      },
    });

    // Amenities: replace the whole set (a stay has few, this is simplest safe).
    await tx.stayAmenity.deleteMany({ where: { stayId: id } });
    if (input.amenityIds.length > 0) {
      await tx.stayAmenity.createMany({
        data: input.amenityIds.map((amenityId) => ({ stayId: id, amenityId })),
        skipDuplicates: true,
      });
    }

    // Images: drop removed, then upsert desired with fresh order + hero.
    if (removedImages.length > 0) {
      await tx.stayImage.deleteMany({
        where: { id: { in: removedImages.map((i) => i.id) } },
      });
    }
    for (let i = 0; i < desired.length; i++) {
      const img = desired[i];
      await tx.stayImage.upsert({
        where: { bucket_path: { bucket: img.bucket, path: img.path } },
        create: {
          stayId: id,
          bucket: img.bucket,
          path: img.path,
          altText: img.altText ?? null,
          caption: img.caption ?? null,
          mediaType: "PHOTO",
          isHero: i === 0,
          sortOrder: i,
          width: img.width ?? null,
          height: img.height ?? null,
        },
        update: {
          isHero: i === 0,
          sortOrder: i,
          altText: img.altText ?? null,
          caption: img.caption ?? null,
        },
      });
    }

    await replaceNested(tx, id, input);
  });

  // Bin orphaned objects after the DB is consistent. Failures are logged, not
  // thrown — a wasted file beats reporting failure for a save that succeeded.
  for (const img of removedImages) await deleteQuietly(img);
  for (const ref of staleNested) await deleteQuietly(ref);
  if (staleOwnerPhoto) await deleteQuietly(staleOwnerPhoto);
  if (staleMenu) await deleteQuietly(staleMenu);

  return { id: existing.id, slug };
}

/** Publish / unpublish / hide. Publishing needs a cover image. */
export async function setStayStatus(
  id: string,
  status: StayStatusValue,
): Promise<void> {
  const stay = await prisma.stay.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, images: { where: { isHero: true }, take: 1 } },
  });
  if (!stay) throw new StayAdminError("That stay no longer exists.");
  if (status === "PUBLISHED" && stay.images.length === 0) {
    throw new StayAdminError("Add a cover photo before publishing.");
  }
  await prisma.stay.update({ where: { id }, data: { status } });
}

// ---------------------------------------------------------------------------
// Reviews (moderation) and Availability — sibling collections, edited on their
// own tabs rather than through the big save.
// ---------------------------------------------------------------------------

export type AdminReview = {
  id: string;
  guestName: string;
  rating: number;
  title: string | null;
  comment: string;
  stayedOn: Date | null;
  source: string;
  isPublished: boolean;
  imageCount: number;
};

/** Every review for a stay — pending first — for the moderation tab. */
export async function getStayReviewsForAdmin(
  stayId: string,
): Promise<AdminReview[]> {
  const reviews = await prisma.review.findMany({
    where: { stayId },
    orderBy: [{ isPublished: "asc" }, { stayedOn: "desc" }],
    include: { _count: { select: { images: true } } },
  });
  return reviews.map((r) => ({
    id: r.id,
    guestName: r.guestName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    stayedOn: r.stayedOn,
    source: r.source,
    isPublished: r.isPublished,
    imageCount: r._count.images,
  }));
}

export type AdminAvailabilityDay = {
  date: string; // YYYY-MM-DD
  status: string;
  priceOverride: number | null;
};

/** Raw availability rows in a range — for the calendar (status + override). */
export async function getAvailabilityForAdmin(
  stayId: string,
  from: Date,
  to: Date,
): Promise<AdminAvailabilityDay[]> {
  const days = await prisma.stayAvailability.findMany({
    where: { stayId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });
  return days.map((d) => ({
    date: d.date.toISOString().slice(0, 10),
    status: d.status,
    priceOverride: num(d.priceOverride),
  }));
}

/** Block/unblock or price dates. BOOKED is never set here — that's the booking
 *  flow's job — so the admin can't accidentally fake a booking. */
export async function setAvailability(
  stayId: string,
  dates: string[],
  status: "AVAILABLE" | "BLOCKED",
  priceOverride: number | null,
): Promise<void> {
  const stay = await prisma.stay.findFirst({
    where: { id: stayId, deletedAt: null },
    select: { id: true },
  });
  if (!stay) throw new StayAdminError("That stay no longer exists.");

  for (const d of dates) {
    const date = new Date(`${d}T00:00:00.000Z`);
    await prisma.stayAvailability.upsert({
      where: { stayId_date: { stayId, date } },
      create: { stayId, date, status, priceOverride },
      update: { status, priceOverride },
    });
  }
}

/** Remove overrides for these dates — back to the default (available, base price). */
export async function clearAvailability(
  stayId: string,
  dates: string[],
): Promise<void> {
  await prisma.stayAvailability.deleteMany({
    where: {
      stayId,
      date: { in: dates.map((d) => new Date(`${d}T00:00:00.000Z`)) },
    },
  });
}

/**
 * Soft delete — keeps the row (recoverable) but drops it from the admin list,
 * and flips status off PUBLISHED so the public site (which only reads
 * PUBLISHED) never shows it. Storage objects are kept, since a restore should
 * bring the images back.
 */
export async function softDeleteStay(id: string): Promise<void> {
  const stay = await prisma.stay.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!stay) throw new StayAdminError("That stay no longer exists.");
  await prisma.stay.update({
    where: { id },
    data: { deletedAt: new Date(), status: "HIDDEN" },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** The scalar Stay columns shared by create and update. */
function scalarData(input: StayFormValues) {
  return {
    name: input.name.trim(),
    type: input.type.trim(),
    tagline: emptyToNull(input.tagline),
    area: input.area.trim(),
    addressLine: emptyToNull(input.addressLine),
    mapsUrl: emptyToNull(input.mapsUrl),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    story: input.story.trim(),
    storyExcerpt: emptyToNull(input.storyExcerpt),
    basePricePerNight: input.basePricePerNight,
    maxGuests: input.maxGuests,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    acres: input.acres ?? null,
    distanceFromTownKm: input.distanceFromTownKm ?? null,
    checkInTime: input.checkInTime.trim(),
    checkOutTime: input.checkOutTime.trim(),
    status: input.status,
    verification: input.verification,
    fitScore: input.fitScore ?? null,
    inspectedBy: emptyToNull(input.inspectedBy),
    inspectedOn: input.inspectedOn ? new Date(input.inspectedOn) : null,
    caretakerName: emptyToNull(input.caretakerName),
    caretakerPhone: emptyToNull(input.caretakerPhone),
    cancellationPolicy: emptyToNull(input.cancellationPolicy),
    isFeatured: input.isFeatured,
    metaTitle: emptyToNull(input.metaTitle),
    metaDescription: emptyToNull(input.metaDescription),
  };
}

/** Cover first (becomes the hero), then the gallery, de-duplicated by path. */
function orderImages(input: StayFormValues) {
  const seen = new Set<string>();
  const ordered = [
    ...(input.coverImage ? [input.coverImage] : []),
    ...input.gallery,
  ];
  return ordered.filter((img) => {
    const key = `${img.bucket}/${img.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function emptyToNull(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/** The previous object, only if it's really being replaced by a different one. */
function refIfReplaced(
  previous: { bucket: string | null; path: string | null },
  next: MediaRef | null,
): MediaRef | null {
  if (!previous.bucket || !previous.path) return null;
  if (next && next.bucket === previous.bucket && next.path === previous.path) {
    return null;
  }
  return { bucket: previous.bucket, path: previous.path };
}

async function deleteQuietly(ref: MediaRef): Promise<void> {
  try {
    await deleteFile(ref);
  } catch (error) {
    console.error(`[admin-stay] orphaned ${ref.bucket}/${ref.path}:`, error);
  }
}

/** Next P0xx code — max existing numeric part + 1, zero-padded to 3. */
async function nextPropertyCode(): Promise<string> {
  const rows = await prisma.stay.findMany({ select: { propertyCode: true } });
  const max = rows.reduce((acc, r) => {
    const n = parseInt(r.propertyCode.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `P${String(max + 1).padStart(3, "0")}`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "stay"
  );
}

/** A URL-safe, unique stay slug. `excludeId` lets a stay keep its own slug. */
async function uniqueSlug(value: string, excludeId?: string): Promise<string> {
  const base = slugify(value);
  let slug = base;
  let n = 2;
  // The unique index is the real guard; this just avoids an obvious clash.
  for (;;) {
    const clash = await prisma.stay.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash || clash.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

// --- Nested collection helpers ---

type Tx = Prisma.TransactionClient;

/** The StayImage rows for a create — cover first (hero), then gallery. */
function imageCreateData(images: ReturnType<typeof orderImages>) {
  return images.map((img, i) => ({
    bucket: img.bucket,
    path: img.path,
    altText: img.altText ?? null,
    caption: img.caption ?? null,
    mediaType: "PHOTO" as const,
    isHero: i === 0,
    sortOrder: i,
    width: img.width ?? null,
    height: img.height ?? null,
  }));
}

/** A media ref + its public URL, or null. */
function mediaWithUrl(
  bucket: string | null,
  path: string | null,
): (MediaRef & { url: string | null }) | null {
  if (!bucket || !path) return null;
  return { bucket, path, url: getPublicUrlOrNull({ bucket, path }) };
}

/**
 * Replace a stay's highlights, rooms and nearby places (delete-and-recreate —
 * they're small, keyless collections), and reconcile its experiences.
 * Storage-orphan cleanup for room/nearby images is handled by the caller.
 */
async function replaceNested(
  tx: Tx,
  stayId: string,
  input: StayFormValues,
): Promise<void> {
  await tx.stayHighlight.deleteMany({ where: { stayId } });
  if (input.highlights.length > 0) {
    await tx.stayHighlight.createMany({
      data: input.highlights.map((h, i) => ({
        stayId,
        label: h.label.trim(),
        icon: emptyToNull(h.icon),
        sortOrder: i,
      })),
    });
  }

  await tx.room.deleteMany({ where: { stayId } });
  if (input.rooms.length > 0) {
    await tx.room.createMany({
      data: input.rooms.map((r, i) => ({
        stayId,
        name: r.name.trim(),
        description: emptyToNull(r.description),
        bedType: emptyToNull(r.bedType),
        maxGuests: r.maxGuests,
        imageBucket: r.image?.bucket ?? null,
        imagePath: r.image?.path ?? null,
        sortOrder: i,
      })),
    });
  }

  await tx.nearbyPlace.deleteMany({ where: { stayId } });
  if (input.nearbyPlaces.length > 0) {
    await tx.nearbyPlace.createMany({
      data: input.nearbyPlaces.map((p, i) => ({
        stayId,
        name: p.name.trim(),
        category: p.category,
        description: emptyToNull(p.description),
        distanceKm: p.distanceKm ?? null,
        driveTimeMinutes: p.driveTimeMinutes ?? null,
        mapsUrl: emptyToNull(p.mapsUrl),
        imageBucket: p.image?.bucket ?? null,
        imagePath: p.image?.path ?? null,
        sortOrder: i,
      })),
    });
  }

  await syncExperiences(tx, stayId, input.experiences);
}

/**
 * Reconcile the stay's experiences. An item with an `id` updates that shared
 * Experience; a new item creates one. Links (StayExperience) carry the order.
 * Removed experiences are *unlinked*, not deleted — the Experience may be shared
 * with another stay.
 */
async function syncExperiences(
  tx: Tx,
  stayId: string,
  items: StayFormValues["experiences"],
): Promise<void> {
  const existing = await tx.stayExperience.findMany({
    where: { stayId },
    select: { experienceId: true },
  });
  const keep = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const data = {
      title: it.title.trim(),
      excerpt: emptyToNull(it.description),
      story: it.description?.trim() || it.title.trim(),
      bucket: it.image?.bucket ?? null,
      path: it.image?.path ?? null,
      isPublished: true,
    };

    let experienceId: string;
    if (it.id) {
      await tx.experience.update({ where: { id: it.id }, data });
      experienceId = it.id;
    } else {
      const slug = await uniqueExperienceSlug(tx, it.title);
      const created = await tx.experience.create({
        data: { ...data, slug },
        select: { id: true },
      });
      experienceId = created.id;
    }
    keep.add(experienceId);

    await tx.stayExperience.upsert({
      where: { stayId_experienceId: { stayId, experienceId } },
      create: { stayId, experienceId, sortOrder: i },
      update: { sortOrder: i },
    });
  }

  const stale = existing
    .map((e) => e.experienceId)
    .filter((eid) => !keep.has(eid));
  if (stale.length > 0) {
    await tx.stayExperience.deleteMany({
      where: { stayId, experienceId: { in: stale } },
    });
  }
}

async function uniqueExperienceSlug(tx: Tx, title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  for (;;) {
    const clash = await tx.experience.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}
