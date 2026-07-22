import { z } from "zod";

/**
 * The Stay create/edit contract — a **pure** Zod module (no `server-only`, no
 * data access), so the admin form (`react-hook-form` + `zodResolver`) and the
 * REST route validate against exactly one schema. The service is still the
 * authority; this stops obvious mistakes before they cost a round trip and
 * keeps the two validations from drifting.
 *
 * A few fields aren't in the phase brief but are **required by the Stay model**
 * for the page to render (`story`, `area`, `bathrooms`) — a stay onboarded
 * without them wouldn't display, so they're first-class here.
 */

export const STAY_STATUSES = ["DRAFT", "PUBLISHED", "HIDDEN"] as const;
export type StayStatusValue = (typeof STAY_STATUSES)[number];

export const VERIFICATIONS = ["DIRECTORY", "VERIFIED"] as const;

/** Optional free-text field: allow empty string from the form, treat as absent. */
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

/**
 * An optional number that a form leaves as an empty string when blank. Coerce
 * the empty/undefined case to `null` *before* the number check, so an untouched
 * field is "absent", not zero.
 */
const optionalNumber = (inner: z.ZodType<number>) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    inner.nullable(),
  );

/**
 * A stored Storage object, as the upload endpoint returns it. `url` is carried
 * only so the form can render a preview; the service reads bucket + path and
 * derives the URL itself, so this is ignored server-side (and stripped by the
 * schema if it's ever malformed).
 */
export const mediaRefSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
  url: z.string().optional().nullable(),
});

/** A gallery image carries a little extra: alt text, caption, intrinsic size. */
export const galleryImageSchema = mediaRefSchema.extend({
  altText: z.string().trim().max(200).optional().nullable(),
  caption: z.string().trim().max(200).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
});
export type GalleryImage = z.infer<typeof galleryImageSchema>;

/** Place categories, mirroring the Prisma `PlaceCategory` enum. */
export const PLACE_CATEGORIES = [
  "WATERFALL",
  "VIEWPOINT",
  "TREK",
  "CAFE",
  "TEMPLE",
  "ESTATE",
  "LAKE",
  "OTHER",
] as const;

/** A stay highlight — label + optional icon key. Order comes from the array. */
export const highlightSchema = z.object({
  label: z.string().trim().min(1, "A label is required.").max(80),
  icon: z.string().trim().max(40).optional().nullable(),
});
export type HighlightItem = z.infer<typeof highlightSchema>;

/** A room. No price column exists on Room, so there's no price here. */
export const roomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required.").max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  bedType: z.string().trim().max(80).optional().nullable(),
  maxGuests: z.coerce.number().int().min(1, "At least one guest."),
  image: mediaRefSchema.nullish(),
});
export type RoomItem = z.infer<typeof roomSchema>;

/** A nearby place. */
export const nearbyPlaceSchema = z.object({
  name: z.string().trim().min(1, "Place name is required.").max(120),
  category: z.enum(PLACE_CATEGORIES),
  description: z.string().trim().max(500).optional().nullable(),
  distanceKm: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().nonnegative().nullable(),
  ),
  driveTimeMinutes: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().int().nonnegative().nullable(),
  ),
  mapsUrl: z.string().trim().url().optional().or(z.literal("")),
  image: mediaRefSchema.nullish(),
});
export type NearbyItem = z.infer<typeof nearbyPlaceSchema>;

/** A phone number — lenient (owners give many formats), digits-ish, 7–20 chars. */
const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(20)
  .regex(/^[+0-9()\s-]+$/, "Enter a valid phone number.");

/** A Google Maps link, when given: a real URL that points at Google Maps. */
const mapsUrl = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine(
    (u) => /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(u),
    "That doesn’t look like a Google Maps link.",
  )
  .optional()
  .or(z.literal(""));

export const stayFormSchema = z.object({
  // --- Section 1 · Owner ---
  ownerName: z.string().trim().min(2, "Owner name is required."),
  ownerPhone: phone,
  ownerBio: optionalText(2000),
  ownerPhotoRef: mediaRefSchema.nullish(),

  // --- Section 2 · Property ---
  name: z.string().trim().min(2, "Property name is required."),
  type: z.string().trim().min(2, "Property type is required."),
  tagline: optionalText(160),
  area: z.string().trim().min(2, "Area is required."),
  addressLine: optionalText(300),
  mapsUrl,
  latitude: optionalNumber(z.coerce.number().min(-90).max(90)),
  longitude: optionalNumber(z.coerce.number().min(-180).max(180)),
  story: z
    .string()
    .trim()
    .min(20, "Tell the story — at least a sentence or two."),
  storyExcerpt: optionalText(280),
  basePricePerNight: z.coerce
    .number()
    .positive("Price per night must be greater than zero."),
  bedrooms: z.coerce.number().int().min(0, "Rooms can’t be negative."),
  bathrooms: z.coerce.number().int().min(0, "Bathrooms can’t be negative."),
  maxGuests: z.coerce.number().int().min(1, "At least one guest."),
  acres: optionalNumber(z.coerce.number().nonnegative()),
  distanceFromTownKm: optionalNumber(z.coerce.number().nonnegative()),
  checkInTime: z.string().trim().min(1, "Check-in time is required."),
  checkOutTime: z.string().trim().min(1, "Check-out time is required."),

  // --- Nested collections (existing models) ---
  highlights: z.array(highlightSchema).default([]),
  rooms: z.array(roomSchema).default([]),
  nearbyPlaces: z.array(nearbyPlaceSchema).default([]),
  // Experiences are managed centrally (the Experience module); a stay only
  // *ticks* which managed experiences it offers. These are Experience ids.
  experienceIds: z.array(z.string()).default([]),

  // --- Section 3 · Amenities ---
  amenityIds: z.array(z.string()).default([]),

  // --- Trust & publishing ---
  status: z.enum(STAY_STATUSES).default("DRAFT"),
  verification: z.enum(VERIFICATIONS).default("DIRECTORY"),
  fitScore: optionalNumber(z.coerce.number().int().min(0).max(100)),
  inspectedBy: optionalText(120),
  inspectedOn: z.string().trim().optional().nullable(),
  caretakerName: optionalText(120),
  caretakerPhone: optionalText(20),
  cancellationPolicy: optionalText(2000),
  isFeatured: z.boolean().default(false),
  metaTitle: optionalText(160),
  metaDescription: optionalText(300),
  slug: optionalText(80),

  // --- Media ---
  coverImage: galleryImageSchema.nullish(), // the hero
  gallery: z.array(galleryImageSchema).default([]),
  menuImageRef: mediaRefSchema.nullish(), // the food menu, as a photo

  // Set true by "Publish" from the list; the form uses `status`.
});

export type StayFormValues = z.infer<typeof stayFormSchema>;

/** The form's *input* shape (before Zod coerces/transforms). Used by RHF. */
export type StayFormInput = z.input<typeof stayFormSchema>;

/** The empty form — sensible defaults for a fresh draft. */
export const emptyStayForm: StayFormValues = {
  ownerName: "",
  ownerPhone: "",
  ownerBio: "",
  ownerPhotoRef: null,
  name: "",
  type: "",
  tagline: "",
  area: "",
  addressLine: "",
  mapsUrl: "",
  latitude: null,
  longitude: null,
  story: "",
  storyExcerpt: "",
  basePricePerNight: 0,
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  acres: null,
  distanceFromTownKm: null,
  checkInTime: "2:00 PM",
  checkOutTime: "11:00 AM",
  highlights: [],
  rooms: [],
  nearbyPlaces: [],
  experienceIds: [],
  amenityIds: [],
  slug: "",
  status: "DRAFT",
  verification: "DIRECTORY",
  fitScore: null,
  inspectedBy: "",
  inspectedOn: null,
  caretakerName: "",
  caretakerPhone: "",
  cancellationPolicy: "",
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
  coverImage: null,
  gallery: [],
  menuImageRef: null,
};

/** The status-only payload for the list's Publish / Unpublish / Hide actions. */
export const stayStatusSchema = z.object({
  status: z.enum(STAY_STATUSES),
});
