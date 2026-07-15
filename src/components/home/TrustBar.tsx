import { VerifiedBadge } from "@/components/shared/VerifiedBadge";

const MARKS = ["Verified", "Inspected", "Transparent pricing", "Local support"];

/**
 * TrustBar — the verification promise, carried once near the top of Home.
 *
 * A slim strip of mist-tick marks built from the reused `VerifiedBadge`. Static
 * and presentational. Distinct from the footer's strip by placement: this one
 * reassures a visitor before they scroll into the stays.
 */
export function TrustBar() {
  return (
    <div className="border-border bg-paper-2/50 border-b">
      <ul className="container-page flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-center">
        {MARKS.map((mark) => (
          <li key={mark}>
            <VerifiedBadge label={mark} />
          </li>
        ))}
      </ul>
    </div>
  );
}
