import { MapPin, Home } from "lucide-react";
import type { ExperienceDetail } from "@/services/types";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { themeLabel } from "@/lib/experience-themes";

/**
 * ExperienceHero — the immersive top of the detail page.
 *
 * The experience carries a single image, so this leads with it large rather
 * than faking a multi-photo gallery from data we don't have. Title, the derived
 * theme chips, and a quiet meta line (where you can do it, the region) sit over
 * a bark gradient tuned for legibility on any photo.
 */
export function ExperienceHero({
  experience,
  themes,
}: {
  experience: ExperienceDetail;
  themes: string[];
}) {
  const stayCount = experience.stays.length;

  return (
    <header className="card-surface overflow-hidden">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        <Thumbnail
          src={experience.imageUrl}
          alt={experience.title}
          sizes="(max-width: 1024px) 100vw, 1100px"
          priority
        />
        <div
          aria-hidden
          className="from-bark/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="eyebrow text-paper/85">Experience · Chikmagalur</p>
          <h1 className="display text-paper mt-2 max-w-3xl text-balance">
            {experience.title}
          </h1>
          <div className="text-paper/85 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              Chikmagalur, Karnataka
            </span>
            {stayCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Home className="size-4" aria-hidden />
                Offered at <span className="num">{stayCount}</span>{" "}
                {stayCount === 1 ? "stay" : "stays"}
              </span>
            )}
          </div>
          {themes.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {themes.map((value) => (
                <li
                  key={value}
                  className="bg-card/90 text-bark rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  {themeLabel(value)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
