import "server-only";

/**
 * Shared shapes returned by the service layer.
 *
 * Services return these, not raw Prisma rows. Two reasons, both load-bearing:
 *
 *  1. **Prisma `Decimal` cannot cross the server/client boundary.** Money,
 *     coordinates and ratings come out of Prisma as Decimal objects. Passing
 *     one to a client component throws ("only plain objects can be passed").
 *     Services convert them to `number` exactly once, here.
 *
 *  2. **The UI must never resolve a storage path.** Rows hold `bucket` + `path`;
 *     components need a URL. Services do that translation through storage.ts,
 *     so no page ever imports the Supabase client.
 */

export type StayCard = {
  id: string;
  slug: string;
  name: string;
  type: string;
  tagline: string | null;
  storyExcerpt: string | null;
  area: string;
  distanceFromTownKm: number | null;
  basePricePerNight: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  ratingAvg: number | null;
  reviewCount: number;
  fitScore: number | null;
  tier: string | null;
  verification: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  /** The 2–3 signature features shown on the card. */
  highlights: string[];
  tags: Array<{ name: string; slug: string }>;
};

export type StayImageView = {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  mediaType: string;
  isHero: boolean;
  width: number | null;
  height: number | null;
};

export type RoomView = {
  id: string;
  name: string;
  description: string | null;
  bedType: string | null;
  maxGuests: number;
  imageUrl: string | null;
};

export type ExperienceView = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

export type NearbyPlaceView = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  distanceKm: number | null;
  driveTimeMinutes: number | null;
  imageUrl: string | null;
  mapsUrl: string | null;
};

export type ReviewView = {
  id: string;
  guestName: string;
  rating: number;
  title: string | null;
  comment: string;
  stayedOn: Date | null;
  source: string;
  images: Array<{ id: string; url: string }>;
};

/**
 * The owner as the public sees them.
 *
 * `phone` and `email` are deliberately absent. They exist on the Owner table
 * and are internal-ops only — this type is how that rule is enforced in code
 * rather than remembered in a component.
 */
export type OwnerPublicView = {
  id: string;
  name: string;
  bio: string | null;
  hostingSince: number | null;
  languages: string[];
  location: string | null;
  photoUrl: string | null;
};

export type StayDetail = StayCard & {
  story: string;
  addressLine: string | null;
  latitude: number | null;
  longitude: number | null;
  acres: number | null;
  checkInTime: string;
  checkOutTime: string;
  inspectedOn: Date | null;
  inspectedBy: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  /** Public profile only, and only when the owner has not opted out. */
  owner: OwnerPublicView | null;
  images: StayImageView[];
  rooms: RoomView[];
  experiences: ExperienceView[];
  nearbyPlaces: NearbyPlaceView[];
  amenities: Array<{
    id: string;
    name: string;
    icon: string | null;
    category: string | null;
  }>;
  reviews: ReviewView[];
};

export type AvailabilityDay = {
  date: Date;
  status: string;
  /** The price for this specific night — the override if set, else the base. */
  price: number;
};

export type GuideCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: { name: string; slug: string };
  readTimeMinutes: number | null;
  author: string | null;
  publishedAt: Date | null;
};

export type GuideDetail = GuideCard & {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  /** Stays featured in the guide. */
  stays: StayCard[];
};

export type TimelineStepView = {
  id: string;
  stepKey: string;
  title: string;
  content: string | null;
  status: string;
  sortOrder: number;
  completedAt: Date | null;
};

export type BookingView = {
  id: string;
  reference: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  adults: number;
  children: number;
  note: string | null;
  estimatedTotal: number | null;
  status: string;
  createdAt: Date;
  stay: StayCard;
  timeline: TimelineStepView[];
  /**
   * The caretaker's phone is PRIVATE and only revealed once the booking is
   * confirmed. Null before that — see booking.service.ts.
   */
  caretakerName: string | null;
  caretakerPhone: string | null;
};

export type SiteSettings = {
  whatsappNumber: string;
  supportPhone: string | null;
  supportEmail: string | null;
  instagramUrl: string | null;
};
