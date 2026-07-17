import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ExperienceCard } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";

/**
 * ExperiencesHero — the inspiring top of the listing.
 *
 * A two-part band: the invitation on the left (eyebrow, Fraunces heading, a
 * short introduction and the count), and — when there is one — a single
 * *featured* experience on the right, shown large so it reads as a doorway
 * rather than another grid tile. The whole tile links through to that
 * experience. It stacks to one column on a phone, image first.
 *
 * Presentational: the featured experience and the count are handed in.
 */
export function ExperiencesHero({
  count,
  featured,
}: {
  count: number;
  featured: ExperienceCard | null;
}) {
  return (
    <section className="bg-paper-2/50 border-border border-b">
      <div className="container-page grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="eyebrow text-clay">Things to do · Chikmagalur</p>
          <h1 className="display text-bark mt-3 text-balance">
            The estate doesn’t end at the door
          </h1>
          <p className="text-muted-ink mt-4 max-w-md text-base leading-relaxed">
            Coffee picked at first light, a walk up the ridge, dinner cooked
            with your host. The things worth waking up for in Chikmagalur — each
            one a short step from a Stayze stay.
          </p>
          {count > 0 && (
            <p className="text-muted-ink mt-6 text-sm">
              <span className="num text-bark font-medium">{count}</span>{" "}
              experiences to plan around your stay
            </p>
          )}
        </div>

        {featured && (
          <Link
            href={`/experiences/${featured.slug}`}
            className="group card-surface focus-visible:ring-ring focus-visible:ring-offset-paper hover:shadow-float order-1 overflow-hidden transition-[transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 lg:order-2"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Thumbnail
                src={featured.imageUrl}
                alt={featured.title}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="from-bark/75 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="eyebrow text-paper/85 flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  Featured experience
                </p>
                <h2 className="heading-2 text-paper mt-1.5">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-paper/85 mt-1.5 line-clamp-2 max-w-lg text-sm">
                    {featured.excerpt}
                  </p>
                )}
                <span className="text-paper mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                  Explore it
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
