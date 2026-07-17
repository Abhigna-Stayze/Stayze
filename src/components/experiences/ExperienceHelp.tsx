import { Mail, Phone } from "lucide-react";
import type { SiteSettings } from "@/services/types";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * ExperienceHelp — quick ways to reach a human about an experience.
 *
 * Contacts come from `SiteSetting` via the site service, never hardcoded, and
 * each action renders only if that detail exists. The WhatsApp message is
 * prefilled with the experience title so we know what they're asking about
 * before they've typed a word.
 */
export function ExperienceHelp({
  settings,
  title,
}: {
  settings: SiteSettings | null;
  title: string;
}) {
  if (!settings) return null;

  const wa = whatsappLink(
    settings.whatsappNumber,
    `Hi Stayze! I'd love to know more about the "${title}" experience.`,
  );

  return (
    <section
      aria-labelledby="exp-help-heading"
      className="bg-bark text-paper rounded-lg p-6 sm:p-8"
    >
      <h2 id="exp-help-heading" className="heading-3 text-paper">
        Want to build a trip around this?
      </h2>
      <p className="text-paper/80 mt-1.5 max-w-lg text-sm leading-relaxed">
        Tell us when you’re coming and who’s with you. We’ll match the
        experience to the right stay and sort the timing.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {wa && (
          <Button asChild variant="secondary">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon className="size-4" />
              WhatsApp us
            </a>
          </Button>
        )}
        {settings.supportPhone && (
          <Button
            asChild
            variant="outline"
            className="text-paper border-paper/30 hover:bg-paper/10"
          >
            <a href={`tel:${settings.supportPhone.replace(/\s+/g, "")}`}>
              <Phone className="size-4" aria-hidden />
              Call
            </a>
          </Button>
        )}
        {settings.supportEmail && (
          <Button
            asChild
            variant="outline"
            className="text-paper border-paper/30 hover:bg-paper/10"
          >
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
