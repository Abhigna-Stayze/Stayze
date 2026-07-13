import { z } from "zod";
import { BUCKETS } from "@/lib/storage";

/**
 * Request schemas.
 *
 * Kept apart from the routes so the same shape can be reused by a future admin
 * dashboard, a mobile client or a test — and so the contract is readable in one
 * file rather than scattered across ten route handlers.
 */

/** Query params arrive as strings. Coerce, then validate as a number. */
const numberFromQuery = z.coerce.number();

/** `?tag=pool&tag=luxury` and `?tag=pool` must both produce an array. */
const stringArrayFromQuery = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (Array.isArray(v) ? v : [v]));

// --- Stays -----------------------------------------------------------------

export const stayQuerySchema = z
  .object({
    /** `?featured=true` narrows to the Home row. */
    featured: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),
    tag: stringArrayFromQuery.optional(),
    area: z.string().min(1).optional(),
    minPrice: numberFromQuery.nonnegative().optional(),
    maxPrice: numberFromQuery.nonnegative().optional(),
    guests: numberFromQuery.int().positive().optional(),
    limit: numberFromQuery.int().positive().max(50).optional(),
  })
  .refine(
    (q) =>
      q.minPrice === undefined ||
      q.maxPrice === undefined ||
      q.minPrice <= q.maxPrice,
    { message: "minPrice must not exceed maxPrice.", path: ["minPrice"] },
  );

export type StayQuery = z.infer<typeof stayQuerySchema>;

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9-]+$/,
    "Slug may contain lowercase letters, numbers and hyphens only.",
  );

// --- Guides ----------------------------------------------------------------

export const guideQuerySchema = z.object({
  category: z.string().min(1).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  limit: numberFromQuery.int().positive().max(50).optional(),
});

// --- Reviews ---------------------------------------------------------------

export const reviewQuerySchema = z.object({
  /** Reviews are always scoped to a stay — there is no global review feed. */
  stay: slugSchema,
  /**
   * Include unpublished reviews — the moderation queue. Admin only; the route
   * enforces that. Without it, only published reviews come back.
   */
  includeUnpublished: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const reviewSourceSchema = z.enum(["DIRECT", "AIRBNB", "GOOGLE", "MMT"]);

/** Ratings are whole stars. 4.5 is not a rating a guest can give. */
const ratingSchema = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  staySlug: slugSchema,
  guestName: z.string().trim().min(2).max(100),
  rating: ratingSchema,
  title: z.string().trim().max(200).optional().nullable(),
  comment: z.string().trim().min(1).max(5000),
  stayedOn: z.coerce.date().optional().nullable(),
  source: reviewSourceSchema,
  /** Defaults to false — moderate before it counts towards the rating. */
  isPublished: z.boolean().optional(),
});

/**
 * Edit, publish or unpublish. All three are the same operation: a field
 * changes, and the stay's rating is recomputed.
 */
export const updateReviewSchema = z
  .object({
    guestName: z.string().trim().min(2).max(100).optional(),
    rating: ratingSchema.optional(),
    title: z.string().trim().max(200).optional().nullable(),
    comment: z.string().trim().min(1).max(5000).optional(),
    stayedOn: z.coerce.date().optional().nullable(),
    source: reviewSourceSchema.optional(),
    isPublished: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field to update.",
  });

// --- Booking ---------------------------------------------------------------

/**
 * A date the client sent as "2026-08-14" or a full ISO timestamp.
 * Normalised to midnight UTC: a booking is for a day, not a moment.
 *
 * The union comes first so that a missing or non-date value reports as
 * "expected string or date", rather than z.coerce.date()'s baffling
 * "expected date, received Date" (which is what `new Date(undefined)` yields).
 */
const bookingDate = z
  .union([z.string(), z.date()])
  .pipe(z.coerce.date())
  .transform(
    (d) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
  );

export const createBookingSchema = z
  .object({
    staySlug: slugSchema,
    guestName: z.string().trim().min(2).max(100),
    // Deliberately permissive: guests type numbers in a dozen formats, and a
    // booking enquiry that a human will read is not the place to be strict.
    guestPhone: z.string().trim().min(6).max(30),
    guestEmail: z.email().optional().nullable(),
    checkIn: bookingDate,
    checkOut: bookingDate,
    adults: z.number().int().min(1).max(30),
    children: z.number().int().min(0).max(30).optional(),
    note: z.string().trim().max(1000).optional().nullable(),
  })
  .refine((b) => b.checkOut > b.checkIn, {
    message: "checkOut must be after checkIn.",
    path: ["checkOut"],
  })
  .refine((b) => b.checkIn >= startOfTodayUtc(), {
    message: "checkIn cannot be in the past.",
    path: ["checkIn"],
  });

export type CreateBookingBody = z.infer<typeof createBookingSchema>;

/** The public reference code, e.g. STZ-8F3K2. Case-insensitive on the way in. */
export const referenceSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .pipe(
    z.string().regex(/^STZ-[A-Z0-9]{4,8}$/, "Not a valid booking reference."),
  );

// --- Upload ----------------------------------------------------------------

/** 10 MB. Generous for a photo, small enough to refuse a video by accident. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const uploadSchema = z.object({
  bucket: z.enum(BUCKETS),
  /**
   * Path inside the bucket. No leading slash, no "..", no backslashes — a path
   * is not a place to accept arbitrary user input.
   */
  path: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9/_-]*\.[a-zA-Z0-9]+$/,
      "Path must be a relative file path such as property-001/hero.jpg.",
    )
    .refine((p) => !p.includes(".."), "Path may not contain '..'."),
  upsert: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

/**
 * Optionally attach the uploaded object to a row, in the same request.
 *
 * Upload-then-attach as two calls is what produces orphans: the first succeeds,
 * the client dies, and the bucket keeps a file no row points at. Doing both in
 * one request lets the server clean up after itself if the attach fails.
 *
 * `target` selects the row type; `targetId` is the row's id, except for
 * stay-image (the stay's SLUG) and guide-cover (the guide's SLUG), which are
 * the identifiers a caller actually has to hand.
 */
export const attachTargets = [
  "stay-image",
  "review-image",
  "owner-photo",
  "room-image",
  "experience-image",
  "nearby-image",
  "guide-cover",
] as const;

export type AttachTarget = (typeof attachTargets)[number];

export const attachSchema = z.object({
  target: z.enum(attachTargets),
  targetId: z.string().min(1).max(200),
  /** stay-image only. */
  altText: z.string().max(300).optional(),
  caption: z.string().max(300).optional(),
  isHero: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  sortOrder: numberFromQuery.int().nonnegative().optional(),
});

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
