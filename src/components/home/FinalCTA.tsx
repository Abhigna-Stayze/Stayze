import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Final CTA — one clear next step, on the ledger's dark ground.
 *
 * A bark panel, a Fraunces line, and a single clay button into Explore. Kept
 * deliberately clean: one idea, one action, per the brand's voice. Static and
 * presentational.
 */
export function FinalCTA() {
  return (
    <section className="bg-bark" aria-labelledby="cta-heading">
      <div className="container-page section flex flex-col items-center text-center">
        <p className="eyebrow text-gold">Your quiet is waiting</p>
        <h2
          id="cta-heading"
          className="heading-1 text-paper mt-3 max-w-2xl text-balance"
        >
          Find a stay in the hills, and let the noise fall away.
        </h2>
        <p className="text-paper/75 mt-4 max-w-xl text-lg leading-relaxed">
          A handful of verified plantation stays in Chikmagalur — pick your
          dates, and we’ll take it from there on WhatsApp.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/explore">
            Explore stays
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
