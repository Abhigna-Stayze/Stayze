import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FitScoreBadge — the gold "✓ Inspected 89" stamp.
 *
 * The single strongest thing Stayze can say and an OTA cannot: every property
 * was personally visited. It sits top-left on a stay card and appears again,
 * larger, on the stay page.
 *
 * **Render it only when a FitScore exists.** The score is mono; the stamp uses
 * the brand `.stamp` treatment (gold on paper). Never fake a score — a caller
 * with `score == null` should not render this at all, which is why `score` is
 * required and non-null here.
 */
export function FitScoreBadge({
  score,
  label = "Inspected",
  className,
}: {
  score: number;
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("stamp", className)}>
      <Check className="text-mist size-3.5" aria-hidden strokeWidth={2.5} />
      {label} <span className="num">{score}</span>
    </span>
  );
}
