import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

export type FaqItem = { question: string; answer: React.ReactNode };

/**
 * Faq — an accessible questions list, no client JavaScript.
 *
 * Built on native `<details>`/`<summary>` — keyboard operable, screen-reader
 * announced and open-by-default-safe for free, the same no-JS pattern the stay
 * page uses for "show all reviews". The `+` glyph rotates to `×` on open via a
 * CSS `group-open` transform (transform only, reduced-motion friendly).
 *
 * Reused by Contact and Become a Host. Presentational — items are passed in.
 */
export function Faq({
  id,
  eyebrow,
  title,
  items,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  items: FaqItem[];
}) {
  return (
    <section aria-labelledby={`${id}-heading`}>
      <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} title={title} />
      <div className="border-border divide-border mt-6 divide-y overflow-hidden rounded-lg border">
        {items.map((item, i) => (
          <details key={i} className="group bg-card">
            <summary className="hover:bg-paper-2/50 focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <span className="text-bark font-serif text-base">
                {item.question}
              </span>
              <Plus
                className="text-clay size-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
                aria-hidden
              />
            </summary>
            <div className="text-muted-ink px-5 pb-5 text-sm leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
