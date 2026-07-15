import "server-only";
import { cache } from "react";
import { getSiteSettings, getTags } from "@/services/site.service";
import type { SiteSettings } from "@/services/types";

/**
 * The shell's single data source — the same data `GET /api/site` returns.
 *
 * The shell (header, footer, floating help) reads its content from here, so the
 * WhatsApp number, support contacts and social links are NEVER hardcoded. It
 * calls the site service directly, which is the exact code path the `/api/site`
 * route runs — FRONTEND.md sanctions a Server Component calling a service.
 *
 * Why the service and not `fetch("/api/site")`: the shell lives in the root
 * layout, so every page inherits it. A self-`fetch` would need `headers()` to
 * build an absolute URL, which forces every page into dynamic rendering — a
 * real performance cost to fetch settings that barely change. A direct service
 * call stays static-friendly. No component imports Prisma or Supabase; they
 * import this.
 *
 * `cache()` dedupes within a render, so the layout and footer share one query.
 */
export type SiteData = {
  settings: SiteSettings | null;
  tags: Array<{ id: string; name: string; slug: string; type: string }>;
};

export const getSiteData = cache(async (): Promise<SiteData> => {
  const [settings, tags] = await Promise.all([getSiteSettings(), getTags()]);
  return { settings, tags };
});
