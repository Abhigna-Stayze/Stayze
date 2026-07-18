/**
 * Small SEO helpers shared across pages.
 *
 * `SITE_URL` is the one place the production origin is written down (it also
 * matches `metadataBase` in the root layout). `breadcrumbJsonLd` builds a
 * schema.org `BreadcrumbList` from a simple trail, so detail pages can publish
 * their position in the site hierarchy without repeating the boilerplate.
 *
 * A pure module — no data access — safe to import from any Server Component.
 */

export const SITE_URL = "https://stayze.in";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/**
 * A `BreadcrumbList` for a page's trail. Pass `{ name, path }` from the root
 * down to the current page; the last item is the page itself.
 */
export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
