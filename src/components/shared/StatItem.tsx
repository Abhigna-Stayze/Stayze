import { cn } from "@/lib/utils";

/**
 * StatItem — a label and its value on one ledger line, joined by a dotted leader.
 *
 * The "Quick facts" grid on the stay page (Bedrooms … 3, Check-in … 2:00 PM)
 * and the running rows of the booking summary (Nights … 2). The dotted leader
 * between label and value is the ledger's signature; the value is mono by
 * default because a fact is almost always a figure — pass `mono={false}` for a
 * word value ("Meals … Breakfast").
 */
export function StatItem({
  label,
  value,
  mono = true,
  emphasis = false,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
  /** Heavier value — the summary's total line. */
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-muted-ink shrink-0 text-sm">{label}</span>
      <span
        className="border-border/70 min-w-4 flex-1 translate-y-[-3px] border-b border-dotted"
        aria-hidden
      />
      <span
        className={cn(
          "text-bark shrink-0 text-right text-sm",
          mono && "num",
          emphasis && "font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}
