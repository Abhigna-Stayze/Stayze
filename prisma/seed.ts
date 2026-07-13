/**
 * Development seed for the Stayze customer portal.
 *
 * Run with:  npx prisma db seed
 *
 * Wipes every table and repopulates it, so it is safe to re-run. It is also
 * therefore DESTRUCTIVE — it must never be pointed at a database with real
 * bookings in it. There is currently no separate production database, so treat
 * that as a live constraint rather than a theoretical one.
 *
 * Media is uploaded to Supabase Storage first; Postgres only ever stores the
 * bucket + path reference. See ./seed/media.ts.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type {
  AvailabilityStatus,
  BookingStatus,
  PlaceCategory,
  ReviewSource,
  StepStatus,
  TagType,
  Tier,
  TripStep,
} from "../src/generated/prisma/enums";
import { uploadAll, type MediaMeta, type MediaRef } from "./seed/media";
import {
  AMENITIES,
  BOOKINGS,
  CONTACT_MESSAGES,
  GUIDE_CATEGORIES,
  GUIDES,
  OWNERS,
  SITE_SETTING,
  STAYS,
  TAGS,
  TIMELINE_STEPS,
} from "./seed/content";

// Seeding writes in bulk; go direct rather than through PgBouncer.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env["DIRECT_URL"] }),
});

// --- deterministic randomness ---------------------------------------------
// Availability needs to look arbitrary but reproduce identically on every run,
// so a seeded PRNG rather than Math.random().
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 24 * 60 * 60 * 1000;
/** Midnight UTC today — availability rows are @db.Date, so time must not drift. */
const TODAY = new Date(
  new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
);
const addDays = (base: Date, n: number) => new Date(base.getTime() + n * DAY);
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Dates that carry a festival premium, as MM-DD. */
const FESTIVAL_DAYS = new Set([
  "08-15",
  "10-20",
  "10-21",
  "11-01",
  "12-24",
  "12-25",
  "12-31",
  "01-01",
]);

async function wipe() {
  // Children first. Cascades would cover most of this, but being explicit means
  // the order is auditable and does not depend on referential-action config.
  await prisma.guideStay.deleteMany();
  await prisma.tripTimelineStep.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.stayAvailability.deleteMany();
  await prisma.stayTag.deleteMany();
  await prisma.stayAmenity.deleteMany();
  await prisma.nearbyPlace.deleteMany();
  await prisma.stayExperience.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.stayHighlight.deleteMany();
  await prisma.room.deleteMany();
  await prisma.stayImage.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.travelGuide.deleteMany();
  await prisma.guideCategory.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.siteSetting.deleteMany();
}

/** Every object the seed needs in Storage, with the bucket each one belongs in. */
function collectMedia(): MediaRef[] {
  const refs: MediaRef[] = [];

  for (const o of OWNERS) {
    refs.push({
      bucket: "owners",
      path: `${o.key}/profile.jpg`,
      source: o.photoSource,
    });
  }

  for (const s of STAYS) {
    s.images.forEach((img, i) => {
      const path = img.isHero
        ? `${s.folder}/hero.jpg`
        : `${s.folder}/gallery-${i}.jpg`;
      refs.push({ bucket: "stays", path, source: img.source });
    });
    for (const r of s.rooms) {
      refs.push({
        bucket: "stays",
        path: `${s.folder}/rooms/${r.slug}.jpg`,
        source: r.source,
      });
    }
    for (const p of s.nearby) {
      refs.push({
        bucket: "stays",
        path: `${s.folder}/nearby/${p.slug}.jpg`,
        source: p.source,
      });
    }
    for (const e of s.experiences) {
      refs.push({
        bucket: "experiences",
        path: `${s.folder}/${e.slug}.jpg`,
        source: e.source,
      });
    }
  }

  for (const g of GUIDES) {
    refs.push({
      bucket: "guides",
      path: `${g.slug}/cover.jpg`,
      source: g.coverSource,
    });
  }

  // Review photos: only the reviews that declare images get them.
  let reviewNo = 0;
  for (const s of STAYS) {
    for (const r of s.reviews) {
      reviewNo += 1;
      if (!("images" in r) || !r.images) continue;
      r.images.forEach((src, i) => {
        refs.push({
          bucket: "reviews",
          path: `review-${String(reviewNo).padStart(3, "0")}/img-${i + 1}.jpg`,
          source: src,
        });
      });
    }
  }

  return refs;
}

async function main() {
  console.log("Wiping existing rows…");
  await wipe();

  const refs = collectMedia();
  console.log(`Uploading ${refs.length} objects to Supabase Storage…`);
  const media: Map<string, MediaMeta> = await uploadAll(refs);
  const need = (bucket: string, path: string): MediaMeta => {
    const m = media.get(`${bucket}/${path}`);
    if (!m) throw new Error(`media missing for ${bucket}/${path}`);
    return m;
  };

  console.log("Inserting rows…");

  // --- site settings -------------------------------------------------------
  await prisma.siteSetting.create({ data: SITE_SETTING });

  // --- amenities, tags, guide categories -----------------------------------
  await prisma.amenity.createMany({ data: AMENITIES });
  await prisma.tag.createMany({
    data: TAGS.map((t) => ({ ...t, type: t.type as TagType })),
  });
  await prisma.guideCategory.createMany({ data: GUIDE_CATEGORIES });

  const amenityByName = new Map(
    (await prisma.amenity.findMany()).map((a) => [a.name, a.id] as const),
  );
  const tagBySlug = new Map(
    (await prisma.tag.findMany()).map((t) => [t.slug, t.id] as const),
  );
  const categoryBySlug = new Map(
    (await prisma.guideCategory.findMany()).map((c) => [c.slug, c.id] as const),
  );

  // --- owners --------------------------------------------------------------
  const ownerByKey = new Map<string, string>();
  for (const o of OWNERS) {
    const photo = need("owners", `${o.key}/profile.jpg`);
    const row = await prisma.owner.create({
      data: {
        name: o.name,
        photoBucket: photo.bucket,
        photoPath: photo.path,
        bio: o.bio,
        hostingSince: o.hostingSince,
        languages: o.languages,
        location: o.location,
        phone: o.phone,
        email: o.email,
        isPublicProfile: true,
      },
    });
    ownerByKey.set(o.key, row.id);
  }

  // --- stays and everything hanging off them -------------------------------
  const stayBySlug = new Map<string, string>();
  let reviewNo = 0;

  for (const s of STAYS) {
    const ownerId = ownerByKey.get(s.ownerKey);
    if (!ownerId) throw new Error(`no owner for ${s.slug}`);

    // ratingAvg / reviewCount are denormalised. The review service recomputes
    // them on every write; the seed inserts reviews in bulk, so it computes
    // them here and recalculateAllRatings() verifies the result at the end.
    const ratingAvg =
      s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length;

    const stay = await prisma.stay.create({
      data: {
        propertyCode: s.propertyCode,
        slug: s.slug,
        name: s.name,
        type: s.type,
        tagline: s.tagline,
        story: s.story,
        storyExcerpt: s.storyExcerpt,
        area: s.area,
        addressLine: s.addressLine,
        latitude: s.latitude,
        longitude: s.longitude,
        distanceFromTownKm: s.distanceFromTownKm,
        basePricePerNight: s.basePricePerNight,
        currency: "INR",
        maxGuests: s.maxGuests,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        acres: s.acres,
        checkInTime: s.checkInTime,
        checkOutTime: s.checkOutTime,
        fitScore: s.fitScore,
        tier: s.tier as Tier,
        inspectedOn: new Date(s.inspectedOn),
        inspectedBy: s.inspectedBy,
        verification: "VERIFIED",
        caretakerName: s.caretakerName,
        caretakerPhone: s.caretakerPhone,
        ratingAvg: Number(ratingAvg.toFixed(2)),
        reviewCount: s.reviews.length,
        isFeatured: s.isFeatured,
        featuredOrder: s.featuredOrder,
        cancellationPolicy: s.cancellationPolicy,
        status: "PUBLISHED",
        metaTitle: s.metaTitle,
        metaDescription: s.metaDescription,
        ownerId,
      },
    });
    stayBySlug.set(s.slug, stay.id);

    // images — 1 hero + 7 gallery
    await prisma.stayImage.createMany({
      data: s.images.map((img, i) => {
        const m = need(
          "stays",
          img.isHero ? `${s.folder}/hero.jpg` : `${s.folder}/gallery-${i}.jpg`,
        );
        return {
          stayId: stay.id,
          bucket: m.bucket,
          path: m.path,
          altText: img.alt,
          caption: img.caption,
          mediaType: "PHOTO" as const,
          isHero: img.isHero === true,
          sortOrder: i,
          width: m.width,
          height: m.height,
          fileSize: m.fileSize,
          mimeType: m.mimeType,
        };
      }),
    });

    await prisma.room.createMany({
      data: s.rooms.map((r, i) => {
        const m = need("stays", `${s.folder}/rooms/${r.slug}.jpg`);
        return {
          stayId: stay.id,
          name: r.name,
          description: r.description,
          bedType: r.bedType,
          maxGuests: r.maxGuests,
          imageBucket: m.bucket,
          imagePath: m.path,
          sortOrder: i,
        };
      }),
    });

    await prisma.stayHighlight.createMany({
      data: s.highlights.map((h, i) => ({
        stayId: stay.id,
        label: h.label,
        icon: h.icon,
        sortOrder: i,
      })),
    });

    // Experiences are standalone now. Create each one once, then LINK it to
    // the stay. The seed's experiences happen to be distinct per stay, but the
    // upsert means a shared one (a Coffee Estate Tour offered at two stays)
    // would produce one Experience and two links, which is the whole point.
    for (const [i, e] of s.experiences.entries()) {
      const m = need("experiences", `${s.folder}/${e.slug}.jpg`);

      const experience = await prisma.experience.upsert({
        where: { slug: e.slug },
        create: {
          slug: e.slug,
          title: e.title,
          story: e.description,
          excerpt: e.description,
          bucket: m.bucket,
          path: m.path,
          metaTitle: `${e.title} — Chikmagalur | Stayze`,
          metaDescription: e.description,
          isPublished: true,
        },
        update: {},
        select: { id: true },
      });

      await prisma.stayExperience.create({
        data: {
          stayId: stay.id,
          experienceId: experience.id,
          sortOrder: i,
        },
      });
    }

    await prisma.nearbyPlace.createMany({
      data: s.nearby.map((p, i) => {
        const m = need("stays", `${s.folder}/nearby/${p.slug}.jpg`);
        return {
          stayId: stay.id,
          name: p.name,
          description: p.description,
          category: p.category as PlaceCategory,
          distanceKm: p.distanceKm,
          driveTimeMinutes: p.driveTimeMinutes,
          imageBucket: m.bucket,
          imagePath: m.path,
          mapsUrl: p.mapsUrl,
          sortOrder: i,
        };
      }),
    });

    await prisma.stayAmenity.createMany({
      data: s.amenities.map((name) => {
        const amenityId = amenityByName.get(name);
        if (!amenityId)
          throw new Error(`unknown amenity "${name}" on ${s.slug}`);
        return { stayId: stay.id, amenityId };
      }),
    });

    await prisma.stayTag.createMany({
      data: s.tags.map((slug) => {
        const tagId = tagBySlug.get(slug);
        if (!tagId) throw new Error(`unknown tag "${slug}" on ${s.slug}`);
        return { stayId: stay.id, tagId };
      }),
    });

    // reviews (+ photos on the ones that declare them)
    for (const r of s.reviews) {
      reviewNo += 1;
      const review = await prisma.review.create({
        data: {
          stayId: stay.id,
          guestName: r.guestName,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          stayedOn: new Date(r.stayedOn),
          source: r.source as ReviewSource,
          isPublished: true,
        },
      });

      const imgs = "images" in r && r.images ? r.images : [];
      if (imgs.length > 0) {
        const folder = `review-${String(reviewNo).padStart(3, "0")}`;
        await prisma.reviewImage.createMany({
          data: imgs.map((_, i) => {
            const m = need("reviews", `${folder}/img-${i + 1}.jpg`);
            return {
              reviewId: review.id,
              bucket: m.bucket,
              path: m.path,
              width: m.width,
              height: m.height,
              fileSize: m.fileSize,
              mimeType: m.mimeType,
            };
          }),
        });
      }
    }
  }

  // --- travel guides -------------------------------------------------------
  for (const g of GUIDES) {
    const categoryId = categoryBySlug.get(g.categorySlug);
    if (!categoryId)
      throw new Error(`unknown guide category "${g.categorySlug}"`);
    const cover = need("guides", `${g.slug}/cover.jpg`);

    const guide = await prisma.travelGuide.create({
      data: {
        slug: g.slug,
        title: g.title,
        excerpt: g.excerpt,
        coverImageBucket: cover.bucket,
        coverImagePath: cover.path,
        body: g.body,
        categoryId,
        readTimeMinutes: g.readTimeMinutes,
        author: g.author,
        isPublished: true,
        publishedAt: addDays(TODAY, -30),
        metaTitle: g.metaTitle,
        metaDescription: g.metaDescription,
      },
    });

    await prisma.guideStay.createMany({
      data: g.stays.map((slug) => {
        const stayId = stayBySlug.get(slug);
        if (!stayId)
          throw new Error(`guide "${g.slug}" links unknown stay "${slug}"`);
        return { guideId: guide.id, stayId };
      }),
    });
  }

  // --- bookings + timeline -------------------------------------------------
  // Dates that a real booking occupies, so availability can mark them BOOKED.
  const bookedDates = new Map<string, Set<string>>();

  for (const b of BOOKINGS) {
    const stayId = stayBySlug.get(b.staySlug);
    const stay = STAYS.find((s) => s.slug === b.staySlug);
    if (!stayId || !stay)
      throw new Error(`booking ${b.reference} references unknown stay`);

    const checkIn = addDays(TODAY, b.checkInOffset);
    const checkOut = addDays(checkIn, b.nights);
    const estimatedTotal = stay.basePricePerNight * b.nights;

    const whatsappMessage =
      `Hi Stayze! I'd like to book ${stay.name} ` +
      `from ${iso(checkIn)} to ${iso(checkOut)} (${b.nights} nights) ` +
      `for ${b.adults} adults${b.children ? ` and ${b.children} children` : ""}. ` +
      `Name: ${b.guestName}. Ref: ${b.reference}.`;

    const handedOff = b.status !== "NEW";

    const booking = await prisma.bookingRequest.create({
      data: {
        reference: b.reference,
        stayId,
        guestName: b.guestName,
        guestPhone: b.guestPhone,
        guestEmail: b.guestEmail,
        checkIn,
        checkOut,
        nights: b.nights,
        adults: b.adults,
        children: b.children,
        note: b.note,
        estimatedTotal,
        whatsappMessage,
        whatsappSentAt: handedOff ? addDays(checkIn, -14) : null,
        status: b.status as BookingStatus,
        source: "WEBSITE",
      },
    });

    // Timeline exists for bookings that got past the WhatsApp conversation.
    if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
      const past = b.status === "COMPLETED";
      await prisma.tripTimelineStep.createMany({
        data: TIMELINE_STEPS.map((step, i) => ({
          bookingRequestId: booking.id,
          stepKey: step.stepKey as TripStep,
          title: step.title
            .replace("{{caretaker}}", stay.caretakerName)
            .replace("{{stay}}", stay.name),
          content: step.content
            .replace("{{nights}}", String(b.nights))
            .replace("{{stay}}", stay.name)
            .replace("{{reference}}", b.reference)
            .replace(/\{\{caretaker\}\}/g, stay.caretakerName)
            .replace("{{checkIn}}", stay.checkInTime)
            .replace("{{checkOut}}", stay.checkOutTime),
          // A completed trip has every step done. A confirmed, upcoming one has
          // only the steps that make sense before arrival.
          status: (past ? "DONE" : i < 3 ? "DONE" : "PENDING") as StepStatus,
          sortOrder: i,
          completedAt: past
            ? addDays(checkIn, i)
            : i < 3
              ? addDays(TODAY, -1)
              : null,
        })),
      });

      // Block out the nights this booking occupies.
      const set = bookedDates.get(b.staySlug) ?? new Set<string>();
      for (let n = 0; n < b.nights; n++) set.add(iso(addDays(checkIn, n)));
      bookedDates.set(b.staySlug, set);
    }
  }

  // --- availability: 180 days per stay -------------------------------------
  for (const [i, s] of STAYS.entries()) {
    const rand = mulberry32(1000 + i);
    const booked = bookedDates.get(s.slug) ?? new Set<string>();
    const rows: Array<{
      stayId: string;
      date: Date;
      status: AvailabilityStatus;
      priceOverride: number | null;
    }> = [];

    for (let d = 0; d < 180; d++) {
      const date = addDays(TODAY, d);
      const key = iso(date);
      const dow = date.getUTCDay(); // 0 Sun, 6 Sat
      const isWeekend = dow === 0 || dow === 6;
      const isFestival = FESTIVAL_DAYS.has(key.slice(5));

      let status: AvailabilityStatus = "AVAILABLE";
      if (booked.has(key)) {
        status = "BOOKED";
      } else if (rand() < 0.04) {
        // ~7 blocked days per stay: owner keeping the place for themselves.
        status = "BLOCKED";
      }

      let priceOverride: number | null = null;
      if (isFestival) {
        priceOverride = Math.round((s.basePricePerNight * 1.5) / 100) * 100;
      } else if (isWeekend) {
        priceOverride = Math.round((s.basePricePerNight * 1.25) / 100) * 100;
      }

      rows.push({
        stayId: stayBySlug.get(s.slug)!,
        date,
        status,
        priceOverride,
      });
    }

    await prisma.stayAvailability.createMany({ data: rows });
  }

  // --- contact messages ----------------------------------------------------
  await prisma.contactMessage.createMany({ data: CONTACT_MESSAGES });

  // --- summary -------------------------------------------------------------
  const counts = {
    SiteSetting: await prisma.siteSetting.count(),
    Owner: await prisma.owner.count(),
    Amenity: await prisma.amenity.count(),
    Tag: await prisma.tag.count(),
    GuideCategory: await prisma.guideCategory.count(),
    Stay: await prisma.stay.count(),
    StayImage: await prisma.stayImage.count(),
    Room: await prisma.room.count(),
    StayHighlight: await prisma.stayHighlight.count(),
    Experience: await prisma.experience.count(),
    StayExperience: await prisma.stayExperience.count(),
    NearbyPlace: await prisma.nearbyPlace.count(),
    StayAmenity: await prisma.stayAmenity.count(),
    StayTag: await prisma.stayTag.count(),
    StayAvailability: await prisma.stayAvailability.count(),
    TravelGuide: await prisma.travelGuide.count(),
    GuideStay: await prisma.guideStay.count(),
    Review: await prisma.review.count(),
    ReviewImage: await prisma.reviewImage.count(),
    BookingRequest: await prisma.bookingRequest.count(),
    TripTimelineStep: await prisma.tripTimelineStep.count(),
    ContactMessage: await prisma.contactMessage.count(),
  };

  console.log("\nSeeded:");
  for (const [table, n] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(18)} ${n}`);
  }
  console.log(`\n  Storage objects   ${media.size}`);
}

main()
  .catch((e) => {
    console.error("\nSeed failed:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
