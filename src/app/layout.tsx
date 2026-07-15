import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  // The shell's one data read — the same content GET /api/site returns.
  // Fetched once here and shared with the footer and the floating help button,
  // so the WhatsApp number and contacts are never hardcoded.
  const site = await getSiteData();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        {/* Every page renders inside this main; the shell wraps it. */}
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer data={site} />
      </body>
    </html>
  );
}
