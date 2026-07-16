import { ArrowUpRight, Car } from "lucide-react";
import type { StayDetail } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Thumbnail } from "@/components/shared/Thumbnail";

/**
 * Explore nearby — what is around the estate.
 *
 * Each place shows its distance and drive time (both mono) and, where the data
 * has one, an "Open in Maps" link. The exact address of the stay itself is
 * never shown before booking; these are public landmarks, which is a different
 * thing.
 */
export function NearbyPlaces({ stay }: { stay: StayDetail }) {
  if (stay.nearbyPlaces.length === 0) return null;

  return (
    <section aria-labelledby="nearby-heading">
      <SectionHeading
        id="nearby-heading"
        title="Explore nearby"
        subtitle="Waterfalls, peaks and places worth the drive"
      />
      <ul className="mt-5 grid list-none grid-cols-1 gap-4 sm:grid-cols-2">
        {stay.nearbyPlaces.map((place) => (
          <li key={place.id} className="card-surface flex gap-4 p-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md">
              <Thumbnail src={place.imageUrl} alt={place.name} sizes="80px" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-bark font-serif text-base">{place.name}</h3>
              {place.description && (
                <p className="text-muted-ink mt-0.5 line-clamp-2 text-sm">
                  {place.description}
                </p>
              )}
              <div className="text-muted-ink mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {place.distanceKm !== null && (
                  <span>
                    <span className="num">{place.distanceKm}</span> km
                  </span>
                )}
                {place.driveTimeMinutes !== null && (
                  <span className="inline-flex items-center gap-1">
                    <Car className="size-3.5" aria-hidden />
                    <span className="num">{place.driveTimeMinutes}</span> min
                  </span>
                )}
                {place.mapsUrl && (
                  <a
                    href={place.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-clay focus-visible:ring-ring focus-visible:ring-offset-paper inline-flex items-center gap-0.5 font-medium focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    Open in Maps
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
