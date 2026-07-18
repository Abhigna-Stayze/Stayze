import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getExperienceDetail } from "@/lib/experiences";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getSiteData } from "@/lib/site";
import { themesFor } from "@/lib/experience-themes";
import { ExperienceHero } from "@/components/experiences/ExperienceHero";
import { ExperienceOverview } from "@/components/experiences/ExperienceOverview";
import { ExperienceStory } from "@/components/experiences/ExperienceStory";
import { ExperienceGoodToKnow } from "@/components/experiences/ExperienceGoodToKnow";
import { ExperienceStays } from "@/components/experiences/ExperienceStays";
import { ExperienceHelp } from "@/components/experiences/ExperienceHelp";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperienceDetail(slug);
  if (!experience) return { title: "Experience not found" };

  const title = experience.metaTitle ?? `${experience.title} — Chikmagalur`;
  const description =
    experience.metaDescription ??
    experience.excerpt ??
    `${experience.title}, a Stayze experience in Chikmagalur.`;
  const url = `/experiences/${experience.slug}`;
  const images = experience.imageUrl
    ? [{ url: experience.imageUrl, alt: experience.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description, images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: experience.imageUrl ? [experience.imageUrl] : undefined,
    },
  };
}

/**
 * Experience detail — an immersive page for one thing you can do in
 * Chikmagalur, and the doorway to booking a stay near it.
 *
 * A Server Component. `getExperienceDetail` (server-only helper → service,
 * never a self-fetch) returns the story, SEO metadata and the published stays
 * that offer it in one read; `cache()` shares that read with `generateMetadata`.
 * A missing or unpublished slug → `notFound()`.
 *
 * `TouristAttraction` structured data helps the page compete in search for the
 * activity itself, alongside the stays it feeds.
 */
export default async function ExperiencePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [experience, site] = await Promise.all([
    getExperienceDetail(slug),
    getSiteData(),
  ]);
  if (!experience) notFound();

  const themes = themesFor(experience);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: experience.title,
    description: experience.metaDescription ?? experience.excerpt ?? undefined,
    url: `https://stayze.in/experiences/${experience.slug}`,
    image: experience.imageUrl ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chikmagalur",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    isAccessibleForFree: true,
    touristType: "Nature and plantation travellers",
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Experiences", path: "/experiences" },
    { name: experience.title, path: `/experiences/${experience.slug}` },
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
          href="/experiences"
          className="text-muted-ink hover:text-bark focus-visible:ring-ring inline-flex items-center gap-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden />
          All experiences
        </Link>
      </div>

      <div className="container-page mt-4">
        <ExperienceHero experience={experience} themes={themes} />
      </div>

      <div className="container-page">
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-12">
          <ExperienceOverview experience={experience} themes={themes} />
          <ExperienceStory experience={experience} />
          <ExperienceGoodToKnow />
        </div>
      </div>

      <div className="container-page section">
        <ExperienceStays stays={experience.stays} title={experience.title} />
      </div>

      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <ExperienceHelp settings={site.settings} title={experience.title} />
        </div>
      </div>
    </article>
  );
}
