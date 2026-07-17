import type { ExperienceDetail } from "@/services/types";
import { StatItem } from "@/components/shared/StatItem";

/** A human "best time" derived from the themes we could read off the content. */
function bestTime(themes: string[]): string | null {
  if (themes.includes("mornings")) return "Early morning";
  if (themes.includes("evenings")) return "Evening";
  return null;
}

/**
 * ExperienceOverview — the at-a-glance strip.
 *
 * Deliberately shows only what is real. The `Experience` model has no duration,
 * difficulty or season column, so this does not invent them — it prints the
 * facts we do hold (region, where you can do it, how many stays offer it) and
 * one honestly-derived hint ("best time", read off the theme). Each is a
 * `StatItem` ledger line, figures in mono.
 */
export function ExperienceOverview({
  experience,
  themes,
}: {
  experience: ExperienceDetail;
  themes: string[];
}) {
  // Distinct areas of the stays that offer this, in first-seen order.
  const areas = Array.from(new Set(experience.stays.map((s) => s.area)));
  const when = bestTime(themes);

  return (
    <div className="card-surface grid gap-x-10 gap-y-3 p-5 sm:grid-cols-2">
      <StatItem label="Region" value="Chikmagalur, Karnataka" mono={false} />
      <StatItem
        label="Offered at"
        value={
          <>
            <span className="num">{experience.stays.length}</span>{" "}
            {experience.stays.length === 1 ? "stay" : "stays"}
          </>
        }
        mono={false}
      />
      {areas.length > 0 && (
        <StatItem label="Where" value={areas.join(" · ")} mono={false} />
      )}
      {when && <StatItem label="Best time" value={when} mono={false} />}
    </div>
  );
}
