import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  CalendarCheck,
  Compass,
  BookOpen,
  Plus,
  Sparkles,
  Images,
  Settings as SettingsIcon,
  Activity,
  AlertTriangle,
  Info,
  MessageSquare,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { getDashboardData } from "@/services/admin-dashboard.service";
import { StatCard } from "@/components/admin/StatCard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const STAT_ICONS: LucideIcon[] = [Home, CalendarCheck, Compass, BookOpen];

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  BOOKING: CalendarCheck,
  STAY: Pencil,
  EXPERIENCE: Sparkles,
  MESSAGE: MessageSquare,
};

const QUICK_ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Add a stay", href: "/admin/stays/new", icon: Plus },
  {
    label: "Add an experience",
    href: "/admin/experiences/new",
    icon: Sparkles,
  },
  { label: "Media library", href: "/admin/media", icon: Images },
  { label: "Site settings", href: "/admin/settings", icon: SettingsIcon },
];

/** "3 hours ago", "2 days ago" — relative, because exact times don't help here. */
function ago(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs) {
      return rtf.format(-Math.round(seconds / secs), unit);
    }
  }
  return "just now";
}

/**
 * The dashboard — a Server Component reading real counts, real alerts and a
 * real activity feed from the models that exist.
 *
 * There is no audit log table, so the feed is derived from the timestamps the
 * schema already keeps rather than a recorded event stream. Metrics with no
 * module behind them (bookings, travel guides) still show their true count —
 * they just aren't clickable, because there is nowhere to go yet.
 */
export default async function AdminDashboardPage() {
  const { stats, alerts, activity } = await getDashboardData();

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="heading-1 text-bark">Dashboard</h1>
        <p className="text-muted-ink mt-1.5">
          What’s on Stayze right now, and what needs your attention.
        </p>
      </header>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mt-8">
        <h2 id="stats-heading" className="sr-only">
          Overview statistics
        </h2>
        {/* Two across on phones — four tall cards stacked is a lot of scrolling. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              note={s.note}
              icon={STAT_ICONS[i] ?? Home}
              href={s.href}
            />
          ))}
        </div>
      </section>

      {/* Needs attention */}
      {alerts.length > 0 && (
        <section aria-labelledby="alerts-heading" className="mt-6">
          <h2 id="alerts-heading" className="heading-3 text-bark">
            Needs attention
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {alerts.map((a) => {
              const Icon = a.tone === "warn" ? AlertTriangle : Info;
              const row = (
                <>
                  <span
                    className={
                      a.tone === "warn"
                        ? "bg-error/10 text-error inline-flex size-8 shrink-0 items-center justify-center rounded-full"
                        : "bg-paper-2 text-muted-ink inline-flex size-8 shrink-0 items-center justify-center rounded-full"
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-bark min-w-0 flex-1 text-sm">
                    {a.label}
                  </span>
                  {a.count !== null && (
                    <span className="num text-bark shrink-0 font-semibold">
                      {a.count}
                    </span>
                  )}
                </>
              );
              return (
                <li key={a.label}>
                  {a.href ? (
                    <Link
                      href={a.href}
                      className="card-surface hover:border-clay/40 flex items-center gap-3 p-3.5 transition-colors"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="card-surface flex items-center gap-3 p-3.5">
                      {row}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent activity. `min-w-0`: a grid item defaults to min-width:auto, so
            the truncated (white-space:nowrap) titles inside would otherwise set
            its min-content width to the full string and overflow the track. */}
        <section aria-labelledby="activity-heading" className="min-w-0">
          <h2 id="activity-heading" className="heading-3 text-bark">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <div className="card-surface mt-4 flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="bg-paper-2 text-bark/50 mb-4 inline-flex size-12 items-center justify-center rounded-full">
                <Activity className="size-6" aria-hidden />
              </span>
              <p className="text-bark font-medium">No activity yet</p>
              <p className="text-muted-ink mt-1 max-w-xs text-sm">
                Bookings, edits and messages will appear here as they happen.
              </p>
            </div>
          ) : (
            <ul className="card-surface divide-border/60 mt-4 divide-y">
              {activity.map((a, i) => {
                const Icon = ACTIVITY_ICONS[a.kind] ?? Activity;
                return (
                  <li key={i} className="flex items-start gap-3 p-3.5">
                    <span className="bg-paper-2 text-muted-ink mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      {a.href ? (
                        <Link
                          href={a.href}
                          className="text-bark hover:text-clay block truncate text-sm font-medium"
                        >
                          {a.title}
                        </Link>
                      ) : (
                        <p className="text-bark truncate text-sm font-medium">
                          {a.title}
                        </p>
                      )}
                      {/* On phones the time joins the detail line rather than
                          squeezing the title into a narrow column. */}
                      <p className="text-muted-ink mt-0.5 truncate text-xs">
                        {a.detail}
                        <span className="sm:hidden"> · {ago(a.at)}</span>
                      </p>
                    </div>
                    <span className="text-muted-ink/70 hidden shrink-0 text-xs whitespace-nowrap sm:block">
                      {ago(a.at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section aria-labelledby="actions-heading" className="min-w-0">
          <h2 id="actions-heading" className="heading-3 text-bark">
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="card-surface hover:border-clay/40 flex items-center gap-3 p-4 text-left text-sm font-medium transition-colors"
              >
                <span className="bg-paper-2 text-clay inline-flex size-9 items-center justify-center rounded-full">
                  <a.icon className="size-4" aria-hidden />
                </span>
                <span className="text-bark flex-1">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
