import "server-only";
import { prisma } from "@/lib/prisma";
import { getPublicUrlOrNull } from "@/lib/storage";
import { toStayCard } from "@/services/mappers";
import type { GuideCard, GuideDetail } from "@/services/types";

/**
 * Travel guides — the SEO surface. Itineraries, waterfalls, coffee trails.
 *
 * Only published guides are ever returned. Drafts exist for the admin surface.
 */

const PUBLISHED = { isPublished: true } as const;

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageBucket: true,
  coverImagePath: true,
  readTimeMinutes: true,
  author: true,
  publishedAt: true,
  category: { select: { name: true, slug: true } },
} as const;

type GuideCardRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageBucket: string | null;
  coverImagePath: string | null;
  readTimeMinutes: number | null;
  author: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string };
};

function toGuideCard(guide: GuideCardRow): GuideCard {
  return {
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    excerpt: guide.excerpt,
    coverImageUrl: getPublicUrlOrNull({
      bucket: guide.coverImageBucket,
      path: guide.coverImagePath,
    }),
    category: guide.category,
    readTimeMinutes: guide.readTimeMinutes,
    author: guide.author,
    publishedAt: guide.publishedAt,
  };
}

/**
 * The Travel Guide index. Newest first.
 *
 * `categorySlug` narrows to a single category, for /travel-guide?category=…
 */
export async function getAllGuides(
  categorySlug?: string,
): Promise<GuideCard[]> {
  const guides = await prisma.travelGuide.findMany({
    where: {
      ...PUBLISHED,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
  });

  return guides.map(toGuideCard);
}

/**
 * The latest guides — the "Travel Inspiration" row on Home.
 *
 * There is no `isFeatured` flag on TravelGuide, so "featured" means "most
 * recently published". If editorial control is wanted later, that is a schema
 * change, not a change here.
 */
export async function getFeaturedGuides(limit = 3): Promise<GuideCard[]> {
  const guides = await prisma.travelGuide.findMany({
    where: PUBLISHED,
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return guides.map(toGuideCard);
}

/**
 * A single guide, with the stays it features.
 *
 * Returns null when the slug does not resolve or the guide is unpublished —
 * render a 404.
 */
export async function getGuideBySlug(
  slug: string,
): Promise<GuideDetail | null> {
  const guide = await prisma.travelGuide.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      category: { select: { name: true, slug: true } },
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

  if (!guide) return null;

  return {
    ...toGuideCard(guide),
    body: guide.body,
    metaTitle: guide.metaTitle,
    metaDescription: guide.metaDescription,
    // A guide may link an unpublished stay; do not surface it.
    stays: guide.stays
      .filter((link) => link.stay.status === "PUBLISHED")
      .map((link) => toStayCard(link.stay)),
  };
}

/** The category list, for the index filter. */
export async function getGuideCategories(): Promise<
  Array<{ id: string; name: string; slug: string }>
> {
  return prisma.guideCategory.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
