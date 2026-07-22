"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ADMIN_NAV } from "@/components/admin/nav";
import { cn } from "@/lib/utils";

/**
 * The admin sidebar — a dark bark rail that reads as a distinct, internal
 * surface, apart from the paper public site. Live routes highlight in gold;
 * placeholder modules render disabled with a "Soon" tag so the CMS's shape is
 * already visible. Rendered fixed on desktop and inside the mobile drawer;
 * `onNavigate` lets the drawer close itself on a tap.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="bg-bark text-paper flex h-full flex-col">
      <div className="border-paper/10 flex h-16 items-center border-b px-5">
        <Logo variant="reversed" className="h-7" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {ADMIN_NAV.map((item) => {
          // Dashboard matches exactly; a section (e.g. /admin/stays) also stays
          // lit on its sub-pages (/admin/stays/new, /admin/stays/[id]/edit).
          const active =
            item.enabled && item.href
              ? item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/")
              : false;

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                aria-disabled
                className="text-paper/35 flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium"
              >
                <item.icon className="size-5 shrink-0" aria-hidden />
                <span className="flex-1">{item.label}</span>
                <span className="bg-paper/10 text-paper/50 rounded px-1.5 py-0.5 text-[0.625rem] font-medium tracking-wide uppercase">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "bg-gold/15 text-gold"
                  : "text-paper/75 hover:bg-paper/10 hover:text-paper focus-visible:ring-paper/40",
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-paper/10 border-t p-3">
        <LogoutButton />
      </div>
    </div>
  );
}
