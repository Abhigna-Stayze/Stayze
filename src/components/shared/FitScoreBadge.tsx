import { cn } from "@/lib/utils";

/**
 * FitScoreBadge — the "every stay was visited" mark, in two treatments.
 *
 * The single strongest thing Stayze can say and an OTA cannot. **Render it only
 * when a FitScore exists** — the score is required and non-null here, so a
 * caller with no score simply doesn't render one, and never fakes it.
 *
 *  - `variant="stamp"` (default) — the gold `.stamp` pill ("✓ Inspected 89")
 *    used large on the stay page.
 *  - `variant="outline"` — a bordered clay pill with a dot and uppercase mono
 *    ("● VERIFIED · 89/100"), used on the stay card. Pass `outOf` to render the
 *    score as a fraction.
 *
 * The number is always mono.
 */
export function FitScoreBadge({
  score,
  label = "Inspected",
  outOf,
  variant = "stamp",
  className,
}: {
  score: number;
  label?: string;
  /** When set, renders the score as `score/outOf` (e.g. 89/100). */
  outOf?: number;
  variant?: "stamp" | "outline";
  className?: string;
}) {
  const scoreNode = (
    <span className="num">
      {score}
      {outOf ? `/${outOf}` : ""}
    </span>
  );

  if (variant === "outline") {
    return (
      <span
        className={cn(
          "border-clay/45 text-clay inline-flex items-center gap-2 rounded-md border px-2.5 py-1",
          className,
        )}
      >
        <span aria-hidden className="bg-clay size-1.5 rounded-full" />
        <span className="eyebrow">
          {label} · {scoreNode}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("stamp", className)}>
      <span aria-hidden className="text-mist">
        ✓
      </span>
      {label} {scoreNode}
    </span>
  );
}
