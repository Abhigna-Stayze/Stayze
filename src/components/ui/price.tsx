import { cn } from "@/lib/utils";

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Format an amount in its currency with locale grouping — ₹4,500, not ₹4500.
 * Indian grouping for INR (the only live currency), the browser default else.
 */
export function formatPrice(amount: number, currency = "INR"): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return `${symbol}${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/**
 * Price — the amount in mono, always with its unit.
 *
 * "A number without a unit is how you get a complaint" — so `/night` is on by
 * default. The amount is mono (`.num`) and bark; the unit is muted and smaller.
 * `size="lg"` is the booking-card headline; `md` is the stay card.
 */
export function Price({
  amount,
  currency = "INR",
  unit = "/night",
  size = "md",
  className,
}: {
  amount: number;
  currency?: string;
  /** The per-unit suffix. Pass `null` for a bare total (e.g. an estimate). */
  unit?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const amountClass = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-3xl",
  }[size];

  return (
    <span
      className={cn("text-bark inline-flex items-baseline gap-1", className)}
    >
      <span className={cn("num font-semibold", amountClass)}>
        {formatPrice(amount, currency)}
      </span>
      {unit && (
        <span className="text-muted-ink text-sm font-normal">{unit}</span>
      )}
    </span>
  );
}
