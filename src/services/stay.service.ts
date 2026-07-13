import "server-only";
import { prisma } from "@/lib/prisma";
import {
  num,
  numReq,
  toExperience,
  toNearbyPlace,
  toOwnerPublic,
  toReviews,
  toRoom,
  toStayCard,
  toStayImage,
} from "@/services/mappers";
import { getReviewsForStay } from "@/services/review.service";
import type {
  AvailabilityDay,
  NearbyPlaceView,
  ReviewView,
  StayCard,
  StayDetail,
} from "@/services/types";

/**
 * Stays — Explore, Home and the Stay Detail page.
 *
 * Talks to Prisma. Knows nothing about React, routes or rendering.
 *
 * Every read here filters on `status: PUBLISHED`. Draft and archived stays
 * exist for the admin surface and must never leak into the public site, so the
 * filter lives in the service rather than being remembered at each call site.
 */

/** Only published stays are ever public. */
const PUBLISHED = { status: "PUBLISHED" } as const;

/** Everything a stay card needs, and nothing more. */
const cardSelect = {
  id: true,
  slug: true,
  name: true,
  type: true,
  tagline: true,
  storyExcerpt: true,
  area: true,
  distanceFromTownKm: true,
  basePricePerNight: true,
  currency: true,
  maxGuests: true,
  bedrooms: true,
  bathrooms: true,
  ratingAvg: true,
  reviewCount: true,
  fitScore: true,
  tier: true,
  verification: true,
  images: {
    where: { isHero: true },
    take: 1,
    select: {
      id: true,
      bucket: true,
      path: true,
      altText: true,
      caption: true,
      mediaType: true,
      isHero: true,
      width: true,
      height: true,
    },
  },
  highlights: {
    orderBy: { sortOrder: "asc" },
    take: 3,
    select: { label: true },
  },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} as const;

export type StayFilters = {
  /** Tag slugs from the Explore filter chips. A stay must carry ALL of them. */
  tags?: string[];
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Stays that sleep at least this many. */
  guests?: number;
};

/**
 * Explore. Published stays, newest first, optionally filtered by the chips.
 */
export async function getAllStays(
  filters: StayFilters = {},
): Promise<StayCard[]> {
  const { tags, area, minPrice, maxPrice, guests } = filters;

  const stays = await prisma.stay.findMany({
    where: {
      ...PUBLISHED,
      ...(area ? { area } : {}),
      ...(guests ? { maxGuests: { gte: guests } } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            basePricePerNight: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
      // AND semantics: selecting "Pool" and "Pet Friendly" means both, not either.
      ...(tags?.length
        ? { AND: tags.map((slug) => ({ tags: { some: { tag: { slug } } } })) }
        : {}),
    },
    select: cardSelect,
    orderBy: [{ fitScore: "desc" }, { createdAt: "desc" }],
  });

  return stays.map(toStayCard);
}

/**
 * Home — the "Featured Stays" row. Ordered by the manual `featuredOrder`.
 */
export async function getFeaturedStays(limit = 3): Promise<StayCard[]> {
  const stays = await prisma.stay.findMany({
    where: { ...PUBLISHED, isFeatured: true },
    select: cardSelect,
    orderBy: { featuredOrder: "asc" },
    take: limit,
  });

  return stays.map(toStayCard);
}

/**
 * The Stay Detail page, in one query.
 *
 * Returns null when the slug does not resolve or the stay is not published —
 * the caller should render a 404, not an empty page.
 */
export async function getStayBySlug(slug: string): Promise<StayDetail | null> {
  const stay = await prisma.stay.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      owner: true,
      images: { orderBy: { sortOrder: "asc" } },
      rooms: { orderBy: { sortOrder: "asc" } },
      highlights: { orderBy: { sortOrder: "asc" } },
      experiences: {
        orderBy: { sortOrder: "asc" },
        include: { experience: true },
      },
      nearbyPlaces: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      tags: { include: { tag: true } },
      reviews: {
        where: { isPublished: true },
        orderBy: { stayedOn: "desc" },
        include: { images: true },
      },
    },
  });

  if (!stay) return null;

  // Guest photos are in a private bucket, so signing is a network call. One
  // batched call for every review on the page, not one per photo.
  const reviews = await toReviews(stay.reviews);

  return {
    ...toStayCard(stay),
    // toStayCard caps highlights at 3 for the card; the detail page shows all.
    highlights: stay.highlights.map((h) => h.label),
    story: stay.story,
    addressLine: stay.addressLine,
    latitude: num(stay.latitude),
    longitude: num(stay.longitude),
    acres: num(stay.acres),
    checkInTime: stay.checkInTime,
    checkOutTime: stay.checkOutTime,
    inspectedOn: stay.inspectedOn,
    inspectedBy: stay.inspectedBy,
    cancellationPolicy: stay.cancellationPolicy,
    metaTitle: stay.metaTitle,
    metaDescription: stay.metaDescription,
    owner: toOwnerPublic(stay.owner),
    images: stay.images.map(toStayImage),
    rooms: stay.rooms.map(toRoom),
    // Only surface experiences that are themselves published.
    experiences: stay.experiences
      .filter((link) => link.experience.isPublished)
      .map(toExperience),
    nearbyPlaces: stay.nearbyPlaces.map(toNearbyPlace),
    amenities: stay.amenities.map((a) => ({
      id: a.amenity.id,
      name: a.amenity.name,
      icon: a.amenity.icon,
      category: a.amenity.category,
    })),
    reviews,
  };
}

/**
 * "Places to visit around this stay."
 *
 * Scoped to one stay by design — there is no destination-wide activities table.
 */
export async function getNearbyPlaces(
  stayId: string,
): Promise<NearbyPlaceView[]> {
  const places = await prisma.nearbyPlace.findMany({
    where: { stayId },
    orderBy: { sortOrder: "asc" },
  });

  return places.map(toNearbyPlace);
}

/**
 * Published reviews for a stay, most recent stay date first.
 *
 * Delegates to the review service, which owns reviews and the denormalised
 * rating that hangs off them. Kept here so existing callers do not break.
 */
export async function getStayReviews(stayId: string): Promise<ReviewView[]> {
  return getReviewsForStay(stayId);
}

/**
 * "Similar stays" — stays sharing a tag with this one, or in the same area.
 *
 * Ranked by how many tags they share, then by FitScore. Falls back to any other
 * published stay if nothing overlaps, so the section is never empty.
 */
export async function getRelatedStays(
  stayId: string,
  limit = 3,
): Promise<StayCard[]> {
  const stay = await prisma.stay.findUnique({
    where: { id: stayId },
    select: {
      area: true,
      tags: { select: { tag: { select: { slug: true } } } },
    },
  });
  if (!stay) return [];

  const tagSlugs = stay.tags.map((t) => t.tag.slug);

  const candidates = await prisma.stay.findMany({
    where: {
      ...PUBLISHED,
      id: { not: stayId },
      OR: [
        { tags: { some: { tag: { slug: { in: tagSlugs } } } } },
        { area: stay.area },
      ],
    },
    select: { ...cardSelect, area: true },
    orderBy: { fitScore: "desc" },
  });

  // Rank in memory: Postgres cannot order by "number of shared tags" without an
  // awkward raw query, and the candidate set here is small by construction.
  const ranked = candidates
    .map((c) => ({
      stay: c,
      shared: c.tags.filter((t) => tagSlugs.includes(t.tag.slug)).length,
      sameArea: c.area === stay.area ? 1 : 0,
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.sameArea - a.sameArea ||
        (b.stay.fitScore ?? 0) - (a.stay.fitScore ?? 0),
    );

  return ranked.slice(0, limit).map((r) => toStayCard(r.stay));
}

/**
 * The availability calendar for a date range.
 *
 * `price` is resolved here: the per-date override if one exists, else the
 * stay's base price. Callers should not have to know that rule.
 */
export async function getStayAvailability(
  stayId: string,
  from: Date,
  to: Date,
): Promise<AvailabilityDay[]> {
  const [stay, days] = await Promise.all([
    prisma.stay.findUnique({
      where: { id: stayId },
      select: { basePricePerNight: true },
    }),
    prisma.stayAvailability.findMany({
      where: { stayId, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    }),
  ]);

  if (!stay) return [];
  const basePrice = numReq(stay.basePricePerNight);

  return days.map((d) => ({
    date: d.date,
    status: d.status,
    price: num(d.priceOverride) ?? basePrice,
  }));
}
