import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { GuideCard } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";

/**
 * GuideListHero — the welcoming top of the Travel Guide listing.
 *
 * The invitation on the left, and a single large *featured* guide on the right
 * (the most recently published), shown big so it reads as a lead story rather
 * than another grid tile. The whole tile links through. Stacks to one column on
 * a phone, image first.
 */
export function GuideListHero({
  count,
  featured,
}: {
  count: number;
  featured: GuideCard | null;
}) {
  return (
    <section className="bg-paper-2/50 border-border border-b">
      <div className="container-page grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="eyebrow text-clay">Travel guide · Chikmagalur</p>
          <h1 className="display text-bark mt-3 text-balance">
            Chikmagalur, from someone who lives here
          </h1>
          <p className="text-muted-ink mt-4 max-w-md text-base leading-relaxed">
            Where the waterfalls are worth the jeep, which café does the flat
            white right, how to plan a weekend that isn’t a checklist. Honest,
            local, and written to be used — not to rank.
          </p>
          {count > 0 && (
            <p className="text-muted-ink mt-6 text-sm">
              <span className="num text-bark font-medium">{count}</span> guides
              to read before you come
            </p>
          )}
        </div>

        {featured && (
          <Link
            href={`/travel-guide/${featured.slug}`}
            className="group card-surface focus-visible:ring-ring focus-visible:ring-offset-paper hover:shadow-float order-1 overflow-hidden transition-[transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 lg:order-2"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Thumbnail
                src={featured.coverImageUrl}
                alt={featured.title}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="from-bark/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="text-paper/85 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="eyebrow text-gold">
                    {featured.category.name}
                  </span>
                  {featured.readTimeMinutes !== null && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      <span className="num">
                        {featured.readTimeMinutes}
                      </span>{" "}
                      min read
                    </span>
                  )}
                </div>
                <h2 className="heading-2 text-paper mt-1.5">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-paper/85 mt-1.5 line-clamp-2 max-w-lg text-sm">
                    {featured.excerpt}
                  </p>
                )}
                <span className="text-paper mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                  Read the guide
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
