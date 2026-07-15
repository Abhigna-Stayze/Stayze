import { PRIMARY_NAV } from "@/lib/nav";
import { NavLink } from "./NavLink";

/**
 * The desktop primary navigation. Server-rendered — only the individual
 * NavLinks reach for the pathname to show active state.
 *
 * Hidden below the `lg` breakpoint, where MobileNavigation's drawer takes over.
 */
export function Navigation() {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
      {PRIMARY_NAV.map((item) => (
        <NavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}
