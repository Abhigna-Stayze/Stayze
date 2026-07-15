import Link from "next/link";
import type { GuideCard as GuideCardData } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { cn } from "@/lib/utils";

/**
 * GuideCard — one travel-guide post in the grid.
 *
 * The travel guide is the SEO engine, so each card links to the full post.
 * Photo on top, category eyebrow, title, then a meta line — read time and the
 * excerpt — matching the mockup's "6 min read · …". Takes the `GuideCard` DTO.
 */
export function GuideCard({
  guide,
  priority = false,
  className,
}: {
  guide: GuideCardData;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/travel-guide/${guide.slug}`}
      className={cn(
        "group card-surface focus-visible:ring-ring hover:shadow-float focus-visible:ring-offset-paper flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Thumbnail
          src={guide.coverImageUrl}
          alt={guide.title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow text-gold">{guide.category.name}</p>
        <h3 className="heading-3 text-bark group-hover:text-clay mt-1.5 transition-colors">
          {guide.title}
        </h3>
        <p className="text-muted-ink mt-1.5 text-sm">
          {guide.readTimeMinutes !== null && (
            <span className="whitespace-nowrap">
              <span className="num">{guide.readTimeMinutes}</span> min read
            </span>
          )}
          {guide.readTimeMinutes !== null && guide.excerpt && " · "}
          {guide.excerpt}
        </p>
      </div>
    </Link>
  );
}
