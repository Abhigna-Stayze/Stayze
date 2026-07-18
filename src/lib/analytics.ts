/**
 * Analytics hook points — wiring, not an integration.
 *
 * No analytics service is loaded yet. This module is the clean seam so one can
 * be added later by setting an env var, with product code already calling
 * `track(...)` at the right moments. Until an ID is configured (see
 * `Analytics.tsx`), every call here is a safe no-op.
 *
 * The forwarders detect whichever tag is present at runtime — Google Analytics
 * (`gtag`), Google Tag Manager (`dataLayer`) or Microsoft Clarity (`clarity`) —
 * so the same `track()` call works regardless of which tool the founder wires
 * up. Client-safe: it does nothing during SSR.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    clarity?: (...args: any[]) => void;
  }
}

type Props = Record<string, unknown>;

/** Record a custom event. No-op until an analytics tag is configured. */
export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, props);
  window.dataLayer?.push({ event, ...props });
  window.clarity?.("event", event);
}

/** Record a page view (for SPA route changes). No-op until configured. */
export function pageview(url: string): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "page_view", { page_path: url });
  window.dataLayer?.push({ event: "page_view", page_path: url });
}
