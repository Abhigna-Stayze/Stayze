import Link from "next/link";
import type { ExperienceCard as ExperienceCardData } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { cn } from "@/lib/utils";

/**
 * ExperienceCard — one editorial experience in the grid.
 *
 * Experiences are **content, not products**: they exist to pull a guest toward
 * a stay, so the whole card links to the experience's own page. Photo on top,
 * title, and the excerpt as a quiet meta line. Takes the `ExperienceCard` DTO.
 */
export function ExperienceCard({
  experience,
  priority = false,
  className,
}: {
  experience: ExperienceCardData;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className={cn(
        "group card-surface focus-visible:ring-ring hover:shadow-float focus-visible:ring-offset-paper flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Thumbnail
          src={experience.imageUrl}
          alt={experience.title}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-bark group-hover:text-clay font-serif text-base transition-colors">
          {experience.title}
        </h3>
        {experience.excerpt && (
          <p className="text-muted-ink mt-1 line-clamp-2 text-sm">
            {experience.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
