import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { getSiteData } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { PageHero } from "@/components/marketing/PageHero";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Faq } from "@/components/marketing/Faq";
import { Reveal } from "@/components/home/Reveal";

const DESCRIPTION =
  "Talk to Stayze — a real, local team in Chikmagalur. Reach us on WhatsApp, by email or by phone, or send a message and we'll help you plan your stay.";

export const metadata: Metadata = {
  title: "Contact Stayze",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact Stayze",
    description: DESCRIPTION,
  },
};

const FAQ_ITEMS = [
  {
    question: "How do I book a stay?",
    answer:
      "Find a stay you like, pick your dates, and send the request — it reaches us on WhatsApp. A real person replies, usually within a few hours, and confirms with the host.",
  },
  {
    question: "Do I pay through Stayze?",
    answer:
      "No. Stayze doesn’t take payment. Any deposit or balance is arranged directly with your host, on the terms they set — we just make the introduction and sort the details.",
  },
  {
    question: "How quickly will you reply?",
    answer:
      "Usually within a few hours between 8am and 10pm. If you message late at night, you’ll hear from us first thing.",
  },
  {
    question: "Can I change or cancel my dates?",
    answer:
      "Yes — just message us on the same thread. Each stay has its own cancellation policy, which we’ll have shared before you book, and we’ll handle the change with the host.",
  },
  {
    question: "Do you have an office I can visit?",
    answer:
      "We’re a small team out in the estates rather than a shopfront, so WhatsApp, email or a call is the fastest way to reach us.",
  },
];

export default async function ContactPage() {
  const { settings } = await getSiteData();
  const wa = whatsappLink(
    settings?.whatsappNumber ?? null,
    "Hi Stayze! I'd like some help planning a stay.",
  );

  const methods = [
    wa && {
      icon: WhatsappIcon,
      label: "WhatsApp",
      value: "Chat with us",
      href: wa,
      external: true,
      note: "The fastest way to reach us",
    },
    settings?.supportEmail && {
      icon: Mail,
      label: "Email",
      value: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
      external: false,
      note: null,
    },
    settings?.supportPhone && {
      icon: Phone,
      label: "Phone",
      value: settings.supportPhone,
      href: `tel:${settings.supportPhone.replace(/\s+/g, "")}`,
      external: false,
      note: null,
      mono: true,
    },
  ].filter(Boolean) as Array<{
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
    external: boolean;
    note: string | null;
    mono?: boolean;
  }>;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a real, local team"
        intro="Planning a trip, mid-booking, or just have a question? We’re a small team in Chikmagalur and we answer our own messages."
      />

      <div className="container-page section">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Ways to reach us */}
          <div>
            <h2 className="heading-3 text-bark">Ways to reach us</h2>
            <div className="mt-5 flex flex-col gap-3">
              {methods.map((m) => (
                <a
                  key={m.label}
                  href={m.href}
                  {...(m.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="card-surface hover:shadow-float focus-visible:ring-ring group flex items-center gap-4 p-4 transition-shadow focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="bg-paper-2 text-clay inline-flex size-10 shrink-0 items-center justify-center rounded-full">
                    <m.icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="text-muted-ink block text-xs">
                      {m.label}
                    </span>
                    <span
                      className={`text-bark group-hover:text-clay block truncate font-medium transition-colors ${
                        m.mono ? "num" : ""
                      }`}
                    >
                      {m.value}
                    </span>
                  </span>
                </a>
              ))}

              <div className="border-border/70 mt-2 flex flex-col gap-2 border-t pt-4 text-sm">
                <p className="text-muted-ink flex items-center gap-2">
                  <MapPin className="text-mist size-4" aria-hidden />
                  Chikmagalur, Karnataka · Western Ghats
                </p>
                <p className="text-muted-ink flex items-center gap-2">
                  <Clock className="text-mist size-4" aria-hidden />
                  We reply 8am–10pm, every day
                </p>
              </div>
            </div>
          </div>

          {/* Message form */}
          <div>
            <h2 className="heading-3 text-bark">Send us a message</h2>
            <p className="text-muted-ink mt-1.5 text-sm">
              We’ll pick it up on WhatsApp or by email — whichever you choose.
            </p>
            <div className="mt-5">
              <ContactForm
                whatsappNumber={settings?.whatsappNumber ?? null}
                supportEmail={settings?.supportEmail ?? null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-paper-2/40 border-border border-y">
        <div className="container-page section">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Faq
                id="contact-faq"
                eyebrow="Good to know"
                title="Frequently asked"
                items={FAQ_ITEMS}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
