import Link from "next/link";
import { getHomeExperiences } from "@/lib/home";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Button } from "@/components/ui/button";

/**
 * Experience categories — what there is to do, not just where to sleep.
 *
 * Async Server Component reading through `getHomeExperiences` (service layer).
 * Experiences are content, not products: each card links to its own page to
 * pull a guest toward a stay. Renders up to four in a responsive grid using the
 * reused `ExperienceCard`; renders nothing at all when there are none, since an
 * empty experiences row adds no value on the Home page.
 */
export async function ExperienceCategories() {
  const experiences = (await getHomeExperiences()).slice(0, 4);
  if (experiences.length === 0) return null;

  return (
    <section
      className="bg-paper-2/60 border-border border-y"
      aria-labelledby="experiences-heading"
    >
      <div className="container-page section">
        <SectionHeading
          eyebrow="Things to do"
          id="experiences-heading"
          title="Experiences around your stay"
          subtitle="Coffee walks, waterfalls, slow mornings"
          action={
            <Button asChild variant="link">
              <Link href="/experiences">All experiences →</Link>
            </Button>
          }
        />

        <ul className="mt-8 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((experience) => (
            <li key={experience.id}>
              <ExperienceCard experience={experience} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
