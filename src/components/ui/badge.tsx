import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — a small, static label pill.
 *
 * For short status/labels drawn from the eight brand tokens: a "New stay" mark,
 * a tier, a category. Not interactive — for a clickable filter pill use `Chip`,
 * and for the gold FitScore stamp use `FitScoreBadge`.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        // Neutral well — the default, for a "New stay" or a plain label.
        neutral: "border-border bg-paper-2 text-bark",
        // Verification / success.
        mist: "border-mist/40 bg-mist/12 text-mist",
        // Tags, the inspected accent.
        gold: "border-gold/50 bg-gold/18 text-bark",
        // On a dark (bark) surface — hero, footer.
        onDark: "border-paper/25 bg-paper/10 text-paper",
        outline: "border-border bg-transparent text-bark",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

function Badge({
  className,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ tone, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
