import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Rating — "★ 4.8", optionally "· 23 reviews".
 *
 * Two brand rules are enforced here so no caller can get them wrong:
 *  - **The figure is mono** (`.num`). A rating is a number.
 *  - **`value === null` renders nothing** — it returns `null`. A null rating
 *    means nobody has reviewed the stay yet; showing "0" would display a new
 *    property as one star. Callers decide what to show instead (the stay card
 *    shows a "New stay" badge); this component simply refuses to invent a zero.
 */
export function Rating({
  value,
  reviewCount,
  showCount = false,
  className,
}: {
  value: number | null;
  reviewCount?: number;
  showCount?: boolean;
  className?: string;
}) {
  if (value === null || value === undefined) return null;

  return (
    <span
      className={cn(
        "text-bark inline-flex items-center gap-1 text-sm",
        className,
      )}
    >
      <Star className="fill-gold text-gold size-3.5" aria-hidden />
      <span className="num font-medium">{value.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-muted-ink">
          {" · "}
          <span className="num">{reviewCount}</span>{" "}
          {reviewCount === 1 ? "review" : "reviews"}
        </span>
      )}
    </span>
  );
}
