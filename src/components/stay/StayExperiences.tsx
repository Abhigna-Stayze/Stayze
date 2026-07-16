import type { StayDetail } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ExperienceCard } from "@/components/cards/ExperienceCard";

/**
 * What you'll experience here.
 *
 * Reuses `ExperienceCard`, so each links to the experience's own page —
 * experiences are content, not products, and the same one is offered at several
 * stays. The on-stay DTO (`ExperienceView`) carries `description` where the
 * card wants `excerpt`; that one-line shim lives here rather than forking the
 * card.
 */
export function StayExperiences({ stay }: { stay: StayDetail }) {
  if (stay.experiences.length === 0) return null;

  return (
    <section aria-labelledby="experiences-heading">
      <SectionHeading
        id="experiences-heading"
        title="What you'll experience"
        subtitle="The estate, not just the room"
      />
      <ul className="mt-5 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stay.experiences.map((experience) => (
          <li key={experience.id}>
            <ExperienceCard
              experience={{
                id: experience.id,
                slug: experience.slug,
                title: experience.title,
                excerpt: experience.description,
                imageUrl: experience.imageUrl,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
