import { cn } from "@/lib/utils";

/**
 * VerifiedBadge — a single mist-tick trust mark: "✓ Verified".
 *
 * The building block of the trust bar (✓ Verified · ✓ Inspected · ✓
 * Transparent Pricing · ✓ Local Support) and any inline reassurance. The tick
 * is mist, the label bark. For the gold FitScore stamp use `FitScoreBadge`;
 * this is the plain promise mark.
 *
 * `tone="onDark"` flips the label to paper for the footer's bark strip.
 */
export function VerifiedBadge({
  label,
  tone = "default",
  className,
}: {
  label: string;
  tone?: "default" | "onDark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        tone === "onDark" ? "text-paper" : "text-bark",
        className,
      )}
    >
      <span aria-hidden className="text-mist">
        ✓
      </span>
      {label}
    </span>
  );
}
