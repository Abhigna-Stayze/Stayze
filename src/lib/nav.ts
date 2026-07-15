/**
 * Site navigation — structural routes, not content.
 *
 * These are the app's own pages, so they live in code, not the database. Only
 * CONTACT details (WhatsApp, email, phone, socials) come from the API; a route
 * like /explore is architecture. Kept here so the header and footer agree on
 * one list.
 *
 * Every route Schema v1.1 can support. Deliberately NO /login, /signup or
 * /account — there is no User model, and a link to a page that cannot exist is
 * worse than no link.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Emphasised in the header, per the design (the "Become a Host" item). */
  emphasis?: boolean;
};

/** The primary header navigation. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Experiences", href: "/experiences" },
  { label: "Travel Guide", href: "/travel-guide" },
  { label: "Become a Host", href: "/become-a-host", emphasis: true },
];

/** Footer link columns. Contact + socials are injected from the API separately. */
export const FOOTER_NAV: Array<{ heading: string; items: NavItem[] }> = [
  {
    heading: "Travel",
    items: [
      { label: "Explore stays", href: "/explore" },
      { label: "Experiences", href: "/experiences" },
      { label: "Travel Guide", href: "/travel-guide" },
    ],
  },
  {
    heading: "Stayze",
    items: [
      { label: "About", href: "/about" },
      { label: "Become a Host", href: "/become-a-host" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

/** The verification promises in the footer trust strip (brand copy, not data). */
export const TRUST_MARKS = [
  "Verified",
  "Inspected",
  "Transparent Pricing",
  "Local Support",
] as const;
