import { BedDouble, Users } from "lucide-react";
import type { StayDetail } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Thumbnail } from "@/components/shared/Thumbnail";

/**
 * Where you'll sleep — one card per room.
 *
 * Photo, name, bed type and how many it sleeps. Reuses `Thumbnail`, so a room
 * with no photo yet falls back to the roofline well instead of a hole.
 */
export function StayRooms({ stay }: { stay: StayDetail }) {
  if (stay.rooms.length === 0) return null;

  return (
    <section aria-labelledby="rooms-heading">
      <SectionHeading id="rooms-heading" title="Where you'll sleep" />
      <ul className="mt-5 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stay.rooms.map((room) => (
          <li key={room.id} className="card-surface overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Thumbnail
                src={room.imageUrl}
                alt={room.name}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-bark font-serif text-base">{room.name}</h3>
              {room.description && (
                <p className="text-muted-ink mt-1 text-sm">
                  {room.description}
                </p>
              )}
              <div className="text-muted-ink mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {room.bedType && (
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="size-3.5" aria-hidden />
                    {room.bedType}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" aria-hidden />
                  Sleeps <span className="num">{room.maxGuests}</span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
