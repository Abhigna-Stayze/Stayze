import type { ExperienceCard as ExperienceCardData } from "@/services/types";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { SectionHeading } from "@/components/sections/SectionHeading";

/**
 * GuideExperiences — things to do near the stays this guide recommends.
 *
 * There is no guide→experience link in the schema, so these are derived (in the
 * page's server-only helper) from the experiences offered at the guide's
 * featured stays — genuinely relevant, not a generic list. Reuses
 * `ExperienceCard` unchanged. The page omits the section entirely when the set
 * is empty, so this always has something to show.
 */
export function GuideExperiences({
  experiences,
}: {
  experiences: ExperienceCardData[];
}) {
  return (
    <section aria-labelledby="guide-experiences-heading">
      <SectionHeading
        id="guide-experiences-heading"
        eyebrow="While you’re here"
        title="Experiences nearby"
      />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {experiences.map((experience, i) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            priority={i < 2}
          />
        ))}
      </div>
    </section>
  );
}
