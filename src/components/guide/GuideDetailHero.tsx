import { Clock, CalendarDays, PenLine } from "lucide-react";
import type { GuideDetail } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * GuideDetailHero — the large hero image and the article's masthead.
 *
 * Category eyebrow, the title as the page's `h1`, and a byline row — author,
 * read time, published date — each shown only when the guide carries it. The
 * gradient keeps the type legible over any cover photo.
 */
export function GuideDetailHero({ guide }: { guide: GuideDetail }) {
  return (
    <header className="card-surface overflow-hidden">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        <Thumbnail
          src={guide.coverImageUrl}
          alt={guide.title}
          sizes="(max-width: 1024px) 100vw, 1100px"
          priority
        />
        <div
          aria-hidden
          className="from-bark/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="eyebrow text-gold">{guide.category.name}</p>
          <h1 className="display text-paper mt-2 max-w-3xl text-balance">
            {guide.title}
          </h1>
          <div className="text-paper/85 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            {guide.author && (
              <span className="flex items-center gap-1.5">
                <PenLine className="size-4" aria-hidden />
                {guide.author}
              </span>
            )}
            {guide.readTimeMinutes !== null && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                <span className="num">{guide.readTimeMinutes}</span> min read
              </span>
            )}
            {guide.publishedAt && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                <time dateTime={new Date(guide.publishedAt).toISOString()}>
                  {formatDate(new Date(guide.publishedAt))}
                </time>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
