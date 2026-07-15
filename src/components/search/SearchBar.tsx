import { cn } from "@/lib/utils";

/**
 * SearchBar — the horizontal bar that holds the search fields.
 *
 * Used at two sizes: floating over the Home hero (`floating`, a stronger lift)
 * and pinned at the top of Explore (`inline`). Responsive by design so it stays
 * compact enough to sit within the hero's first view on a phone:
 *
 *  - **mobile** — the fields form a 2×2 grid with hairline gutters, the submit
 *    control spans full width beneath.
 *  - **desktop** — the fields sit in a row with dividers between them, the
 *    submit control pinned to the end.
 *
 * Presentational and stateless — it owns no query state and performs no search.
 * The page wraps it in a form and passes the controls and submit button in.
 */
export function SearchBar({
  children,
  action,
  variant = "inline",
  className,
}: {
  children: React.ReactNode;
  /** The submit control — typically a clay `<Button>Search</Button>`. */
  action?: React.ReactNode;
  variant?: "inline" | "floating";
  className?: string;
}) {
  return (
    <div
      role="search"
      className={cn(
        "border-border bg-card flex flex-col overflow-hidden rounded-xl border sm:flex-row sm:items-stretch",
        variant === "floating" ? "shadow-float" : "shadow-card",
        className,
      )}
    >
      {/* Fields. The `gap-px` over a `bg-border` ground draws hairline gutters
          between the 2×2 mobile cells; on desktop it becomes a divided row. */}
      <div className="bg-border grid flex-1 grid-cols-2 gap-px sm:flex sm:items-stretch sm:gap-0">
        {children}
      </div>
      {action && (
        <div className="border-border bg-card flex shrink-0 items-stretch border-t p-2 sm:items-center sm:border-t-0 sm:border-l">
          {action}
        </div>
      )}
    </div>
  );
}
