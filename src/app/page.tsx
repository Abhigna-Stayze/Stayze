import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedStays } from "@/components/home/FeaturedStays";
import { ExperienceCategories } from "@/components/home/ExperienceCategories";
import { TravelInspiration } from "@/components/home/TravelInspiration";
import { VerificationChecklist } from "@/components/home/VerificationChecklist";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Reveal } from "@/components/home/Reveal";
import { CardGridSkeleton } from "@/components/home/skeletons";

const DESCRIPTION =
  "Handpicked, personally inspected plantation stays in Chikmagalur — coffee estates, heritage bungalows and riverside cottages. Every stay is visited before it's listed.";

export const metadata: Metadata = {
  // `absolute` so the Home title isn't suffixed with the layout's "· Stayze".
  title: {
    absolute: "Stayze — Plantation stays in Chikmagalur & the Western Ghats",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Stayze",
    title: "Stayze — Plantation stays in Chikmagalur",
    description: DESCRIPTION,
    images: [
      {
        url: "/hero/hero-poster.jpg",
        width: 1600,
        height: 900,
        alt: "A coffee plantation in the Western Ghats at Chikmagalur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stayze — Plantation stays in Chikmagalur",
    description: DESCRIPTION,
    images: ["/hero/hero-poster.jpg"],
  },
};

// Organization + WebSite structured data, published together via @graph. The
// OG image is a plantation photograph, never the logo, per the brand.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://stayze.in/#organization",
      name: "Stayze",
      description: DESCRIPTION,
      url: "https://stayze.in",
      areaServed: "Chikmagalur, Karnataka, India",
    },
    {
      "@type": "WebSite",
      "@id": "https://stayze.in/#website",
      name: "Stayze",
      description: DESCRIPTION,
      url: "https://stayze.in",
      publisher: { "@id": "https://stayze.in/#organization" },
      inLanguage: "en-IN",
    },
  ],
};

/**
 * The Home page — the first complete page in the app.
 *
 * A Server Component. It reads no data itself; each data section is an async
 * Server Component that reads through a `src/lib/home` helper → service layer
 * (never a self-fetch of the REST API). Those sections stream inside Suspense
 * boundaries, so the hero paints immediately while the stays, experiences and
 * guides fill in with skeleton placeholders. The header, footer and floating
 * help come from the application shell in `layout.tsx`.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <Hero />
      <TrustBar />

      <Reveal>
        <Suspense
          fallback={
            <div className="container-page section">
              <CardGridSkeleton count={3} />
            </div>
          }
        >
          <FeaturedStays />
        </Suspense>
      </Reveal>

      <Reveal>
        <Suspense
          fallback={
            <div className="bg-paper-2/60 border-border border-y">
              <div className="container-page section">
                <CardGridSkeleton
                  count={4}
                  columns="sm:grid-cols-2 lg:grid-cols-4"
                  media="aspect-[4/3]"
                />
              </div>
            </div>
          }
        >
          <ExperienceCategories />
        </Suspense>
      </Reveal>

      <Reveal>
        <Suspense
          fallback={
            <div className="container-page section">
              <CardGridSkeleton count={3} />
            </div>
          }
        >
          <TravelInspiration />
        </Suspense>
      </Reveal>

      <Reveal>
        <FinalCTA />
      </Reveal>

      <Reveal>
        <VerificationChecklist />
      </Reveal>
    </>
  );
}
