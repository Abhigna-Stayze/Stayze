import { cn } from "@/lib/utils";

/**
 * Tag — a small paper-well label for enumerated attributes.
 *
 * The host's spoken languages ("Kannada", "English"), an amenity name, a
 * highlight. Quieter than a `Badge` and always non-interactive. A row of them
 * reads like the marginalia in a ledger.
 */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-paper-2 text-bark inline-flex items-center rounded-md px-2 py-1 text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}
