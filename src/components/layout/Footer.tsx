import Link from "next/link";
import { Mail, Phone, Camera } from "lucide-react";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { FOOTER_NAV, TRUST_MARKS } from "@/lib/nav";
import { type SiteData } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * The global footer.
 *
 * All contact details come from the API (`data.settings`) — nothing is
 * hardcoded — and every one is optional: if the API returns no phone, no phone
 * row renders. The Explore column is built from real tags the API returns, so
 * even the discovery links are data, not a hand-kept list.
 *
 * A paper-2 trust strip sits above the dark bark ledger, matching the design.
 */
export function Footer({ data }: { data: SiteData }) {
  const { settings, tags } = data;
  const year = new Date().getFullYear();

  const wa = whatsappLink(
    settings?.whatsappNumber,
    "Hi Stayze! I'd like to know more.",
  );

  // The discovery column, from real filter tags. Falls back to just "All stays"
  // if the API returns none.
  const featuredTagSlugs = ["coffee-estate", "luxury", "family"];
  const exploreTags = featuredTagSlugs
    .map((slug) => tags.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <footer className="mt-auto">
      {/* Trust strip — the verification promise, carried site-wide. */}
      <div className="border-border bg-paper-2 border-y">
        <Container className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 text-center">
          {TRUST_MARKS.map((mark) => (
            <span key={mark} className="text-bark text-sm font-medium">
              <span aria-hidden className="text-mist">
                ✓
              </span>{" "}
              {mark}
            </span>
          ))}
        </Container>
      </div>

      {/* The ledger footer. */}
      <div className="bg-bark text-paper/80">
        <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + tagline */}
          <div className="max-w-xs">
            <Logo variant="reversed" />
            <p className="text-paper/60 mt-4 text-sm leading-relaxed">
              Handpicked, personally inspected plantation stays in Chikmagalur
              and the Western Ghats.
            </p>
          </div>

          {/* Explore — from API tags */}
          <FooterColumn heading="Explore">
            <FooterLink href="/explore">All stays</FooterLink>
            {exploreTags.map((tag) => (
              <FooterLink key={tag.id} href={`/explore?tag=${tag.slug}`}>
                {tag.name}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Structural route columns */}
          {FOOTER_NAV.map((col) => (
            <FooterColumn key={col.heading} heading={col.heading}>
              {col.items.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </FooterColumn>
          ))}
        </Container>

        {/* Contact + social — every field optional */}
        {settings && (
          <Container className="border-paper/15 flex flex-col gap-4 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper/80 hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark inline-flex items-center gap-2 transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <WhatsappIcon className="size-4" />
                  WhatsApp us
                </a>
              )}
              {settings.supportEmail && (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="text-paper/80 hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark inline-flex items-center gap-2 transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Mail className="size-4" aria-hidden />
                  {settings.supportEmail}
                </a>
              )}
              {settings.supportPhone && (
                <a
                  href={`tel:${settings.supportPhone.replace(/\s+/g, "")}`}
                  className="text-paper/80 hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark inline-flex items-center gap-2 font-mono transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Phone className="size-4" aria-hidden />
                  {settings.supportPhone}
                </a>
              )}
            </div>

            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stayze on Instagram"
                className="border-paper/20 text-paper/80 hover:border-gold hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark inline-flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Camera className="size-4" aria-hidden />
              </a>
            )}
          </Container>
        )}

        {/* Bottom bar */}
        <div className="border-paper/15 border-t">
          <Container className="text-paper/50 flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © <span className="num">{year}</span> Stayze · Made in Chikmagalur
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-paper/60 hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-paper/60 hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Terms
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="eyebrow text-gold">{heading}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-paper/70 hover:text-gold focus-visible:ring-gold focus-visible:ring-offset-bark text-sm transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {children}
      </Link>
    </li>
  );
}
