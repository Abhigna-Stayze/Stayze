import { cn } from "@/lib/utils";

/**
 * Divider — a hairline rule in the brand's border colour.
 *
 * `orientation="vertical"` needs a height from the parent. `dotted` gives the
 * ledger's dotted rule (section breaks); the dotted *leader* between a label
 * and its value lives in `StatItem`, not here.
 */
export function Divider({
  orientation = "horizontal",
  dotted = false,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  dotted?: boolean;
  className?: string;
}) {
  return (
    <hr
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "border-border m-0",
        orientation === "horizontal"
          ? "w-full border-t"
          : "h-full border-t-0 border-l",
        dotted && "border-dashed",
        className,
      )}
    />
  );
}
