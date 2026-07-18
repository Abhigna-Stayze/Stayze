import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getGuideDetail, getGuideExperiences } from "@/lib/guides";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getSiteData } from "@/lib/site";
import { GuideDetailHero } from "@/components/guide/GuideDetailHero";
import { GuideBody } from "@/components/guide/GuideBody";
import { GuideTips } from "@/components/guide/GuideTips";
import { GuideExperiences } from "@/components/guide/GuideExperiences";
import { GuideStays } from "@/components/guide/GuideStays";
import { GuideHelp } from "@/components/guide/GuideHelp";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideDetail(slug);
  if (!guide) return { title: "Guide not found" };

  // Some guide metaTitles bake in "— Stayze"; the layout title template also
  // appends "· Stayze". Strip a trailing brand token so exactly one is added,
  // whether or not the author included it.
  const base = (guide.metaTitle ?? guide.title).replace(
    /\s*[—–\-·|]\s*Stayze\s*$/i,
    "",
  );
  const brandedTitle = `${base} · Stayze`;
  const description =
    guide.metaDescription ??
    guide.excerpt ??
    `A Chikmagalur travel guide from Stayze — ${guide.title}.`;
  const url = `/travel-guide/${guide.slug}`;
  const images = guide.coverImageUrl
    ? [{ url: guide.coverImageUrl, alt: guide.title }]
    : undefined;

  return {
    title: base,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: brandedTitle,
      description,
      images,
      ...(guide.publishedAt
        ? { publishedTime: new Date(guide.publishedAt).toISOString() }
        : {}),
      ...(guide.author ? { authors: [guide.author] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: guide.coverImageUrl ? [guide.coverImageUrl] : undefined,
    },
  };
}

/**
 * Travel Guide detail — the article, and the section's main organic-search
 * surface.
 *
 * A Server Component. `getGuideDetail` (server-only helper → service, never a
 * self-fetch) returns the body, SEO metadata and featured stays in one read,
 * shared with `generateMetadata` via `cache()`. Nearby experiences are derived
 * from those stays. A missing or unpublished slug → `notFound()`.
 *
 * `Article` structured data (with the byline and publish date) is how the guide
 * competes for a search result — the whole point of the section.
 */
export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [guide, site] = await Promise.all([
    getGuideDetail(slug),
    getSiteData(),
  ]);
  if (!guide) notFound();

  const experiences = await getGuideExperiences(guide.stays.map((s) => s.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription ?? guide.excerpt ?? undefined,
    url: `https://stayze.in/travel-guide/${guide.slug}`,
    image: guide.coverImageUrl ?? undefined,
    articleSection: guide.category.name,
    ...(guide.author
      ? { author: { "@type": "Person", name: guide.author } }
      : {}),
    ...(guide.publishedAt
      ? { datePublished: new Date(guide.publishedAt).toISOString() }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Stayze",
      url: "https://stayze.in",
    },
    mainEntityOfPage: `https://stayze.in/travel-guide/${guide.slug}`,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Travel Guide", path: "/travel-guide" },
    { name: guide.title, path: `/travel-guide/${guide.slug}` },
  ]);

  return (
    <article className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="container-page pt-5">
        <Link
          href="/travel-guide"
          className="text-muted-ink hover:text-bark focus-visible:ring-ring inline-flex items-center gap-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden />
          All guides
        </Link>
      </div>

      <div className="container-page mt-4">
        <GuideDetailHero guide={guide} />
      </div>

      <div className="container-page">
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-12">
          <GuideBody body={guide.body} />
          <GuideTips />
        </div>
      </div>

      {experiences.length > 0 && (
        <div className="container-page section">
          <GuideExperiences experiences={experiences} />
        </div>
      )}

      {guide.stays.length > 0 && (
        <div className="container-page section">
          <GuideStays stays={guide.stays} />
        </div>
      )}

      <div className="container-page section">
        <div className="mx-auto max-w-2xl">
          <GuideHelp settings={site.settings} title={guide.title} />
        </div>
      </div>
    </article>
  );
}
