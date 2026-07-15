import { cn } from "@/lib/utils";

/**
 * SectionHeading — the standard block that opens a section.
 *
 * An optional mono `eyebrow`, a Fraunces `title`, and an optional `subtitle`
 * that sits inline beside the title (muted, smaller) exactly as the mockups do
 * — "Featured stays  ·  Every one visited, not just listed". An optional
 * `action` (a "View all →" link) is pushed to the right.
 *
 * Presentational: heading level is configurable via `as` so a page keeps a
 * correct document outline.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  as: Tag = "h2",
  id,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  /** id for the heading, so a `<section aria-labelledby>` can name itself by it. */
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-2",
        className,
      )}
    >
      <div>
        {eyebrow && <p className="eyebrow text-muted-ink mb-2">{eyebrow}</p>}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Tag id={id} className="heading-2 text-bark">
            {title}
          </Tag>
          {subtitle && (
            <span className="text-muted-ink text-sm">{subtitle}</span>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
