"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

/**
 * The reusable admin layout frame — the chrome every future admin page renders
 * inside. A fixed sidebar on desktop; on mobile/tablet it collapses into a
 * drawer opened from the top bar (overlay + slide-in, transform/opacity only,
 * closed on backdrop tap). The page content is passed through as `children`, so
 * pages stay Server Components — this client shell only owns the drawer state.
 */
export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="bg-paper-2/40 min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={`bg-bark/50 absolute inset-0 transition-opacity duration-200 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-64 max-w-[80%] transition-transform duration-200 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="text-paper/70 hover:text-paper absolute top-4 right-3 grid size-8 place-items-center rounded-md"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Content column */}
      <div className="lg:pl-64">
        <TopBar user={user} onMenuClick={() => setDrawerOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
