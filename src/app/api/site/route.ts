import { notFound, ok, route } from "@/lib/api";
import {
  getAmenities,
  getSiteSettings,
  getTags,
} from "@/services/site.service";

/**
 * GET /api/site
 *
 * Everything a client needs to render its chrome in one call: the WhatsApp
 * booking number, support contacts, the Explore filter chips, and the master
 * amenity list. Bundled deliberately — three round trips for this would be
 * silly, and all of it is small and changes rarely.
 *
 * 404 if SiteSetting is missing, which would mean the database was never
 * seeded. Booking is impossible in that state, so failing loudly is right.
 */
export async function GET() {
  return route(async () => {
    const [settings, tags, amenities] = await Promise.all([
      getSiteSettings(),
      getTags(),
      getAmenities(),
    ]);

    if (!settings) {
      return notFound("Site settings are not configured.");
    }

    return ok({ settings, tags, amenities });
  });
}
