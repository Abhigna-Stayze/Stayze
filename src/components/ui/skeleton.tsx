import { cn } from "@/lib/utils";

/**
 * Skeleton — a loading placeholder.
 *
 * A paper-2 block that pulses (opacity only, so it respects the brand's motion
 * rules and `prefers-reduced-motion`). Compose these into card- and list-shaped
 * placeholders while a Suspense boundary or client fetch resolves.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-paper-2 animate-pulse rounded-md", className)}
    />
  );
}
