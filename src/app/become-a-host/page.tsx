import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Camera,
  HandCoins,
  ArrowRight,
} from "lucide-react";
import { getSiteData } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/home/Reveal";

const DESCRIPTION =
  "Own a plantation stay in Chikmagalur? Hosting on Stayze is opening soon — real guests, fair terms and a team that visits in person. Register your interest on WhatsApp.";

export const metadata: Metadata = {
  title: "Become a Host",
  description: DESCRIPTION,
  alternates: { canonical: "/become-a-host" },
  openGraph: {
    type: "website",
    url: "/become-a-host",
    title: "Become a Host · Stayze",
    description: DESCRIPTION,
  },
};

const BENEFITS = [
  {
    icon: Users,
    title: "Real, right-fit guests",
    text: "Travellers who chose your estate for what it is — not the cheapest room in town. Fewer, better bookings.",
  },
  {
    icon: ShieldCheck,
    title: "Fair, transparent terms",
    text: "Clear pricing, no race to the bottom, and no payment held hostage by a platform. You set the rate.",
  },
  {
    icon: Camera,
    title: "We do the hard part",
    text: "We visit, photograph your place properly, write it up honestly, and handle the enquiries for you.",
  },
  {
    icon: HandCoins,
    title: "You stay in control",
    text: "Your home, your house rules, your calendar. We introduce the guest; the welcome is yours.",
  },
];

export default async function BecomeAHostPage() {
  const { settings } = await getSiteData();
  const wa = whatsappLink(
    settings?.whatsappNumber ?? null,
    "Hi Stayze! I own a property in Chikmagalur and I'd like to register interest in hosting when you open.",
  );

  return (
    <>
      <PageHero
        eyebrow="For hosts · Coming soon"
        title="Hosting on Stayze is opening soon"
        intro="We’re a small team that lists only the plantation stays we’ve visited in person. We’re getting ready to welcome a handful of new hosts — and we’d love yours to be one of them."
      >
        <div className="flex flex-wrap items-center gap-3">
          {wa && (
            <Button asChild size="lg">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-4" />
                Register your interest
              </a>
            </Button>
          )}
          <Badge tone="gold">Early access · By invitation first</Badge>
        </div>
      </PageHero>

      {/* Benefits */}
      <div className="container-page section">
        <SectionHeading
          as="h2"
          eyebrow="Why host with Stayze"
          title="Built for estates, not inventory"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {BENEFITS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delayMs={Math.min(i, 3) * 60}>
              <div className="card-surface flex h-full gap-4 p-6">
                <span className="bg-paper-2 text-mist inline-flex size-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-bark font-serif text-lg">{title}</h3>
                  <p className="text-muted-ink mt-1.5 text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* How joining will work */}
      <div className="bg-paper-2/40 border-border border-y">
        <div className="container-page section">
          <SectionHeading
            as="h2"
            eyebrow="When we open"
            title="How joining will work"
          />
          <p className="text-muted-ink mt-3 max-w-2xl text-sm">
            Simple and unhurried — the way it should be. Here’s the shape of it.
          </p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Say hello",
                d: "Register your interest and tell us a little about your place. No forms, just a message.",
              },
              {
                n: "02",
                t: "We visit",
                d: "We come and see it in person, photograph it properly and agree a fair rate with you.",
              },
              {
                n: "03",
                t: "You go live",
                d: "We publish your honest listing and start sending you the right guests.",
              },
            ].map((s) => (
              <li key={s.n} className="card-surface p-6">
                <span className="num text-clay text-sm font-semibold">
                  {s.n}
                </span>
                <h3 className="text-bark mt-2 font-serif text-lg">{s.t}</h3>
                <p className="text-muted-ink mt-1.5 text-sm leading-relaxed">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* CTA */}
      <div className="container-page section">
        <section className="bg-bark text-paper rounded-lg p-8 text-center sm:p-12">
          <h2 className="heading-1 text-paper text-balance">
            Be first in line
          </h2>
          <p className="text-paper/80 mx-auto mt-4 max-w-xl text-base leading-relaxed">
            We’re onboarding new hosts by invitation to begin with. Send us a
            message now and we’ll come to you the moment we open.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {wa && (
              <Button asChild size="lg" variant="secondary">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-4" />
                  Register your interest
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-paper border-paper/30 hover:bg-paper/10"
            >
              <Link href="/contact">
                Contact us
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
