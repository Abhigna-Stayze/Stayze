import {
  BadgeCheck,
  Clock,
  CloudRain,
  Coffee,
  Luggage,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

type ChecklistItem = { icon: LucideIcon; title: string; detail: string };

/**
 * Trip checklist — how to arrive ready.
 *
 * A short, reusable list of what to bring and know. Most items are evergreen;
 * the check-in time is the one real datum, threaded through from the stay so it
 * is never a guessed "2 PM". The monsoon note is deliberately general — real,
 * date-aware weather arrives in the section below once that integration lands.
 */
export function TripChecklist({
  checkInTime,
  checkOutTime,
}: {
  checkInTime: string;
  checkOutTime: string;
}) {
  const items: ChecklistItem[] = [
    {
      icon: BadgeCheck,
      title: "Carry a photo ID",
      detail:
        "One government ID per adult — Aadhaar, passport or driving licence. Your host may note it down.",
    },
    {
      icon: Clock,
      title: "Check-in & check-out",
      detail: `Arrive from ${checkInTime}. Check-out is by ${checkOutTime}. Coming in late? Tell your caretaker so someone's up.`,
    },
    {
      icon: Luggage,
      title: "Pack for the hills",
      detail:
        "Layers for cool evenings, sturdy shoes for estate walks, and a torch — the nights here are properly dark.",
    },
    {
      icon: CloudRain,
      title: "Mind the monsoon",
      detail:
        "June to September, expect rain and leeches on the trails. A light raincoat beats an umbrella under the canopy.",
    },
    {
      icon: Coffee,
      title: "Come slow",
      detail:
        "The signal is patchy by design. Bring a book; let the estate set the pace.",
    },
  ];

  return (
    <section aria-labelledby="checklist-heading">
      <SectionHeading
        id="checklist-heading"
        title="Before you go"
        subtitle="A short list so you arrive ready"
      />
      <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.title} className="card-surface flex gap-3 p-4">
            <span className="bg-mist/12 text-mist inline-flex size-9 shrink-0 items-center justify-center rounded-full">
              <item.icon className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-bark text-sm font-medium">{item.title}</p>
              <p className="text-muted-ink mt-0.5 text-sm">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
