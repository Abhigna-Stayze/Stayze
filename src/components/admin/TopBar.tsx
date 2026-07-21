"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Bell, ChevronDown, UserRound } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/admin/LogoutButton";

/**
 * The admin top bar — mobile menu toggle, page title, a (disabled) notification
 * bell placeholder, and a profile menu that shows who's signed in and offers
 * logout. The profile menu is a small popover: closes on outside click or
 * Escape, animates with opacity/transform only.
 */
export function TopBar({
  user,
  onMenuClick,
}: {
  user: SessionUser;
  onMenuClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <header className="border-border bg-card sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="text-bark hover:bg-paper-2 focus-visible:ring-ring grid size-9 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <p className="eyebrow text-muted-ink hidden sm:block">Admin console</p>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notification placeholder — wired up in a later phase. */}
        <button
          type="button"
          aria-label="Notifications (coming soon)"
          disabled
          title="Coming soon"
          className="text-muted-ink/50 relative grid size-9 cursor-not-allowed place-items-center rounded-md"
        >
          <Bell className="size-5" aria-hidden />
        </button>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="hover:bg-paper-2 focus-visible:ring-ring flex items-center gap-2 rounded-md py-1.5 pr-2 pl-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="bg-clay text-primary-foreground grid size-8 place-items-center rounded-full text-sm font-semibold">
              {initial}
            </span>
            <span className="hidden text-left sm:block">
              <span className="text-bark block text-sm leading-tight font-medium">
                {user.name}
              </span>
              <span className="text-muted-ink block text-xs leading-tight">
                {user.role.replace("_", " ").toLowerCase()}
              </span>
            </span>
            <ChevronDown
              className={`text-muted-ink size-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          <div
            role="menu"
            className={`card-float absolute right-0 mt-2 w-60 origin-top-right overflow-hidden p-1.5 transition-[opacity,transform] duration-150 ${
              open
                ? "visible scale-100 opacity-100"
                : "invisible scale-95 opacity-0"
            }`}
          >
            <div className="border-border border-b px-3 py-2.5">
              <p className="text-bark flex items-center gap-2 text-sm font-medium">
                <UserRound className="text-muted-ink size-4" aria-hidden />
                {user.name}
              </p>
              <p className="text-muted-ink mt-0.5 truncate text-xs">
                {user.email}
              </p>
              <Badge tone="gold" className="mt-2">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
            <div className="pt-1.5">
              <LogoutButton variant="menu" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
