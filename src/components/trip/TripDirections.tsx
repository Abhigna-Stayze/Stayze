import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/sections/SectionHeading";

/**
 * Directions — where the estate actually is.
 *
 * Post-booking, the exact address is fair to show (it is hidden *before*
 * booking, not after). A static "Open in Google Maps" link, never an embedded
 * live map: the spec calls for a link, and an iframe would be weight and a
 * third-party cookie for no gain here.
 *
 * The map link prefers real coordinates and falls back to a name search, so it
 * points somewhere sensible even for a stay with no lat/long recorded yet.
 */
export function TripDirections({
  stayName,
  area,
  addressLine,
  latitude,
  longitude,
}: {
  stayName: string;
  area: string;
  addressLine: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const query =
    latitude !== null && longitude !== null
      ? `${latitude},${longitude}`
      : `${stayName}, ${area}, Chikmagalur, Karnataka`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section aria-labelledby="directions-heading">
      <SectionHeading id="directions-heading" title="Getting there" />
      <div className="card-surface mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MapPin className="text-mist mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="text-bark text-sm font-medium">{stayName}</p>
            <p className="text-muted-ink mt-0.5 text-sm">
              {addressLine ?? `${area}, Chikmagalur, Karnataka`}
            </p>
            <p className="text-muted-ink mt-1 text-xs">
              The last stretch can be a rough track — an SUV or a careful drive
              does it. We’ll share live directions on WhatsApp closer to the
              day.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="size-4" aria-hidden />
            Open in Google Maps
          </a>
        </Button>
      </div>
    </section>
  );
}
