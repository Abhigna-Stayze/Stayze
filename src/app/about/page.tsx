import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  HandHeart,
  Eye,
  MessageCircle,
  Search,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/PageHero";
import { CtaBand } from "@/components/marketing/CtaBand";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Reveal } from "@/components/home/Reveal";

const DESCRIPTION =
  "Stayze is a small local team in Chikmagalur that personally visits and vets every plantation stay we list — so what you see is what you get. This is our story.";

export const metadata: Metadata = {
  title: "About Stayze",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: "About Stayze",
    description: DESCRIPTION,
  },
};

const VALUES = [
  {
    icon: Eye,
    title: "We’ve been there",
    text: "Every stay on Stayze is one we’ve visited and slept in. If we haven’t seen it, it isn’t here.",
  },
  {
    icon: ShieldCheck,
    title: "Honest over glossy",
    text: "We’d rather tell you the road is rough than sell you a photo that lies. The write-ups are plain on purpose.",
  },
  {
    icon: MapPin,
    title: "Local, not a call centre",
    text: "We live in these hills. The person who answers your WhatsApp has stood on that verandah.",
  },
  {
    icon: HandHeart,
    title: "Good for hosts too",
    text: "The families who own these estates are the point. Fair terms and real guests, not a race to the bottom.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Browse verified stays",
    text: "Every listing is inspected and priced plainly — no surprises at checkout.",
  },
  {
    icon: MessageCircle,
    title: "Enquire on WhatsApp",
    text: "Tell us your dates and who’s coming. A real person replies, usually within a few hours.",
  },
  {
    icon: BadgeCheck,
    title: "We confirm with the host",
    text: "We sort the details directly with the estate and send back everything you need.",
  },
  {
    icon: Sparkles,
    title: "Just turn up",
    text: "Your trip page has directions, your caretaker and the little things worth knowing.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Stayze"
        title="We stayed first, so you can book with your eyes closed"
        intro="Stayze is a small team in Chikmagalur. We find the plantation stays worth travelling for, visit every one in person, and only list the ones we'd send a friend to."
      >
        <Button asChild size="lg">
          <Link href="/explore">Explore stays</Link>
        </Button>
      </PageHero>

      {/* The story */}
      <div className="container-page section">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <SectionHeading
              as="h2"
              eyebrow="Our story"
              title="It started with a booking that lied"
            />
            <div className="text-bark/90 max-w-2xl space-y-4 text-lg leading-relaxed">
              <p>
                A wide-angle photo, a five-star average, and a cottage that
                turned out to back onto a car park. Anyone who has booked a
                holiday online knows the feeling — the gap between the listing
                and the place.
              </p>
              <p>
                Chikmagalur is full of extraordinary places to stay: coffee
                estates that have been in the same family for a century,
                bungalows wrapped in mist, cottages where the loudest thing is
                the rain. But they’re hard to find, harder to trust, and usually
                a phone number passed around by word of mouth.
              </p>
              <p>
                So we made a rule for ourselves: we only list a stay after we’ve
                slept in it. We photograph it as it is, price it plainly, and
                write it up the way we’d describe it to a friend — the good, and
                the bit about the road. That’s the whole company.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Mission & vision */}
      <div className="bg-paper-2/40 border-border border-y">
        <div className="container-page section">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card-surface p-7">
                <p className="eyebrow text-clay">Our mission</p>
                <p className="text-bark mt-3 font-serif text-2xl leading-snug">
                  To make booking a plantation stay feel as certain as staying
                  with someone you trust.
                </p>
              </div>
              <div className="card-surface p-7">
                <p className="eyebrow text-clay">Our vision</p>
                <p className="text-bark mt-3 font-serif text-2xl leading-snug">
                  A Chikmagalur where the best estates thrive by being
                  themselves — and travellers arrive knowing exactly what
                  they’ll find.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Values */}
      <div className="container-page section">
        <SectionHeading
          as="h2"
          eyebrow="What we stand for"
          title="Our values"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
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

      {/* How it works */}
      <div className="bg-paper-2/40 border-border border-y">
        <div className="container-page section">
          <SectionHeading
            as="h2"
            eyebrow="How Stayze works"
            title="Four steps, one of them is a holiday"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delayMs={Math.min(i, 4) * 60}>
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-3">
                    <span className="bg-bark text-paper inline-flex size-9 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="num text-bark/40 text-sm font-semibold">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-bark mt-4 font-serif text-lg">{title}</h3>
                  <p className="text-muted-ink mt-1.5 text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="container-page section">
        <CtaBand
          title="Come and see for yourself"
          copy="Browse the stays we’ve personally visited, or message us and we’ll help you plan the trip."
          primaryHref="/explore"
          primaryLabel="Explore stays"
          secondaryHref="/contact"
          secondaryLabel="Talk to us"
        />
      </div>
    </>
  );
}
