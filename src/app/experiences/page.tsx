import type { Metadata } from "next";
import { getExperiences } from "@/lib/experiences";
import { ExperiencesHero } from "@/components/experiences/ExperiencesHero";
import { ExperiencesExplorer } from "@/components/experiences/ExperiencesExplorer";

const DESCRIPTION =
  "Coffee picked at first light, a walk up the ridge, dinner with your host — the experiences worth planning a Chikmagalur trip around, each a short step from a Stayze stay.";

export const metadata: Metadata = {
  title: "Experiences in Chikmagalur",
  description: DESCRIPTION,
  alternates: { canonical: "/experiences" },
  openGraph: {
    type: "website",
    url: "/experiences",
    title: "Experiences in Chikmagalur · Stayze",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Experiences in Chikmagalur · Stayze",
    description: DESCRIPTION,
  },
};

/** Slugs we'd rather lead the hero with, most-evocative first. */
const FEATURE_PREFERENCE = [
  "morning-coffee-walk",
  "sunrise-yoga",
  "aldur-ridge-walk",
  "estate-and-pepper-walk",
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Experiences — the listing page.
 *
 * A Server Component. It reads the published experiences through the server-only
 * helper (never a self-fetch), picks one to feature, and hands the full set to
 * the client explorer, which owns search and theme filtering. The initial
 * query/theme state is parsed from the URL here so a shared link renders the
 * right view on first paint before the island hydrates.
 */
export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const experiences = await getExperiences();
  const raw = await searchParams;

  const initialQuery = typeof raw.q === "string" ? raw.q : "";
  const initialThemes = Array.isArray(raw.theme)
    ? raw.theme
    : raw.theme
      ? [raw.theme]
      : [];

  const featured =
    FEATURE_PREFERENCE.map((slug) =>
      experiences.find((e) => e.slug === slug),
    ).find(Boolean) ??
    experiences[0] ??
    null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Experiences in Chikmagalur",
    itemListElement: experiences.map((exp, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://stayze.in/experiences/${exp.slug}`,
      name: exp.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ExperiencesHero count={experiences.length} featured={featured} />

      <div className="container-page section">
        <ExperiencesExplorer
          experiences={experiences}
          initialQuery={initialQuery}
          initialThemes={initialThemes}
        />
      </div>
    </>
  );
}
