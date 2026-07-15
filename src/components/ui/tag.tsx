import { cn } from "@/lib/utils";

/**
 * Tag — a small label for enumerated attributes.
 *
 * The host's spoken languages ("Kannada"), an amenity name, a stay's tags
 * ("Couples", "Family"). Always non-interactive — for a clickable filter use
 * `Chip`.
 *
 *  - `variant="solid"` (default) — a quiet paper-well pill.
 *  - `variant="outline"` — a bordered pill (the stay card's tag row).
 */
export function Tag({
  children,
  variant = "solid",
  className,
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-bark inline-flex items-center rounded-md px-2 py-1 text-xs",
        variant === "solid"
          ? "bg-paper-2"
          : "border-border border bg-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
