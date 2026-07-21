import type { Metadata } from "next";
import {
  Home,
  CalendarCheck,
  Compass,
  BookOpen,
  Plus,
  ClipboardList,
  Sparkles,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const STATS = [
  { label: "Total Stays", icon: Home },
  { label: "Total Bookings", icon: CalendarCheck },
  { label: "Total Experiences", icon: Compass },
  { label: "Total Guides", icon: BookOpen },
];

const QUICK_ACTIONS = [
  { label: "Add Stay", icon: Plus },
  { label: "Manage Bookings", icon: ClipboardList },
  { label: "Manage Experiences", icon: Sparkles },
];

/**
 * The dashboard shell — a Server Component. Structure only in Phase 13.1: the
 * stat cards, recent activity and quick actions are placeholders, wired to real
 * data and CRUD in later phases. It renders inside the protected `AdminShell`.
 */
export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="heading-1 text-bark">Dashboard</h1>
        <p className="text-muted-ink mt-1.5">
          Welcome to the Stayze admin console. Modules arrive in the next
          phases.
        </p>
      </header>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mt-8">
        <h2 id="stats-heading" className="sr-only">
          Overview statistics
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} label={s.label} icon={s.icon} />
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent activity */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="heading-3 text-bark">
            Recent activity
          </h2>
          <div className="card-surface mt-4 flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="bg-paper-2 text-bark/50 mb-4 inline-flex size-12 items-center justify-center rounded-full">
              <Activity className="size-6" aria-hidden />
            </span>
            <p className="text-bark font-medium">No activity yet</p>
            <p className="text-muted-ink mt-1 max-w-xs text-sm">
              Bookings, edits and publishing events will appear here once the
              modules are live.
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="heading-3 text-bark">
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                disabled
                title="Coming soon"
                className="card-surface text-muted-ink flex cursor-not-allowed items-center gap-3 p-4 text-left text-sm font-medium opacity-70"
              >
                <span className="bg-paper-2 inline-flex size-9 items-center justify-center rounded-full">
                  <a.icon className="size-4" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="text-bark block">{a.label}</span>
                </span>
                <span className="bg-paper-2 text-muted-ink rounded px-1.5 py-0.5 text-[0.625rem] font-medium tracking-wide uppercase">
                  Soon
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
