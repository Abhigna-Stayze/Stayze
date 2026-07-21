import type { LucideIcon } from "lucide-react";

/**
 * A dashboard statistic card. In Phase 13.1 the values are placeholders (no
 * data module is wired yet), so `value` defaults to an em dash and a caption
 * marks it as not-yet-tracked. When a module lands, pass a real `value`.
 * Presentational and reusable.
 */
export function StatCard({
  label,
  value = "—",
  note = "Not yet tracked",
  icon: Icon,
}: {
  label: string;
  value?: React.ReactNode;
  note?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-ink text-sm">{label}</p>
        <span className="bg-paper-2 text-clay inline-flex size-9 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="num text-bark mt-3 text-3xl font-semibold">{value}</p>
      <p className="text-muted-ink/70 mt-1 text-xs">{note}</p>
    </div>
  );
}
