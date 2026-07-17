import { Mail, Phone } from "lucide-react";
import type { SiteSettings } from "@/services/types";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Need help — the quick ways to reach a human.
 *
 * Every contact comes from `SiteSetting` (via the site service), never a
 * hardcoded number, and each action renders only if that detail exists. The
 * WhatsApp message is prefilled with the reference so we know which trip
 * they're asking about before they've typed a word.
 *
 * This is the page's own help block rather than the global floating button —
 * on a page all about one trip, the reference-aware WhatsApp link is more
 * useful in context than a generic pill.
 */
export function NeedHelp({
  settings,
  reference,
}: {
  settings: SiteSettings | null;
  reference: string;
}) {
  if (!settings) return null;

  const wa = whatsappLink(
    settings.whatsappNumber,
    `Hi Stayze! I have a question about my trip (${reference}).`,
  );

  return (
    <section
      aria-labelledby="help-heading"
      className="bg-paper-2/60 border-border rounded-lg border p-5"
    >
      <h2 id="help-heading" className="heading-3 text-bark">
        Need a hand?
      </h2>
      <p className="text-muted-ink mt-1 text-sm">
        We’re here 8am–10pm. Quote{" "}
        <span className="num text-bark">{reference}</span> and we’ll know
        exactly who you are.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {wa && (
          <Button asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon className="size-4" />
              WhatsApp us
            </a>
          </Button>
        )}
        {settings.supportPhone && (
          <Button asChild variant="outline">
            <a href={`tel:${settings.supportPhone.replace(/\s+/g, "")}`}>
              <Phone className="size-4" aria-hidden />
              Call
            </a>
          </Button>
        )}
        {settings.supportEmail && (
          <Button asChild variant="outline">
            <a href={`mailto:${settings.supportEmail}`}>
              <Mail className="size-4" aria-hidden />
              Email
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
