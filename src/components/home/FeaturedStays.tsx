import Link from "next/link";
import { Compass } from "lucide-react";
import { getHomeFeaturedStays } from "@/lib/home";
import { StayCard } from "@/components/cards/StayCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Featured stays — three hand-picked properties.
 *
 * An async Server Component: it reads through the `getHomeFeaturedStays` helper
 * (service layer, never a self-fetch) and renders the reused `StayCard`. Rating
 * nulls, the FitScore stamp, the "New stay" mark and the image fallback are all
 * the card's own concern. The first card is `priority` for LCP. Empty and
 * loading states are handled — the latter by the Suspense boundary in the page.
 */
export async function FeaturedStays() {
  const stays = await getHomeFeaturedStays();

  return (
    <section
      className="container-page section"
      aria-labelledby="featured-heading"
    >
      <SectionHeading
        eyebrow="Handpicked"
        id="featured-heading"
        title="Featured stays"
        subtitle="Every one visited, not just listed"
        action={
          <Button asChild variant="link">
            <Link href="/explore">View all stays →</Link>
          </Button>
        }
      />

      {stays.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={Compass}
          title="Fresh stays are on the way"
          description="We're inspecting new properties right now. Browse everything we have in the meantime."
          action={
            <Button asChild>
              <Link href="/explore">Explore all stays</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-8 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stays.map((stay, i) => (
            <li key={stay.id}>
              <StayCard stay={stay} priority={i === 0} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
