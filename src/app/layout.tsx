import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/analytics/Analytics";
import { getSiteData } from "@/lib/site";

/**
 * The three brand faces of the plantation ledger. Loaded once here and exposed
 * as CSS variables, so every page and component inherits them without importing
 * a font again.
 *
 *   Fraunces      → headings and display        (--font-serif)
 *   Inter         → body and UI                  (--font-sans)
 *   JetBrains Mono → EVERY number                (--font-mono)
 *
 * The mono rule is a brand rule, not a preference: prices, ratings, FitScores,
 * distances, dates and guest counts all render in JetBrains Mono. See the `.num`
 * utility in globals.css.
 */

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // Fraunces is a variable font; its optical size wants to open up on heroes.
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative canonical/OG URLs (e.g. "/") to absolute ones.
  metadataBase: new URL("https://stayze.in"),
  title: {
    default: "Stayze — Plantation stays in Chikmagalur",
    template: "%s · Stayze",
  },
  description:
    "Handpicked, personally inspected plantation stays in Chikmagalur and the Western Ghats.",
  applicationName: "Stayze",
  // Default Open Graph / Twitter — pages override title, description, url and
  // images; these fill the shared fields so every page shares one social card
  // shape, and any page that forgets an image still gets a real one.
  openGraph: {
    type: "website",
    siteName: "Stayze",
    locale: "en_IN",
    images: [
      { url: "/hero/hero-poster.jpg", alt: "Plantation stays in Chikmagalur" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hero/hero-poster.jpg"],
  },
};

// The shell reads live site settings from the database on every page (footer
// contacts, the WhatsApp number). That must happen at request time, not build
// time: rendering it statically would bake stale contacts into the HTML and
// force `next build` to open a database connection — which it must never do
// (CI builds with placeholder credentials). Rendering dynamically keeps the
// build DB-free and always serves current data.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The admin CMS has its own chrome (sidebar + top bar), so it must NOT inherit
  // the public marketing Header/Footer. Middleware sets `x-pathname`; when it's
  // an /admin route we render a bare shell and skip the site-settings read
  // entirely. Everything else gets the full public shell.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {isAdmin ? children : <PublicShell>{children}</PublicShell>}
        <Analytics />
      </body>
    </html>
  );
}

/**
 * The public marketing chrome: skip link, sticky Header, the page `<main>`, and
 * the Footer with live site contacts. Kept out of the admin routes.
 */
async function PublicShell({ children }: { children: React.ReactNode }) {
  // The shell's one data read — the same content GET /api/site returns. Shared
  // with the footer and floating help so contacts are never hardcoded.
  const site = await getSiteData();

  return (
    <>
      {/* Keyboard/screen-reader users can jump the nav straight to content. */}
      <a
        href="#main-content"
        className="bg-clay text-primary-foreground focus-visible:ring-ring sr-only z-[100] rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer data={site} />
    </>
  );
}
