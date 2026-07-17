import {
  Compass,
  Footprints,
  CloudRain,
  Clock,
  Droplets,
  Camera,
  Sun,
  Shirt,
} from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

/**
 * ExperienceGoodToKnow — "what to expect" and "what to bring".
 *
 * A deliberate, honest choice: the model records no per-experience packing list
 * or visitor notes, so rather than fabricate them, this is **general guidance
 * for a day out on the estate**, and it says so. The copy is the same for every
 * experience — closed shoes, a layer, water — because for a Chikmagalur hill
 * outing it genuinely is. Your host tunes the specifics on WhatsApp. If a
 * per-experience column is added later, this becomes data-driven with no layout
 * change.
 */
const EXPECT = [
  {
    icon: Compass,
    text: "Led by someone who lives here — an unhurried, local pace.",
  },
  {
    icon: Clock,
    text: "Timings are flexible; the estate keeps its own clock.",
  },
  {
    icon: CloudRain,
    text: "Weather-dependent — the hills can turn in an hour.",
  },
  {
    icon: Footprints,
    text: "Some walking on uneven ground; nothing strenuous.",
  },
];

const BRING = [
  { icon: Footprints, text: "Closed shoes you can walk in" },
  { icon: Shirt, text: "A light layer — mornings are cool" },
  { icon: CloudRain, text: "A rain jacket in monsoon (Jun–Sep)" },
  { icon: Droplets, text: "A water bottle" },
  { icon: Camera, text: "A camera" },
  { icon: Sun, text: "Sunscreen" },
];

export function ExperienceGoodToKnow() {
  return (
    <section aria-labelledby="good-to-know-heading">
      <SectionHeading
        id="good-to-know-heading"
        eyebrow="Before you go"
        title="Good to know"
      />
      <p className="text-muted-ink mt-2 text-sm">
        General guidance for a day out on the estate — your host will fine-tune
        the details for this experience.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="text-bark font-serif text-base">What to expect</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {EXPECT.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="bg-paper-2 text-mist mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-bark/90 text-sm leading-relaxed">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-bark font-serif text-base">What to bring</h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BRING.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="bg-paper-2 text-clay inline-flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="text-bark/90 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
