import { cn } from "@/lib/utils";

/**
 * SectionDivider — a dotted ledger rule between major sections.
 *
 * The quiet horizontal break that paces a long page. With a `label` it centres
 * a small mono caption over the rule (an anchor like "Guest memories"); without
 * one it is a plain dotted line. Decorative — marked `aria-hidden` when it
 * carries no label.
 */
export function SectionDivider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (label) {
    return (
      <div
        className={cn("flex items-center gap-4", className)}
        role="separator"
        aria-label={label}
      >
        <span className="border-border flex-1 border-t border-dotted" />
        <span className="eyebrow text-muted-ink">{label}</span>
        <span className="border-border flex-1 border-t border-dotted" />
      </div>
    );
  }

  return (
    <hr
      aria-hidden
      className={cn("border-border border-t border-dotted", className)}
    />
  );
}
