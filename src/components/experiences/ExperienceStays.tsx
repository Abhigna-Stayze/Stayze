import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StayCard as StayCardData } from "@/services/types";
import { StayCard } from "@/components/cards/StayCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Button } from "@/components/ui/button";

/**
 * ExperienceStays — where you can stay to actually do this.
 *
 * This is the whole reason an experience earns a URL: the same thing may be
 * offered at several stays, and the point of the page is to move a dreaming
 * visitor toward booking one. Real stay data, reusing `StayCard` unchanged. If
 * nothing is linked yet, it points to Explore rather than leaving a dead end.
 */
export function ExperienceStays({
  stays,
  title,
}: {
  stays: StayCardData[];
  title: string;
}) {
  return (
    <section aria-labelledby="stays-heading">
      <SectionHeading
        id="stays-heading"
        eyebrow="Stay nearby"
        title="Where to do this"
        subtitle={`Book a stay that offers “${title}”`}
        action={
          <Button asChild variant="link" size="sm">
            <Link href="/explore">
              All stays
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      {stays.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stays.map((stay, i) => (
            <StayCard key={stay.id} stay={stay} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="border-border bg-card/60 mt-6 rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-ink text-sm">
            We’re lining up stays that offer this experience. In the meantime,
            browse every verified plantation stay in Chikmagalur.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/explore">
              Explore stays
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
