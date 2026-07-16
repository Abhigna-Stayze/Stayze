import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getStayDetail } from "@/lib/stay";
import { getSiteData } from "@/lib/site";
import { StayGallery } from "@/components/stay/StayGallery";
import { StayHeader } from "@/components/stay/StayHeader";
import { StayStory } from "@/components/stay/StayStory";
import { QuickFacts } from "@/components/stay/QuickFacts";
import { StayAmenities } from "@/components/stay/StayAmenities";
import { StayRooms } from "@/components/stay/StayRooms";
import { StayExperiences } from "@/components/stay/StayExperiences";
import { NearbyPlaces } from "@/components/stay/NearbyPlaces";
import { StayReviews } from "@/components/stay/StayReviews";
import { RelatedStays } from "@/components/stay/RelatedStays";
import { BookingCard } from "@/components/stay/BookingCard";
import { MobileBookingBar } from "@/components/stay/MobileBookingBar";
import { HostCard } from "@/components/cards/HostCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { CardGridSkeleton } from "@/components/home/skeletons";

/** Next passes route params as a promise. */
type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const stay = await getStayDetail(slug);
  if (!stay) return { title: "Stay not found" };

  const title = stay.metaTitle ?? `${stay.name} — ${stay.type} in ${stay.area}`;
  const description =
    stay.metaDescription ??
    stay.storyExcerpt ??
    stay.tagline ??
    `A personally inspected plantation stay in ${stay.area}, Chikmagalur.`;
  const url = `/stays/${stay.slug}`;
  const images = stay.heroImageUrl
    ? [{ url: stay.heroImageUrl, alt: stay.heroImageAlt ?? stay.name }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: stay.heroImageUrl ? [stay.heroImageUrl] : undefined,
    },
  };
}

/**
 * Stay detail — the page everything upstream exists to deliver a guest to.
 *
 * A Server Component. `getStayDetail` (server-only helper → service layer,
 * never a self-fetch) returns the images, rooms, experiences, amenities,
 * nearby places, owner and published reviews in one query; related stays are a
 * second query and stream in their own Suspense boundary. `cache()` means this
 * page and `generateMetadata` share a single read.
 *
 * `LodgingBusiness` structured data is how a stay competes for a search result
 * against an OTA listing — it deliberately publishes the locality, never the
 * exact address, which is not shown before booking.
 */
export default async function StayPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [stay, site] = await Promise.all([getStayDetail(slug), getSiteData()]);
  if (!stay) notFound();

  const whatsappNumber = site.settings?.whatsappNumber ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: stay.name,
    description: stay.metaDescription ?? stay.storyExcerpt ?? undefined,
    url: `https://stayze.in/stays/${stay.slug}`,
    image: stay.images.slice(0, 5).map((image) => image.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: stay.area,
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    ...(stay.latitude !== null && stay.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: stay.latitude,
            longitude: stay.longitude,
          },
        }
      : {}),
    priceRange: `${stay.currency} ${stay.basePricePerNight}`,
    checkinTime: stay.checkInTime,
    checkoutTime: stay.checkOutTime,
    numberOfRooms: stay.bedrooms,
    amenityFeature: stay.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.name,
      value: true,
    })),
    // Only a real average is published — never a zero for an unreviewed stay.
    ...(stay.ratingAvg !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stay.ratingAvg,
            reviewCount: stay.reviewCount,
          },
        }
      : {}),
  };

  return (
    <article className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page pt-5">
        <StayGallery images={stay.images} />
      </div>

      <div className="container-page">
        <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:gap-14">
          {/* The story column. */}
          <div className="flex min-w-0 flex-col gap-12">
            <StayHeader stay={stay} />

            {/* On mobile the booking card sits inline — the sticky bar below is
                the shortcut, not the only way to choose dates. */}
            <div className="lg:hidden">
              <BookingCard stay={stay} whatsappNumber={whatsappNumber} />
            </div>

            <StayStory stay={stay} />
            <QuickFacts stay={stay} />
            <StayAmenities stay={stay} />
            <StayRooms stay={stay} />

            {stay.owner && (
              <section aria-labelledby="host-heading">
                <SectionHeading id="host-heading" title="Meet your host" />
                {/* No custom eyebrow: the owner's own `location` line already
                    says "Lives on the estate", and printing it twice reads as
                    a bug. */}
                <HostCard owner={stay.owner} className="mt-5" />
              </section>
            )}

            <StayExperiences stay={stay} />
            <NearbyPlaces stay={stay} />
            <StayReviews stay={stay} />
          </div>

          {/* The conversion column — pinned while the story scrolls. */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <BookingCard stay={stay} whatsappNumber={whatsappNumber} />
            </div>
          </aside>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="container-page section">
            <CardGridSkeleton count={3} />
          </div>
        }
      >
        <RelatedStays stayId={stay.id} />
      </Suspense>

      <MobileBookingBar stay={stay} />
    </article>
  );
}
