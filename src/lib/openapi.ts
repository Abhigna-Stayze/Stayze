import "server-only";
import { z } from "zod";
import { createDocument } from "zod-openapi";
import {
  attachTargets,
  createBookingSchema,
  createReviewSchema,
  guideQuerySchema,
  stayQuerySchema,
  updateReviewSchema,
} from "@/lib/schemas";
import { BUCKETS } from "@/lib/storage";
import type {
  BookingView,
  ExperienceCard,
  ExperienceDetail,
  GuideCard,
  GuideDetail,
  NearbyPlaceView,
  ReviewView,
  SiteSettings,
  StayCard,
  StayDetail,
} from "@/services/types";

/**
 * The OpenAPI document, generated from the Zod schemas the API actually
 * validates with — not hand-written alongside them.
 *
 * That is the whole point. A hand-written spec is a second source of truth and
 * goes quietly wrong the first time someone edits a schema. Here, the request
 * schemas ARE the ones in schemas.ts, and the response schemas are pinned to
 * the service DTOs by the compile-time check below: change a DTO without
 * changing its schema and `npm run typecheck` fails.
 *
 * Served as JSON at /api/openapi.json and rendered at /api/docs.
 */

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

/**
 * What a DTO looks like once it has been through JSON.stringify.
 *
 * Services return `Date` objects; the API sends ISO strings. Documenting the
 * DTO as-is would describe a shape no client ever receives.
 */
type Jsonify<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Jsonify<U>[]
    : T extends object
      ? { [K in keyof T]: Jsonify<T[K]> }
      : T;

/** True only if A and B are mutually assignable. */
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/**
 * Pins a Zod schema to a service DTO. If the two drift, this stops compiling.
 * It is the only thing keeping the published docs honest.
 *
 * Curried so the DTO is given explicitly while the schema type is still
 * inferred — `pin<StayCard>()(z.object({…}))`. Naming both would erase the
 * inference the check depends on.
 */
function pin<Dto>() {
  return function <Schema extends z.ZodType>(
    schema: Schema,
    // Never passed. Its TYPE is the check: when the schema and the DTO disagree
    // this becomes a required `never` argument and the call stops compiling.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._proof: Exact<z.infer<Schema>, Jsonify<Dto>> extends true ? [] : [never]
  ): Schema {
    return schema;
  };
}

const dateTime = z.iso.datetime();
const nullableDateTime = z.iso.datetime().nullable();

// ---------------------------------------------------------------------------
// Response schemas — pinned to src/services/types.ts
// ---------------------------------------------------------------------------

const tagRef = z.object({ name: z.string(), slug: z.string() });

const stayCardSchema = pin<StayCard>()(
  z
    .object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      type: z.string(),
      tagline: z.string().nullable(),
      storyExcerpt: z.string().nullable(),
      area: z.string(),
      distanceFromTownKm: z.number().nullable(),
      basePricePerNight: z.number(),
      currency: z.string(),
      maxGuests: z.number(),
      bedrooms: z.number(),
      bathrooms: z.number(),
      ratingAvg: z.number().nullable(),
      reviewCount: z.number(),
      fitScore: z.number().nullable(),
      tier: z.string().nullable(),
      verification: z.string(),
      createdAt: dateTime,
      heroImageUrl: z.string().nullable(),
      heroImageAlt: z.string().nullable(),
      highlights: z.array(z.string()),
      tags: z.array(tagRef),
    })
    .meta({ id: "StayCard" }),
);

const amenitySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  category: z.string().nullable(),
});

const reviewSchema = pin<ReviewView>()(
  z
    .object({
      id: z.string(),
      guestName: z.string(),
      rating: z.number(),
      title: z.string().nullable(),
      comment: z.string(),
      stayedOn: nullableDateTime,
      source: z.string(),
      images: z
        .array(z.object({ id: z.string(), url: z.string().nullable() }))
        .meta({
          description:
            "Guest photos live in a PRIVATE bucket, so `url` is a short-lived SIGNED url, not a permanent one. It expires — do not cache or store it. Null when the object could not be signed.",
        }),
    })
    .meta({ id: "Review" }),
);

const nearbyPlaceSchema = pin<NearbyPlaceView>()(
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      category: z.string(),
      distanceKm: z.number().nullable(),
      driveTimeMinutes: z.number().nullable(),
      imageUrl: z.string().nullable(),
      mapsUrl: z.string().nullable(),
    })
    .meta({ id: "NearbyPlace" }),
);

const stayDetailSchema = pin<StayDetail>()(
  z
    .object({
      // StayCard
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      type: z.string(),
      tagline: z.string().nullable(),
      storyExcerpt: z.string().nullable(),
      area: z.string(),
      distanceFromTownKm: z.number().nullable(),
      basePricePerNight: z.number(),
      currency: z.string(),
      maxGuests: z.number(),
      bedrooms: z.number(),
      bathrooms: z.number(),
      ratingAvg: z.number().nullable(),
      reviewCount: z.number(),
      fitScore: z.number().nullable(),
      tier: z.string().nullable(),
      verification: z.string(),
      createdAt: dateTime,
      heroImageUrl: z.string().nullable(),
      heroImageAlt: z.string().nullable(),
      highlights: z.array(z.string()),
      tags: z.array(tagRef),
      // + detail
      story: z.string(),
      addressLine: z.string().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      acres: z.number().nullable(),
      checkInTime: z.string(),
      checkOutTime: z.string(),
      inspectedOn: nullableDateTime,
      inspectedBy: z.string().nullable(),
      cancellationPolicy: z.string().nullable().meta({
        description:
          "Free text. Cancellation is recorded, not enforced — there is no payment, so there is nothing to refund automatically.",
      }),
      metaTitle: z.string().nullable(),
      metaDescription: z.string().nullable(),
      owner: z
        .object({
          id: z.string(),
          name: z.string(),
          bio: z.string().nullable(),
          hostingSince: z.number().nullable(),
          languages: z.array(z.string()),
          location: z.string().nullable(),
          photoUrl: z.string().nullable(),
        })
        .nullable()
        .meta({
          description:
            "Public profile only. The owner's phone and email are internal-ops and are never returned.",
        }),
      images: z.array(
        z.object({
          id: z.string(),
          url: z.string(),
          altText: z.string().nullable(),
          caption: z.string().nullable(),
          mediaType: z.string(),
          isHero: z.boolean(),
          width: z.number().nullable(),
          height: z.number().nullable(),
        }),
      ),
      rooms: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          bedType: z.string().nullable(),
          maxGuests: z.number(),
          imageUrl: z.string().nullable(),
        }),
      ),
      experiences: z.array(
        z.object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          imageUrl: z.string().nullable(),
        }),
      ),
      nearbyPlaces: z.array(nearbyPlaceSchema),
      amenities: z.array(amenitySchema),
      reviews: z.array(reviewSchema),
    })
    .meta({ id: "StayDetail" }),
);

const guideCardSchema = pin<GuideCard>()(
  z
    .object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      excerpt: z.string().nullable(),
      coverImageUrl: z.string().nullable(),
      category: tagRef,
      readTimeMinutes: z.number().nullable(),
      author: z.string().nullable(),
      publishedAt: nullableDateTime,
    })
    .meta({ id: "GuideCard" }),
);

const guideDetailSchema = pin<GuideDetail>()(
  z
    .object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      excerpt: z.string().nullable(),
      coverImageUrl: z.string().nullable(),
      category: tagRef,
      readTimeMinutes: z.number().nullable(),
      author: z.string().nullable(),
      publishedAt: nullableDateTime,
      body: z.string().meta({ description: "Markdown." }),
      metaTitle: z.string().nullable(),
      metaDescription: z.string().nullable(),
      stays: z.array(stayCardSchema),
    })
    .meta({ id: "GuideDetail" }),
);

const bookingSchema = pin<BookingView>()(
  z
    .object({
      id: z.string(),
      reference: z.string(),
      guestName: z.string(),
      guestPhone: z.string(),
      guestEmail: z.string().nullable(),
      checkIn: dateTime,
      checkOut: dateTime,
      nights: z.number(),
      adults: z.number(),
      children: z.number(),
      note: z.string().nullable(),
      estimatedTotal: z.number().nullable(),
      status: z.string(),
      cancelledAt: nullableDateTime.meta({
        description:
          "Recorded, not enforced. Setting it does not change `status` — cancellation logic is deliberately not implemented.",
      }),
      cancellationReason: z.string().nullable(),
      createdAt: dateTime,
      stay: stayCardSchema,
      timeline: z.array(
        z.object({
          id: z.string(),
          stepKey: z.string(),
          title: z.string(),
          content: z.string().nullable(),
          status: z.string(),
          sortOrder: z.number(),
          completedAt: nullableDateTime,
        }),
      ),
      caretakerName: z.string().nullable(),
      caretakerPhone: z.string().nullable().meta({
        description:
          "PRIVATE. Null until the booking is CONFIRMED — reference codes are guessable.",
      }),
    })
    .meta({ id: "Booking" }),
);

const experienceCardSchema = pin<ExperienceCard>()(
  z
    .object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      excerpt: z.string().nullable(),
      imageUrl: z.string().nullable(),
    })
    .meta({ id: "ExperienceCard" }),
);

const experienceDetailSchema = pin<ExperienceDetail>()(
  z
    .object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      excerpt: z.string().nullable(),
      imageUrl: z.string().nullable(),
      story: z.string(),
      metaTitle: z.string().nullable(),
      metaDescription: z.string().nullable(),
      stays: z.array(stayCardSchema).meta({
        description: "Published stays where this experience is offered.",
      }),
    })
    .meta({ id: "ExperienceDetail" }),
);

const ratingResultSchema = z
  .object({
    stayId: z.string(),
    ratingAvg: z.number().nullable(),
    reviewCount: z.number(),
  })
  .meta({
    id: "RatingResult",
    description:
      "The stay's rating AFTER the change. Recomputed in the same transaction, so this is the number the cards will now show.",
  });

const siteSettingsSchema = pin<SiteSettings>()(
  z.object({
    whatsappNumber: z.string(),
    supportPhone: z.string().nullable(),
    supportEmail: z.string().nullable(),
    instagramUrl: z.string().nullable(),
  }),
);

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

const success = <T extends z.ZodType>(data: T) =>
  z.object({ success: z.literal(true), data });

const errorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      message: z.string(),
      issues: z
        .array(z.object({ field: z.string(), message: z.string() }))
        .optional()
        .meta({ description: "Present on 422 only." }),
    }),
  })
  .meta({ id: "Error" });

const json = <T extends z.ZodType>(schema: T) => ({
  content: { "application/json": { schema } },
});

/** The failure responses every endpoint can produce. */
const errors = (...codes: number[]) =>
  Object.fromEntries(
    codes.map((code) => [
      String(code),
      { description: DESCRIPTIONS[code] ?? "Error", ...json(errorSchema) },
    ]),
  );

const DESCRIPTIONS: Record<number, string> = {
  400: "A rule the service enforces, or a body that never parsed.",
  401: "Missing or invalid x-admin-key.",
  404: "Not found, or not published.",
  409: "Already exists.",
  413: "File too large.",
  415: "Unsupported media type.",
  422: "Validation failed. See error.issues.",
  429: "Rate limited. See the Retry-After header.",
  500: "Something went wrong.",
  502: "Storage is unavailable.",
};

// zod-openapi derives a parameter's name and location from its key in
// `requestParams`, so annotating them again here is a conflict, not a hint.
const slugParam = z.string().meta({ example: "coffeecharm" });

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export function buildOpenApiDocument(): ReturnType<typeof createDocument> {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "Stayze API",
      version: "1.0.0",
      description: [
        "REST API for the Stayze customer portal — curated homestays in Chikmagalur.",
        "",
        "**Every response uses the same envelope**, so a client can branch on `success` without knowing which endpoint it called:",
        "",
        "```jsonc",
        '{ "success": true,  "data": … }',
        '{ "success": false, "error": { "message": "…", "issues": [ … ] } }',
        "```",
        "",
        "**Booking is a WhatsApp conversation, not a transaction.** There is no payment and no login. `POST /booking` stores the enquiry and returns a prefilled `wa.me` link plus a reference code — which is the only way a guest returns to their trip timeline.",
        "",
        "**Media is a reference, never a URL.** Postgres stores `bucket` + `path`; the API resolves it to a public URL at read time.",
        "",
        "This spec is generated from the same Zod schemas the API validates with, so it cannot drift from the implementation.",
      ].join("\n"),
    },
    servers: [{ url: "/api", description: "This deployment" }],
    // Public by default. The two admin endpoints override this with `adminKey`.
    // Without this, a validator cannot tell which endpoints are open and which
    // are guarded, and flags every one of them.
    security: [],
    tags: [
      { name: "Stays", description: "Explore, Home and Stay Detail." },
      { name: "Guides", description: "Travel guides — the SEO surface." },
      {
        name: "Booking",
        description: "WhatsApp enquiries and the trip timeline.",
      },
      {
        name: "Experiences",
        description:
          "Destination experiences — each has its own page. A StayExperience is now only the junction saying which stays offer one.",
      },
      { name: "Site", description: "Settings, filter chips, amenities." },
      { name: "Media", description: "Uploads. Admin only." },
    ],
    components: {
      securitySchemes: {
        adminKey: {
          type: "apiKey",
          in: "header",
          name: "x-admin-key",
          description:
            "Shared secret for the write endpoints. A stopgap until real auth exists — no identity, no audit trail.",
        },
      },
    },
    paths: {
      "/stays": {
        get: {
          tags: ["Stays"],
          summary: "List published stays",
          operationId: "listStays",
          description:
            "`?featured=true` returns the Home row, ordered by featuredOrder. Repeated `?tag=` values are ANDed: `?tag=pool&tag=luxury` means both, not either.",
          requestParams: { query: stayQuerySchema },
          responses: {
            "200": {
              description: "Matching stays.",
              ...json(success(z.array(stayCardSchema))),
            },
            ...errors(422, 500),
          },
        },
      },
      "/stays/{slug}": {
        get: {
          tags: ["Stays"],
          summary: "Full stay detail",
          operationId: "getStay",
          description:
            "Everything the Stay Detail page renders. 404 for an unknown slug *and* for a stay that exists but is not published — the two are indistinguishable from outside, deliberately.",
          requestParams: { path: z.object({ slug: slugParam }) },
          responses: {
            "200": {
              description: "The stay.",
              ...json(success(stayDetailSchema)),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/stays/{slug}/nearby": {
        get: {
          tags: ["Stays"],
          summary: "Places to visit around this stay",
          operationId: "listNearbyPlaces",
          description:
            "Scoped to one stay by design — there is no destination-wide activities table.",
          requestParams: { path: z.object({ slug: slugParam }) },
          responses: {
            "200": {
              description: "Nearby places.",
              ...json(success(z.array(nearbyPlaceSchema))),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/stays/{slug}/reviews": {
        get: {
          tags: ["Stays"],
          summary: "Published reviews for a stay",
          operationId: "listStayReviews",
          requestParams: { path: z.object({ slug: slugParam }) },
          responses: {
            "200": {
              description: "Reviews, most recent stay first.",
              ...json(success(z.array(reviewSchema))),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/stays/{slug}/related": {
        get: {
          tags: ["Stays"],
          summary: "Similar stays",
          operationId: "listRelatedStays",
          description:
            "Ranked by shared tags, then same area, then FitScore. Never empty for a published stay.",
          requestParams: {
            path: z.object({ slug: slugParam }),
            query: z.object({
              limit: z.coerce.number().int().positive().max(50).optional(),
            }),
          },
          responses: {
            "200": {
              description: "Related stays.",
              ...json(success(z.array(stayCardSchema))),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/guides": {
        get: {
          tags: ["Guides"],
          summary: "List published guides",
          operationId: "listGuides",
          requestParams: { query: guideQuerySchema },
          responses: {
            "200": {
              description: "Guides, newest first.",
              ...json(success(z.array(guideCardSchema))),
            },
            ...errors(422, 500),
          },
        },
      },
      "/guides/{slug}": {
        get: {
          tags: ["Guides"],
          summary: "A guide, with its body and featured stays",
          operationId: "getGuide",
          requestParams: { path: z.object({ slug: slugParam }) },
          responses: {
            "200": {
              description: "The guide.",
              ...json(success(guideDetailSchema)),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/reviews": {
        get: {
          tags: ["Stays"],
          summary: "Reviews for a stay (flat form)",
          operationId: "listReviews",
          description:
            "`stay` is required. There is no global review feed — a review only means something attached to the property it is about.",
          requestParams: {
            query: z.object({
              stay: z.string().meta({ example: "coffeecharm" }),
              includeUnpublished: z.enum(["true", "false"]).optional().meta({
                description:
                  "The moderation queue. REQUIRES x-admin-key — unpublished reviews have not been moderated and must never reach the public site.",
              }),
            }),
          },
          responses: {
            "200": {
              description:
                "Reviews. Guest photos are short-lived SIGNED urls — the reviews bucket is private.",
              ...json(success(z.array(reviewSchema))),
            },
            ...errors(401, 404, 422, 500),
          },
        },
        post: {
          tags: ["Stays"],
          summary: "Create a review",
          operationId: "createReview",
          description: [
            "Requires `x-admin-key`, deliberately: `Review` has no link to `BookingRequest`, so there is no way to establish that whoever posted it ever stayed. Reviews are entered by ops — including imported Airbnb and Google ones, which is what `source` is for.",
            "",
            "Defaults to `isPublished: false`. A new review does not move the stay's rating until it is published.",
          ].join("\n"),
          security: [{ adminKey: [] }],
          requestBody: json(createReviewSchema),
          responses: {
            "201": {
              description: "Created. The stay's rating is returned.",
              ...json(
                success(
                  z.object({
                    id: z.string(),
                    stayId: z.string(),
                    ratingAvg: z.number().nullable(),
                    reviewCount: z.number(),
                  }),
                ),
              ),
            },
            ...errors(400, 401, 422, 500),
          },
        },
      },
      "/experiences": {
        get: {
          tags: ["Experiences"],
          summary: "List published experiences",
          operationId: "listExperiences",
          responses: {
            "200": {
              description: "Experiences, alphabetical.",
              ...json(success(z.array(experienceCardSchema))),
            },
            ...errors(500),
          },
        },
      },
      "/experiences/{slug}": {
        get: {
          tags: ["Experiences"],
          summary: "An experience, with the stays that offer it",
          operationId: "getExperience",
          requestParams: { path: z.object({ slug: slugParam }) },
          responses: {
            "200": {
              description: "The experience.",
              ...json(success(experienceDetailSchema)),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/reviews/{id}": {
        patch: {
          tags: ["Stays"],
          summary: "Edit, publish or unpublish a review",
          operationId: "updateReview",
          description: [
            "Requires `x-admin-key`.",
            "",
            "Publishing and unpublishing are just `isPublished` changing. **All of these move the stay's denormalised rating**, and the service recomputes `ratingAvg` and `reviewCount` in the same transaction — which is why the response returns them.",
            "",
            "Only published reviews count towards the rating.",
          ].join("\n"),
          security: [{ adminKey: [] }],
          requestParams: { path: z.object({ id: z.string() }) },
          requestBody: json(updateReviewSchema),
          responses: {
            "200": {
              description: "Updated. The stay's new rating is returned.",
              ...json(success(ratingResultSchema)),
            },
            ...errors(400, 401, 404, 422, 500),
          },
        },
        delete: {
          tags: ["Stays"],
          summary: "Delete a review",
          operationId: "deleteReview",
          description:
            "Requires `x-admin-key`. Recomputes the stay's rating. The review's photo ROWS cascade; the storage OBJECTS do not — delete those via /media/review-image/{id} first, or they are orphaned.",
          security: [{ adminKey: [] }],
          requestParams: { path: z.object({ id: z.string() }) },
          responses: {
            "200": {
              description: "Deleted. The stay's new rating is returned.",
              ...json(success(ratingResultSchema)),
            },
            ...errors(400, 401, 404, 500),
          },
        },
      },
      "/site": {
        get: {
          tags: ["Site"],
          summary: "Settings, filter chips and amenities",
          operationId: "getSiteConfig",
          description:
            "Bundled into one call — three round trips for this would be silly, and all of it is small and changes rarely.",
          responses: {
            "200": {
              description: "Site configuration.",
              ...json(
                success(
                  z.object({
                    settings: siteSettingsSchema,
                    tags: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        slug: z.string(),
                        type: z.string(),
                      }),
                    ),
                    amenities: z.array(amenitySchema),
                  }),
                ),
              ),
            },
            ...errors(404, 500),
          },
        },
      },
      "/booking": {
        post: {
          tags: ["Booking"],
          summary: "Create a booking enquiry",
          operationId: "createBooking",
          description: [
            "No payment, no login. Stores what the guest typed, builds a prefilled WhatsApp message and returns a `wa.me` link for the client to open.",
            "",
            "**Show the guest their reference code.** It is the only way they get back to their trip timeline.",
            "",
            "Public and unauthenticated — it *is* the booking flow. Rate limited to 5 per IP per 10 minutes.",
          ].join("\n"),
          requestBody: json(createBookingSchema),
          responses: {
            "201": {
              description: "Enquiry created.",
              ...json(
                success(
                  z.object({
                    reference: z.string().meta({ example: "STZ-8F3K2" }),
                    whatsappUrl: z.string(),
                    estimatedTotal: z.number().meta({
                      description:
                        "Priced night by night, so weekend and festival overrides are included. An estimate — nothing is charged.",
                    }),
                    nights: z.number(),
                  }),
                ),
              ),
            },
            ...errors(400, 422, 429, 500),
          },
        },
      },
      "/booking/{reference}": {
        get: {
          tags: ["Booking"],
          summary: "Look up a booking by reference",
          operationId: "getBooking",
          description:
            "The trip timeline entry point. Case-insensitive — guests type it from a WhatsApp message.",
          requestParams: {
            path: z.object({
              reference: z.string().meta({ example: "STZ-8F3K2" }),
            }),
          },
          responses: {
            "200": {
              description: "The booking.",
              ...json(success(bookingSchema)),
            },
            ...errors(404, 422, 500),
          },
        },
      },
      "/upload": {
        post: {
          tags: ["Media"],
          summary: "Upload an image, and optionally attach it to a row",
          operationId: "uploadMedia",
          description: [
            "`multipart/form-data`. Requires `x-admin-key`.",
            "",
            "Pass `target` and `targetId` to attach in the same request. **If the attach fails, the object just uploaded is deleted again** — upload-then-attach as two calls is exactly what leaves orphaned files in the bucket.",
            "",
            "`targetId` is the row's id, except for `stay-image` and `guide-cover`, which take a **slug**.",
            "",
            `Max ${10} MB. JPEG, PNG, WebP or AVIF.`,
          ].join("\n"),
          security: [{ adminKey: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: z.object({
                  file: z.string().meta({ type: "string", format: "binary" }),
                  bucket: z.enum(BUCKETS),
                  path: z.string().meta({ example: "property-001/hero.jpg" }),
                  upsert: z.enum(["true", "false"]).optional(),
                  target: z.enum(attachTargets).optional(),
                  targetId: z.string().optional(),
                  altText: z.string().optional(),
                  caption: z.string().optional(),
                  isHero: z.enum(["true", "false"]).optional(),
                  sortOrder: z.coerce.number().optional(),
                }),
              },
            },
          },
          responses: {
            "201": {
              description: "Uploaded.",
              ...json(
                success(
                  z.object({
                    bucket: z.string(),
                    path: z.string(),
                    publicUrl: z.string(),
                    size: z.number(),
                    contentType: z.string(),
                    attached: z
                      .object({
                        target: z.string(),
                        id: z.string().optional(),
                        ok: z.boolean().optional(),
                      })
                      .optional(),
                  }),
                ),
              ),
            },
            ...errors(400, 401, 409, 413, 415, 422, 429, 502),
          },
        },
      },
      "/media/{type}/{id}": {
        delete: {
          tags: ["Media"],
          summary: "Remove media — the row AND the object",
          operationId: "deleteMedia",
          description: [
            "Requires `x-admin-key`.",
            "",
            "This endpoint exists because nothing else does both. Postgres cascades delete child *rows* and leaves the *files* in the bucket forever.",
            "",
            "For `stay-image` and `review-image` the row is deleted. For the single-reference kinds the row survives and its reference is cleared. Deleting a stay's hero promotes the next image, so a stay with images always has exactly one.",
          ].join("\n"),
          security: [{ adminKey: [] }],
          requestParams: {
            path: z.object({
              type: z.enum(attachTargets),
              id: z.string().meta({
                description: "Row id — or slug, for guide-cover.",
              }),
            }),
          },
          responses: {
            "200": {
              description: "Removed.",
              ...json(
                success(
                  z.object({
                    removed: z.literal(true),
                    type: z.string(),
                    id: z.string(),
                  }),
                ),
              ),
            },
            ...errors(400, 401, 404, 500),
          },
        },
      },
    },
  });
}
