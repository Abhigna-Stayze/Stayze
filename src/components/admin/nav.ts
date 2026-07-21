import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  Compass,
  BookOpen,
  Images,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * The admin sidebar's navigation, in order.
 *
 * Only Dashboard is live in Phase 13.1; the rest are `enabled: false`
 * placeholders that render as disabled rows with a "Soon" tag, so the shell
 * already shows the shape of the CMS. A future module just flips `enabled` and
 * adds an `href`.
 */
export type AdminNavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, enabled: true },
  { label: "Stays", icon: Home, enabled: false },
  { label: "Bookings", icon: CalendarCheck, enabled: false },
  { label: "Experiences", icon: Compass, enabled: false },
  { label: "Travel Guides", icon: BookOpen, enabled: false },
  { label: "Media", icon: Images, enabled: false },
  { label: "Settings", icon: Settings, enabled: false },
];
