// The verification promise, itemised. Static, brand copy — there is no CMS
// model for it in Schema v1.1, so it lives here like the other informational
// sections. Kept as JS strings (rendered as expressions) so the apostrophes and
// quotes need no escaping.
const CHECKS = [
  'Water supply confirmed reliable, not just "available"',
  "Power backup tested for monsoon-season outages",
  "Caretaker met in person, not just listed as a contact",
  "Road access checked for rainy-season accessibility",
  "Photos shot on-site, never stock or borrowed images",
  "Every property scored out of 100 before it's listed",
  "Score re-checked every six months, not just once",
  "Properties that don't pass simply aren't listed here",
];

/** Two-digit mono index — 1 → "01". */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function Column({ items, start }: { items: string[]; start: number }) {
  return (
    <ul className="divide-border divide-y">
      {items.map((item, i) => (
        <li key={item} className="flex items-baseline gap-4 py-4">
          <span className="num text-mist shrink-0 text-sm">
            {pad(start + i + 1)}
          </span>
          <span className="text-bark text-[15px] leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * VerificationChecklist — "what verification actually means".
 *
 * The FitScore stamp is the differentiator; this section spells out what it
 * stands for, in two columns of numbered checks. Static and presentational,
 * built from the brand tokens (mist eyebrow and index numbers, since mist is
 * the verification colour). Sits on a paper-2 band to set the promise apart
 * from the card sections around it.
 */
export function VerificationChecklist() {
  const half = Math.ceil(CHECKS.length / 2);

  return (
    <section
      className="bg-paper-2/60 border-border border-y"
      aria-labelledby="verification-heading"
    >
      <div className="container-page section">
        <p className="eyebrow text-mist">What verification actually means</p>
        <h2
          id="verification-heading"
          className="heading-1 text-bark mt-3 max-w-xl"
        >
          We check the things photos can’t show you.
        </h2>

        <div className="mt-10 grid gap-x-16 sm:grid-cols-2">
          <Column items={CHECKS.slice(0, half)} start={0} />
          <Column items={CHECKS.slice(half)} start={half} />
        </div>
      </div>
    </section>
  );
}
