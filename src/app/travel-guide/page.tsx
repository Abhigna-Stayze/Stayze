import type { Metadata } from "next";
import { getGuides } from "@/lib/guides";
import { GuideListHero } from "@/components/guide/GuideListHero";
import { GuideExplorer } from "@/components/guide/GuideExplorer";

const DESCRIPTION =
  "Chikmagalur from someone who lives here — waterfalls worth the jeep, the cafés that get it right, weekend itineraries and monsoon advice. Honest local travel guides from Stayze.";

export const metadata: Metadata = {
  title: "Chikmagalur Travel Guide",
  description: DESCRIPTION,
  alternates: { canonical: "/travel-guide" },
  openGraph: {
    type: "website",
    url: "/travel-guide",
    title: "Chikmagalur Travel Guide · Stayze",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Chikmagalur Travel Guide · Stayze",
    description: DESCRIPTION,
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Travel Guide — the listing page and the section's SEO engine.
 *
 * A Server Component. It reads the published guides through the server-only
 * helper (never a self-fetch), features the most recent, and hands the full set
 * to the client explorer, which owns search and category filtering. Initial
 * query/category state is parsed from the URL here so a shared link renders the
 * right, crawlable view on first paint.
 */
export default async function TravelGuidePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const guides = await getGuides();
  const raw = await searchParams;

  const initialQuery = typeof raw.q === "string" ? raw.q : "";
  const initialCategories = Array.isArray(raw.category)
    ? raw.category
    : raw.category
      ? [raw.category]
      : [];

  // Newest first from the service, so [0] is the lead story.
  const featured = guides[0] ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Chikmagalur Travel Guide",
    url: "https://stayze.in/travel-guide",
    description: DESCRIPTION,
    blogPost: guides.map((guide) => ({
      "@type": "BlogPosting",
      headline: guide.title,
      url: `https://stayze.in/travel-guide/${guide.slug}`,
      ...(guide.author
        ? { author: { "@type": "Person", name: guide.author } }
        : {}),
      ...(guide.publishedAt
        ? { datePublished: new Date(guide.publishedAt).toISOString() }
        : {}),
      ...(guide.coverImageUrl ? { image: guide.coverImageUrl } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GuideListHero count={guides.length} featured={featured} />

      <div className="container-page section">
        <GuideExplorer
          guides={guides}
          initialQuery={initialQuery}
          initialCategories={initialCategories}
        />
      </div>
    </>
  );
}
