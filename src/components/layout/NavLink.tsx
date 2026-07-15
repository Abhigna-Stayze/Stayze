"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

/**
 * A single nav link with active state.
 *
 * The one reason the nav needs any client JS: the active page is highlighted in
 * clay, and knowing the active page means reading the pathname. Everything else
 * about the header stays a Server Component. A link is active on its own route
 * and on child routes (/explore also lights up on /explore?tag=…), but "/" only
 * matches exactly so Home never marks every link active.
 */
export function NavLink({
  item,
  onNavigate,
  className,
}: {
  item: NavItem;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-offset-paper rounded-sm text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        // Clay when active, bark when hovered, muted at rest. Never clay on
        // resting body text — this is an interactive control, and only the
        // active one is clay.
        active
          ? "text-clay"
          : item.emphasis
            ? "text-bark hover:text-clay font-medium"
            : "text-muted-ink hover:text-bark",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}
