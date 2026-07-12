import "server-only";
import { getPublicUrlOrNull } from "@/lib/storage";
import type {
  ExperienceView,
  NearbyPlaceView,
  OwnerPublicView,
  ReviewView,
  RoomView,
  StayCard,
  StayImageView,
} from "@/services/types";

/**
 * Prisma row -> service DTO.
 *
 * Everything the services return passes through here, so the two conversions
 * that would otherwise be forgotten happen in exactly one place:
 *   - Decimal  -> number   (Decimal cannot cross to a client component)
 *   - bucket+path -> URL   (so the UI never touches storage)
 */

/** Prisma Decimal | null -> number | null. */
export function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

/** Prisma Decimal -> number, for columns that are NOT NULL. */
export function numReq(value: unknown): number {
  return Number(value);
}

// Structural row types. Written against what the queries below actually select,
// rather than importing Prisma's generated payload types, which get unwieldy
// once you nest four levels of include.

type ImageRow = {
  id: string;
  bucket: string;
  path: string;
  altText: string | null;
  caption: string | null;
  mediaType: string;
  isHero: boolean;
  width: number | null;
  height: number | null;
};

type StayRowForCard = {
  id: string;
  slug: string;
  name: string;
  type: string;
  tagline: string | null;
  storyExcerpt: string | null;
  area: string;
  distanceFromTownKm: unknown;
  basePricePerNight: unknown;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  ratingAvg: unknown;
  reviewCount: number;
  fitScore: number | null;
  tier: string | null;
  verification: string;
  images?: ImageRow[];
  highlights?: Array<{ label: string }>;
  tags?: Array<{ tag: { name: string; slug: string } }>;
};

export function toStayCard(stay: StayRowForCard): StayCard {
  // The hero, or the first image if none is flagged — a stay with no hero
  // should still render a card rather than a hole.
  const hero = stay.images?.find((i) => i.isHero) ?? stay.images?.[0] ?? null;

  return {
    id: stay.id,
    slug: stay.slug,
    name: stay.name,
    type: stay.type,
    tagline: stay.tagline,
    storyExcerpt: stay.storyExcerpt,
    area: stay.area,
    distanceFromTownKm: num(stay.distanceFromTownKm),
    basePricePerNight: numReq(stay.basePricePerNight),
    currency: stay.currency,
    maxGuests: stay.maxGuests,
    bedrooms: stay.bedrooms,
    bathrooms: stay.bathrooms,
    ratingAvg: num(stay.ratingAvg),
    reviewCount: stay.reviewCount,
    fitScore: stay.fitScore,
    tier: stay.tier,
    verification: stay.verification,
    heroImageUrl: hero ? getPublicUrlOrNull(hero) : null,
    heroImageAlt: hero?.altText ?? null,
    highlights: (stay.highlights ?? []).map((h) => h.label),
    tags: (stay.tags ?? []).map((t) => ({
      name: t.tag.name,
      slug: t.tag.slug,
    })),
  };
}

export function toStayImage(image: ImageRow): StayImageView {
  return {
    id: image.id,
    url: getPublicUrlOrNull(image) ?? "",
    altText: image.altText,
    caption: image.caption,
    mediaType: image.mediaType,
    isHero: image.isHero,
    width: image.width,
    height: image.height,
  };
}

export function toRoom(room: {
  id: string;
  name: string;
  description: string | null;
  bedType: string | null;
  maxGuests: number;
  imageBucket: string | null;
  imagePath: string | null;
}): RoomView {
  return {
    id: room.id,
    name: room.name,
    description: room.description,
    bedType: room.bedType,
    maxGuests: room.maxGuests,
    imageUrl: getPublicUrlOrNull({
      bucket: room.imageBucket,
      path: room.imagePath,
    }),
  };
}

export function toExperience(exp: {
  id: string;
  title: string;
  description: string | null;
  imageBucket: string | null;
  imagePath: string | null;
}): ExperienceView {
  return {
    id: exp.id,
    title: exp.title,
    description: exp.description,
    imageUrl: getPublicUrlOrNull({
      bucket: exp.imageBucket,
      path: exp.imagePath,
    }),
  };
}

export function toNearbyPlace(place: {
  id: string;
  name: string;
  description: string | null;
  category: string;
  distanceKm: unknown;
  driveTimeMinutes: number | null;
  imageBucket: string | null;
  imagePath: string | null;
  mapsUrl: string | null;
}): NearbyPlaceView {
  return {
    id: place.id,
    name: place.name,
    description: place.description,
    category: place.category,
    distanceKm: num(place.distanceKm),
    driveTimeMinutes: place.driveTimeMinutes,
    imageUrl: getPublicUrlOrNull({
      bucket: place.imageBucket,
      path: place.imagePath,
    }),
    // An external Google Maps link, not a stored object. Passes through as-is.
    mapsUrl: place.mapsUrl,
  };
}

export function toReview(review: {
  id: string;
  guestName: string;
  rating: number;
  title: string | null;
  comment: string;
  stayedOn: Date | null;
  source: string;
  images?: Array<{ id: string; bucket: string; path: string }>;
}): ReviewView {
  return {
    id: review.id,
    guestName: review.guestName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    stayedOn: review.stayedOn,
    source: review.source,
    images: (review.images ?? []).map((img) => ({
      id: img.id,
      url: getPublicUrlOrNull(img) ?? "",
    })),
  };
}

/**
 * The owner, stripped to what the public may see.
 *
 * `phone` and `email` are never copied across. If the owner has opted out of a
 * public profile, this returns null and the "Meet your host" block disappears.
 */
export function toOwnerPublic(owner: {
  id: string;
  name: string;
  bio: string | null;
  hostingSince: number | null;
  languages: string[];
  location: string | null;
  photoBucket: string | null;
  photoPath: string | null;
  isPublicProfile: boolean;
}): OwnerPublicView | null {
  if (!owner.isPublicProfile) return null;

  return {
    id: owner.id,
    name: owner.name,
    bio: owner.bio,
    hostingSince: owner.hostingSince,
    languages: owner.languages,
    location: owner.location,
    photoUrl: getPublicUrlOrNull({
      bucket: owner.photoBucket,
      path: owner.photoPath,
    }),
  };
}
