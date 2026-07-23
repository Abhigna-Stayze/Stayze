import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getSettingsForAdmin } from "@/services/admin-settings.service";
import type { SettingsFormValues } from "@/lib/settings-form";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

function fmt(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Site settings — a Server Component that reads the single config row and hands
 * it to the client form.
 *
 * Deliberately small: `SiteSetting` has four editable columns. Brand, hero,
 * footer, SEO defaults, currency and the other social networks each need a new
 * column, and this phase adds none — so rather than pretend, the page says
 * where those values actually live today.
 */
export default async function AdminSettingsPage() {
  const settings = await getSettingsForAdmin();

  const defaultValues: SettingsFormValues = {
    whatsappNumber: settings.whatsappNumber,
    supportPhone: settings.supportPhone ?? "",
    supportEmail: settings.supportEmail ?? "",
    instagramUrl: settings.instagramUrl ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="heading-1 text-bark">Settings</h1>
        <p className="text-muted-ink mt-1.5">
          The site-wide configuration the public pages read.
          {settings.updatedAt && (
            <>
              {" "}
              Last updated{" "}
              <span className="num">{fmt(settings.updatedAt)}</span>.
            </>
          )}
        </p>
      </header>

      {!settings.exists && (
        <div
          role="status"
          className="border-gold/50 bg-gold/12 text-bark mt-6 flex items-start gap-2 rounded-md border px-4 py-3 text-sm"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          No settings row exists yet. Saving this form creates it — the WhatsApp
          number is required before the booking flow will work.
        </div>
      )}

      <div className="mt-6">
        <SettingsForm defaultValues={defaultValues} />
      </div>

      <section className="card-surface mt-6 p-5 sm:p-6">
        <h2 className="heading-3 text-bark">Managed in code, not here</h2>
        <p className="text-muted-ink mt-1 text-sm">
          These aren’t editable because Schema v1.1 has no column for them.
          Adding any of them is a schema change plus a migration.
        </p>
        <ul className="text-muted-ink mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <li>
            <span className="text-bark font-medium">Brand</span> — site name,
            tagline, logo, favicon: <code>src/components/layout/Logo.tsx</code>,{" "}
            <code>src/app/icon.svg</code>
          </li>
          <li>
            <span className="text-bark font-medium">Navigation & footer</span> —
            links and copy: <code>src/lib/nav.ts</code>
          </li>
          <li>
            <span className="text-bark font-medium">Hero & homepage</span> —
            title, subtitle, CTA: <code>src/lib/home.ts</code>
          </li>
          <li>
            <span className="text-bark font-medium">Default SEO</span> — meta
            title/description, OG image: <code>src/lib/seo.ts</code>
          </li>
          <li>
            <span className="text-bark font-medium">Legal</span> — privacy and
            terms copy: <code>src/lib/legal-content.ts</code>
          </li>
          <li>
            <span className="text-bark font-medium">
              Other socials, address, currency, time zone
            </span>{" "}
            — no column exists yet
          </li>
        </ul>
      </section>
    </div>
  );
}
