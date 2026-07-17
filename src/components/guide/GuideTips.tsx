import { Sun, Car, Backpack, SignalHigh } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

/**
 * GuideTips — planning notes for visiting Chikmagalur.
 *
 * An honest choice, like the experience page's "good to know": guides carry no
 * structured per-article tip fields (entry fees, opening hours), so rather than
 * fabricate them this is **general regional planning advice** — the season, how
 * to get around, what to pack, connectivity — true for any Chikmagalur trip,
 * and framed as exactly that. If per-guide tips are modelled later, this
 * becomes data-driven with no layout change.
 */
type Tip = { icon: LucideIcon; title: string; text: string };

const TIPS: Tip[] = [
  {
    icon: Sun,
    title: "Best time to visit",
    text: "October to March is dry, cool and clear. June to September is deep-green monsoon — beautiful, wet, and leech season on the trails.",
  },
  {
    icon: Car,
    title: "Getting around",
    text: "Your own vehicle or a hired car is easiest; the estate roads wind and buses are sparse. Fuel up in town before heading into the hills.",
  },
  {
    icon: Backpack,
    title: "What to pack",
    text: "Layers for cool mornings, closed shoes you can walk in, and a rain jacket in monsoon. Sunscreen and a water bottle for the viewpoints.",
  },
  {
    icon: SignalHigh,
    title: "Connectivity",
    text: "Mobile signal is patchy on the estates and drops on the ghat roads. Download your maps offline before you set out.",
  },
];

export function GuideTips() {
  return (
    <section aria-labelledby="tips-heading">
      <SectionHeading
        id="tips-heading"
        eyebrow="Good to know"
        title="Planning notes"
      />
      <p className="text-muted-ink mt-2 text-sm">
        General advice for a Chikmagalur trip — your host will fill in the local
        specifics.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {TIPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-surface flex gap-4 p-5">
            <span className="bg-paper-2 text-mist inline-flex size-9 shrink-0 items-center justify-center rounded-full">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-bark font-serif text-base">{title}</h3>
              <p className="text-muted-ink mt-1 text-sm leading-relaxed">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
