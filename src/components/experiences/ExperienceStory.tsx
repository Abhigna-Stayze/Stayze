import type { ExperienceDetail } from "@/services/types";

/**
 * ExperienceStory — the narrative, given room to breathe.
 *
 * The experience's `story` is the one long-form field the model carries, so it
 * is the heart of the page. Rendered in comfortable serif with `pre-line` so
 * the writer's paragraph breaks survive, on a warm paper panel with a gold
 * eyebrow — the brand's editorial voice, the same one the stay story uses.
 */
export function ExperienceStory({
  experience,
}: {
  experience: ExperienceDetail;
}) {
  return (
    <section
      aria-labelledby="about-heading"
      className="bg-paper-2/50 border-border rounded-lg border p-6 sm:p-8"
    >
      <p className="eyebrow text-clay">The experience</p>
      <h2 id="about-heading" className="heading-2 text-bark mt-2">
        What it’s like
      </h2>
      <p className="text-bark/90 mt-4 max-w-2xl text-lg leading-relaxed whitespace-pre-line">
        {experience.story}
      </p>
    </section>
  );
}
