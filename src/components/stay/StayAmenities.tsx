import type { StayDetail } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { AmenityIcon } from "@/components/shared/AmenityIcon";

/**
 * What this place offers.
 *
 * Reuses `AmenityIcon`, which resolves a glyph from the amenity's name/icon
 * hint, so a new amenity gets a sensible symbol without a change here. A plain
 * responsive grid — the collection is small and honest; there is no
 * "show all 40" theatre.
 */
export function StayAmenities({ stay }: { stay: StayDetail }) {
  if (stay.amenities.length === 0) return null;

  return (
    <section aria-labelledby="amenities-heading">
      <SectionHeading id="amenities-heading" title="What this place offers" />
      <ul className="mt-5 grid list-none grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {stay.amenities.map((amenity) => (
          <li key={amenity.id} className="flex items-center gap-3">
            <AmenityIcon name={amenity.name} icon={amenity.icon} />
            <span className="text-bark text-sm">{amenity.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
