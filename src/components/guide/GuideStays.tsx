import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StayCard as StayCardData } from "@/services/types";
import { StayCard } from "@/components/cards/StayCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Button } from "@/components/ui/button";

/**
 * GuideStays — the stays a guide recommends.
 *
 * Real featured-stay data from the guide, reusing `StayCard` unchanged. This is
 * where a guide turns a reader into a guest: having sold Chikmagalur, it points
 * at a verified place to sleep. The page renders it only when the guide
 * features stays.
 */
export function GuideStays({ stays }: { stays: StayCardData[] }) {
  return (
    <section aria-labelledby="guide-stays-heading">
      <SectionHeading
        id="guide-stays-heading"
        eyebrow="Where to stay"
        title="Stays for this trip"
        action={
          <Button asChild variant="link" size="sm">
            <Link href="/explore">
              All stays
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stays.map((stay, i) => (
          <StayCard key={stay.id} stay={stay} priority={i < 3} />
        ))}
      </div>
    </section>
  );
}
