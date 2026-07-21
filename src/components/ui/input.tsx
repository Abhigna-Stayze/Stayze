import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — a text field, skinned to the ledger.
 *
 * Card surface, border hairline, clay focus ring (inherited from the base
 * layer). An optional `label` renders as the small mono eyebrow the design puts
 * above every field ("FULL NAME", "PHONE — WHATSAPP"), wired to the input for
 * screen readers. `mono` sets the value in JetBrains Mono for figures (a phone
 * number, a date). `error` swaps the border and ring to the error token.
 *
 * Controlled or uncontrolled by the parent — this owns no state.
 */
export function Input({
  label,
  hint,
  error,
  mono = false,
  trailing,
  id,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
  /** An adornment pinned to the right of the field, e.g. a show/hide toggle. */
  trailing?: React.ReactNode;
}) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const input = (
    <input
      id={inputId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cn(
        "border-input bg-card text-ink placeholder:text-muted-ink/70 focus-visible:ring-ring focus-visible:ring-offset-background flex h-11 w-full rounded-md border px-3 text-sm transition-[color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        mono && "num",
        trailing && "pr-11",
        error && "border-error focus-visible:ring-error",
        className,
      )}
      {...props}
    />
  );

  // A trailing adornment sits over the right edge of the input.
  const field = trailing ? (
    <div className="relative">
      {input}
      <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
        {trailing}
      </div>
    </div>
  ) : (
    input
  );

  if (!label && !hint && !error) return field;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="eyebrow text-muted-ink">
          {label}
        </label>
      )}
      {field}
      {error ? (
        <p id={`${inputId}-error`} className="text-error text-xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-muted-ink text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
