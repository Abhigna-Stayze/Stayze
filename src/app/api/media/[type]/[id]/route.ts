import { fail, notFound, ok, requireAdmin, route } from "@/lib/api";
import {
  deleteReviewImage,
  deleteStayImage,
  setExperienceImage,
  setGuideCover,
  setNearbyPlaceImage,
  setOwnerPhoto,
  setRoomImage,
} from "@/services/media.service";

type Params = { params: Promise<{ type: string; id: string }> };

/**
 * DELETE /api/media/[type]/[id]
 *
 *   stay-image/<id>         remove a gallery image
 *   review-image/<id>       remove a guest photo
 *   owner-photo/<id>        clear an owner's photo
 *   room-image/<id>         clear a room's image
 *   experience-image/<id>   clear an experience's image
 *   nearby-image/<id>       clear a nearby place's image
 *   guide-cover/<slug>      clear a guide's cover
 *
 * Deletes the ROW and the OBJECT together. This endpoint exists because nothing
 * else does that: Postgres cascades delete child rows and leaves the files in
 * the bucket forever.
 *
 * PROTECTED — requires `x-admin-key`.
 */
type Removed = { removed: true; type: string; id: string };

export async function DELETE(request: Request, { params }: Params) {
  return route<Removed>(async () => {
    requireAdmin(request);

    const { type, id } = await params;
    const done = () => ok<Removed>({ removed: true, type, id });

    switch (type) {
      // Collections: the row goes, and the object with it.
      case "stay-image":
        return (await deleteStayImage(id))
          ? done()
          : notFound("No such stay image.");

      case "review-image":
        return (await deleteReviewImage(id))
          ? done()
          : notFound("No such review image.");

      // Single-reference media: the row survives, its reference is cleared and
      // the object is deleted. Passing null is how the service spells "remove".
      case "owner-photo":
        await setOwnerPhoto(id, null);
        return done();

      case "room-image":
        await setRoomImage(id, null);
        return done();

      case "experience-image":
        await setExperienceImage(id, null);
        return done();

      case "nearby-image":
        await setNearbyPlaceImage(id, null);
        return done();

      case "guide-cover":
        await setGuideCover(id, null);
        return done();

      default:
        return fail(`Unknown media type "${type}".`, 404);
    }
  });
}
