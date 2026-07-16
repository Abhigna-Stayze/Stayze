import { getRelated } from "@/lib/stay";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { StayCard } from "@/components/cards/StayCard";

/**
 * "You might also love" — stays sharing a tag or an area with this one.
 *
 * An async Server Component with its own helper, so it streams inside its own
 * Suspense boundary: the page's body never waits on a second query. Reuses
 * `StayCard`, and renders nothing rather than an empty shell.
 */
export async function RelatedStays({ stayId }: { stayId: string }) {
  const stays = await getRelated(stayId);
  if (stays.length === 0) return null;

  return (
    <section
      className="bg-paper-2/60 border-border border-y"
      aria-labelledby="related-heading"
    >
      <div className="container-page section">
        <SectionHeading
          id="related-heading"
          eyebrow="Keep looking"
          title="You might also love"
          subtitle="Verified the same way, chosen the same way"
        />
        <ul className="mt-8 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stays.map((stay) => (
            <li key={stay.id}>
              <StayCard stay={stay} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
