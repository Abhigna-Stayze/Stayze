import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select — a native `<select>` skinned to the ledger.
 *
 * The booking/search flow's simple pickers (e.g. "Where" locked to
 * Chikmagalur). Native on purpose: it is keyboard- and screen-reader-correct
 * for free and behaves like the phone's own picker on mobile, which matters for
 * this audience. For anything richer, reach for a Radix listbox — this covers
 * the plain cases the design shows. Owns no state.
 */
export function Select({
  label,
  hint,
  error,
  id,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  const field = (
    <div className="relative">
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "border-input bg-card text-ink focus-visible:ring-ring focus-visible:ring-offset-background flex h-11 w-full appearance-none rounded-md border pr-9 pl-3 text-sm transition-[color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-error focus-visible:ring-error",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="text-muted-ink pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden
      />
    </div>
  );

  if (!label && !hint && !error) return field;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="eyebrow text-muted-ink">
          {label}
        </label>
      )}
      {field}
      {error ? (
        <p className="text-error text-xs">{error}</p>
      ) : (
        hint && <p className="text-muted-ink text-xs">{hint}</p>
      )}
    </div>
  );
}
