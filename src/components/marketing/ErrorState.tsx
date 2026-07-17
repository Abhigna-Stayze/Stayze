import type { LucideIcon } from "lucide-react";

/**
 * ErrorState — the shared layout behind the 404 and 500 pages.
 *
 * A calm, centred panel: a big ghosted status number, a roofline-style icon
 * badge, a friendly line, and whatever actions the page passes in. Purely
 * presentational and hook-free, so both the (server) not-found page and the
 * (client) error boundary can use it. Keeps the two error screens identical in
 * feel without duplicating the layout.
 */
export function ErrorState({
  code,
  icon: Icon,
  title,
  description,
  children,
}: {
  code: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className="num text-paper-2 pointer-events-none absolute -z-0 text-[9rem] leading-none font-semibold select-none sm:text-[12rem]"
        >
          {code}
        </span>
        <span className="bg-card border-border text-clay shadow-card relative z-10 inline-flex size-16 items-center justify-center rounded-full border">
          <Icon className="size-7" aria-hidden />
        </span>
      </div>

      <h1 className="heading-1 text-bark mt-8 text-balance">{title}</h1>
      <p className="text-muted-ink mt-3 max-w-md text-base leading-relaxed">
        {description}
      </p>

      {children && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
