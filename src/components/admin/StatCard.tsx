import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/**
 * A dashboard statistic card.
 *
 * `value` defaults to an em dash with a "not yet tracked" caption, which is what
 * a metric with no module behind it should look like. Pass `href` and the whole
 * card becomes a link to the module that owns the number.
 */
export function StatCard({
  label,
  value = "—",
  note = "Not yet tracked",
  icon: Icon,
  href,
}: {
  label: string;
  value?: React.ReactNode;
  note?: string;
  icon: LucideIcon;
  href?: string | null;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-ink min-w-0 truncate text-sm">{label}</p>
        <span className="bg-paper-2 text-clay inline-flex size-8 shrink-0 items-center justify-center rounded-full sm:size-9">
          <Icon className="size-4 sm:size-5" aria-hidden />
        </span>
      </div>
      <p className="num text-bark mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">
        {value}
      </p>
      <p className="text-muted-ink/70 mt-1 truncate text-xs">{note}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="card-surface hover:border-clay/40 focus-visible:ring-ring block p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:p-5"
      >
        {body}
      </Link>
    );
  }

  return <div className="card-surface p-4 sm:p-5">{body}</div>;
}
