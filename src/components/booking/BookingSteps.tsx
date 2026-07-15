import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BookingSteps — the three-step progress header for the booking flow.
 *
 * "✓ Dates · 2 Your details · 3 Review & send". A completed step shows a mist
 * tick, the current step is clay with a clay underline, and upcoming steps are
 * muted with their number. Presentational: `current` (1-based) is owned by the
 * page. There are three steps, never four — this is a request-to-book flow with
 * no payment step.
 */
export function BookingSteps({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("border-border flex border-b", className)}>
      {steps.map((step, i) => {
        const index = i + 1;
        const state =
          index < current
            ? "complete"
            : index === current
              ? "current"
              : "upcoming";
        return (
          <li
            key={step}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm",
              state === "current"
                ? "border-clay text-clay font-medium"
                : "border-transparent",
              state === "complete" && "text-mist",
              state === "upcoming" && "text-muted-ink",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center",
                state !== "complete" && "num",
              )}
              aria-hidden
            >
              {state === "complete" ? (
                <Check className="size-4" strokeWidth={2.5} />
              ) : (
                index
              )}
            </span>
            <span className="truncate">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
