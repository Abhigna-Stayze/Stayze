import { cn } from "@/lib/utils";

/**
 * SearchField — one labelled cell of the search bar.
 *
 * The small mono eyebrow ("WHERE", "CHECK-IN") over its control or value. It is
 * a presentational slot: the caller drops in a `<Select>`, an `<Input>`, a
 * `GuestCounter`, or plain text (the read-only value the mockups show). Lay
 * several inside a `SearchBar`, which draws the dividers between them.
 */
export function SearchField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 px-4 py-2.5", className)}>
      <span className="eyebrow text-muted-ink">{label}</span>
      <div className="text-bark min-w-0 text-sm">{children}</div>
    </div>
  );
}
