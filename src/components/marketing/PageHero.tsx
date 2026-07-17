import { cn } from "@/lib/utils";

/**
 * PageHero — the standard opening band for a static/trust page.
 *
 * One reusable header so About, Contact and Become a Host don't each
 * re-implement a hero: a mono eyebrow, a Fraunces display heading, an intro
 * line, and an optional slot for actions (CTAs). Presentational — content is
 * passed in.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-paper-2/50 border-border border-b", className)}>
      <div className="container-page py-14 lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-clay">{eyebrow}</p>
          <h1 className="display text-bark mt-3 text-balance">{title}</h1>
          {intro && (
            <p className="text-muted-ink mt-5 text-lg leading-relaxed text-pretty">
              {intro}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
