"use client";

import { usePathname } from "next/navigation";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * The floating "Need Help?" button — WhatsApp, one tap away, on every page.
 *
 * Client Component for one reason: it hides itself on the booking flow. The
 * booking screens are a conversion funnel, and the design is explicit that we
 * do not offer an exit at the moment of conversion — so no floating help on
 * /book/*. Everywhere else it is fixed bottom-right.
 *
 * The number comes from the API (never hardcoded). If there is none, the button
 * does not render rather than linking nowhere.
 */
export function FloatingHelpButton({
  whatsappNumber,
}: {
  whatsappNumber: string | null;
}) {
  const pathname = usePathname();

  // Hidden on the booking conversion flow, per the design.
  if (pathname.startsWith("/book")) return null;

  const href = whatsappLink(
    whatsappNumber,
    "Hi Stayze! I have a question about a stay.",
  );
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Need help? Chat with us on WhatsApp"
      className="bg-clay text-primary-foreground shadow-float focus-visible:ring-ring focus-visible:ring-offset-paper fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
    >
      <WhatsappIcon className="size-5" />
      <span className="hidden sm:inline">Need Help?</span>
    </a>
  );
}
