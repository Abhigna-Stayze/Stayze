import "server-only";
import { prisma } from "@/lib/prisma";
import { getPublicUrlOrNull } from "@/lib/storage";
import { toStayCard } from "@/services/mappers";
import type { ExperienceCard, ExperienceDetail } from "@/services/types";

/**
 * Experiences — destination content with its own pages and its own SEO.
 *
 * The distinction that matters: an Experience is a THING YOU CAN DO in
 * Chikmagalur (a coffee estate tour, a sunrise trek). `StayExperience` is now
 * just the junction saying which stays offer it. The same experience can be
 * offered at several stays, which is precisely why it earns a URL.
 *
 * Only published experiences are ever returned. Drafts are for the admin
 * surface, which does not exist yet.
 */

const PUBLISHED = { isPublished: true } as const;

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  bucket: true,
  path: true,
} as const;

type ExperienceCardRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  bucket: string | null;
  path: string | null;
};

function toExperienceCard(exp: ExperienceCardRow): ExperienceCard {
  return {
    id: exp.id,
    slug: exp.slug,
    title: exp.title,
    excerpt: exp.excerpt,
    imageUrl: getPublicUrlOrNull({ bucket: exp.bucket, path: exp.path }),
  };
}

/** The /experiences index. */
export async function getAllExperiences(): Promise<ExperienceCard[]> {
  const experiences = await prisma.experience.findMany({
    where: PUBLISHED,
    select: cardSelect,
    orderBy: { title: "asc" },
  });

  return experiences.map(toExperienceCard);
}

/**
 * One experience, with the stays that offer it.
 *
 * Returns null for an unknown slug or an unpublished draft — render a 404.
 */
export async function getExperienceBySlug(
  slug: string,
): Promise<ExperienceDetail | null> {
  const experience = await prisma.experience.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      stays: {
        include: {
          stay: {
            include: {
              images: { where: { isHero: true }, take: 1 },
              highlights: { orderBy: { sortOrder: "asc" }, take: 3 },
              tags: { include: { tag: true } },
            },
          },
        },
      },
    },
  });

  if (!experience) return null;

  return {
    ...toExperienceCard(experience),
    story: experience.story,
    metaTitle: experience.metaTitle,
    metaDescription: experience.metaDescription,
    // An experience may be linked to an unpublished stay. Do not surface it.
    stays: experience.stays
      .filter((link) => link.stay.status === "PUBLISHED")
      .map((link) => toStayCard(link.stay)),
  };
}

/** The experiences a given stay offers, in the stay's own order. */
export async function getExperiencesForStay(
  stayId: string,
): Promise<ExperienceCard[]> {
  const links = await prisma.stayExperience.findMany({
    where: { stayId, experience: PUBLISHED },
    orderBy: { sortOrder: "asc" },
    include: { experience: { select: cardSelect } },
  });

  return links.map((link) => toExperienceCard(link.experience));
}

// ---------------------------------------------------------------------------
// Linking — an experience is offered at a stay, or it is not
// ---------------------------------------------------------------------------

/**
 * Offer an experience at a stay. Idempotent: linking twice is not an error,
 * it just updates the ordering.
 */
export async function linkExperienceToStay(
  staySlug: string,
  experienceSlug: string,
  sortOrder = 0,
): Promise<void> {
  const [stay, experience] = await Promise.all([
    prisma.stay.findUnique({ where: { slug: staySlug }, select: { id: true } }),
    prisma.experience.findUnique({
      where: { slug: experienceSlug },
      select: { id: true },
    }),
  ]);

  if (!stay) throw new ExperienceError(`No stay with slug "${staySlug}".`);
  if (!experience) {
    throw new ExperienceError(`No experience with slug "${experienceSlug}".`);
  }

  await prisma.stayExperience.upsert({
    where: {
      stayId_experienceId: { stayId: stay.id, experienceId: experience.id },
    },
    create: { stayId: stay.id, experienceId: experience.id, sortOrder },
    update: { sortOrder },
  });
}

/** Stop offering it. Removes the link, never the Experience itself. */
export async function unlinkExperienceFromStay(
  staySlug: string,
  experienceSlug: string,
): Promise<boolean> {
  const [stay, experience] = await Promise.all([
    prisma.stay.findUnique({ where: { slug: staySlug }, select: { id: true } }),
    prisma.experience.findUnique({
      where: { slug: experienceSlug },
      select: { id: true },
    }),
  ]);
  if (!stay || !experience) return false;

  const deleted = await prisma.stayExperience.deleteMany({
    where: { stayId: stay.id, experienceId: experience.id },
  });

  return deleted.count > 0;
}

export class ExperienceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExperienceError";
  }
}
