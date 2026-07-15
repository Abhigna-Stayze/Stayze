"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRIMARY_NAV } from "@/lib/nav";
import { NavLink } from "./NavLink";
import { Logo } from "./Logo";

/**
 * The mobile navigation drawer, shown below `lg`.
 *
 * Built on Sheet (Radix Dialog), so Escape-to-close, the focus trap, body
 * scroll lock and focus return are handled correctly rather than approximated.
 * The only local state is `open`, which we control so tapping a link both
 * navigates and closes the drawer — Radix does not close on link clicks by
 * itself.
 */
export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="text-bark hover:bg-paper-2/60 focus-visible:ring-ring focus-visible:ring-offset-paper inline-flex size-11 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
      >
        <MenuIcon className="size-6" />
      </SheetTrigger>

      <SheetContent side="right" className="p-6">
        {/* A title is required for an accessible dialog; the logo carries the
            brand, so the title is visually the logo and screen-reader labelled. */}
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Logo />

        <nav aria-label="Primary" className="mt-4 flex flex-col">
          {PRIMARY_NAV.map((item) => (
            <SheetClose asChild key={item.href}>
              <NavLink
                item={item}
                onNavigate={() => setOpen(false)}
                className="border-border border-b py-4 text-base"
              />
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
