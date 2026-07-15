import Link from "next/link";
import { getHomeGuides } from "@/lib/home";
import { GuideCard } from "@/components/cards/GuideCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Button } from "@/components/ui/button";

/**
 * Travel inspiration — the latest guides.
 *
 * Async Server Component reading through `getHomeGuides` (service layer). The
 * travel guide is the SEO engine; surfacing three on the Home page is a link
 * into it. Reuses `GuideCard`; renders nothing when there are no guides rather
 * than an empty shell.
 */
export async function TravelInspiration() {
  const guides = await getHomeGuides();
  if (guides.length === 0) return null;

  return (
    <section
      className="container-page section"
      aria-labelledby="guides-heading"
    >
      <SectionHeading
        eyebrow="Travel inspiration"
        id="guides-heading"
        title="Read before you roam"
        subtitle="Itineraries, seasons and estate stories"
        action={
          <Button asChild variant="link">
            <Link href="/travel-guide">All guides →</Link>
          </Button>
        }
      />

      <ul className="mt-8 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide, i) => (
          <li key={guide.id}>
            <GuideCard guide={guide} priority={i === 0} />
          </li>
        ))}
      </ul>
    </section>
  );
}
