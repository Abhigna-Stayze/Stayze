import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea — the multi-line sibling of `Input`, same treatment.
 *
 * The booking flow's "Anything we should know?" note. Optional mono eyebrow
 * `label`, optional `hint` (e.g. a character budget) and `error`. Owns no
 * state; the parent controls the value.
 */
export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: React.ComponentProps<"textarea"> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  const field = (
    <textarea
      id={fieldId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(
        "border-input bg-card text-ink placeholder:text-muted-ink/70 focus-visible:ring-ring focus-visible:ring-offset-background flex min-h-24 w-full rounded-md border px-3 py-2.5 text-sm leading-relaxed transition-[color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-error focus-visible:ring-error",
        className,
      )}
      {...props}
    />
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
        <p id={`${fieldId}-error`} className="text-error text-xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${fieldId}-hint`} className="text-muted-ink text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
