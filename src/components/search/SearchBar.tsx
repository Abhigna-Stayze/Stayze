import { cn } from "@/lib/utils";

/**
 * SearchBar — the horizontal bar that holds the search fields.
 *
 * Used twice at two sizes: floating over the Home hero (`floating`, a stronger
 * lift) and pinned at the top of Explore (`inline`). It lays out its
 * `SearchField` children in a row on desktop with hairline dividers between
 * them, stacking to a column on mobile, and pins the submit control (`action`)
 * to the end.
 *
 * Presentational and stateless — it owns no query state and performs no search.
 * The page wraps it in a form (or client handler) and passes the controls and
 * the submit button in. That keeps this reusable for both the read-only mockup
 * state and a live form.
 */
export function SearchBar({
  children,
  action,
  variant = "inline",
  className,
}: {
  children: React.ReactNode;
  /** The submit control — typically a clay `<Button>Search →</Button>`. */
  action?: React.ReactNode;
  variant?: "inline" | "floating";
  className?: string;
}) {
  return (
    <div
      role="search"
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border sm:flex-row sm:items-stretch",
        variant === "floating"
          ? "border-border bg-card shadow-float"
          : "border-border bg-card shadow-card",
        className,
      )}
    >
      <div className="divide-border flex flex-1 flex-col divide-y sm:flex-row sm:items-stretch sm:divide-x sm:divide-y-0">
        {children}
      </div>
      {action && (
        <div className="flex shrink-0 items-stretch p-2 sm:items-center">
          {action}
        </div>
      )}
    </div>
  );
}
