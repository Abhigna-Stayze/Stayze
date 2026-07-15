import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — the warm dead-end.
 *
 * When a filter matches nothing or a list is empty, the design answers with a
 * sentence and a way forward, never a blank screen — e.g. Explore's "No stays
 * match those dates yet. Reach out — we might have something coming." + a
 * WhatsApp button. Pass that button (or any node) as `action`.
 *
 * Presentational: the icon, copy and action are all props.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card/60 flex flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="bg-paper-2 text-bark/60 mb-4 inline-flex size-12 items-center justify-center rounded-full">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <h3 className="heading-3 text-bark">{title}</h3>
      {description && (
        <p className="text-muted-ink mt-2 max-w-md text-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
