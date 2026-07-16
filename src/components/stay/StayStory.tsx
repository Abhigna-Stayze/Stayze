import type { StayDetail } from "@/services/types";

/**
 * The signature story block — the page's soul, and the thing no OTA has.
 *
 * The brand's dark panel: bark ground, gold eyebrow, paper text, the narrative
 * set in italic Fraunces-adjacent measure. Long copy is given a comfortable
 * line length and `whitespace-pre-line` so the writer's paragraph breaks
 * survive the database round-trip.
 *
 * Static and presentational — it renders the `story` it is handed.
 */
export function StayStory({ stay }: { stay: StayDetail }) {
  if (!stay.story) return null;

  return (
    <section
      className="bg-bark rounded-lg p-6 sm:p-8"
      aria-labelledby="story-heading"
    >
      <p className="eyebrow text-gold">The story</p>
      <h2 id="story-heading" className="heading-2 text-paper mt-2">
        {stay.tagline ?? stay.name}
      </h2>
      <p className="text-paper/85 mt-5 max-w-2xl text-[15px] leading-[1.8] whitespace-pre-line italic">
        {stay.story}
      </p>
    </section>
  );
}
