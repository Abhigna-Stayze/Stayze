import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingHelpButton } from "@/components/layout/FloatingHelpButton";
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
  title: {
    default: "Stayze — Plantation stays in Chikmagalur",
    template: "%s · Stayze",
  },
  description:
    "Handpicked, personally inspected plantation stays in Chikmagalur and the Western Ghats.",
};

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
        <FloatingHelpButton
          whatsappNumber={site.settings?.whatsappNumber ?? null}
        />
      </body>
    </html>
  );
}
