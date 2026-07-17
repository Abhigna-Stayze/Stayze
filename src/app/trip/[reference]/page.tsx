import type { Metadata } from "next";
import { getTrip } from "@/lib/trip";
import { getStayDetail } from "@/lib/stay";
import { getSiteData } from "@/lib/site";
import { canReview } from "@/lib/trip-status";
import { TripHeader } from "@/components/trip/TripHeader";
import { TripStatusTracker } from "@/components/trip/TripStatusTracker";
import { TripDetails } from "@/components/trip/TripDetails";
import { TripDirections } from "@/components/trip/TripDirections";
import { TripCaretaker } from "@/components/trip/TripCaretaker";
import { TripChecklist } from "@/components/trip/TripChecklist";
import { TripWeather } from "@/components/trip/TripWeather";
import { ReviewInvite } from "@/components/trip/ReviewInvite";
import { NeedHelp } from "@/components/trip/NeedHelp";
import { TripNotFound } from "@/components/trip/TripNotFound";

type Params = Promise<{ reference: string }>;

/**
 * A trip page carries a named booking — keep it out of the index entirely.
 * `follow: false` too: a search bot shouldn't crawl outward from a private URL.
 */
export const metadata: Metadata = {
  title: "Your trip",
  robots: { index: false, follow: false },
};

/**
 * `/trip/[reference]` — the guest's trip dashboard, reached by code, not login.
 *
 * A Server Component. The booking is read through `getTrip` (server-only helper
 * → service layer, never a self-fetch); the stay's full detail and the site
 * contacts come the same way. `cache()` inside the helpers means a repeat read
 * is free.
 *
 * A missing or unknown reference renders the in-page "not found" state rather
 * than a hard 404, so a mistyped character is a quick fix, not a dead end — and
 * the page never reveals *why* a code didn't match, since references are
 * semi-secret.
 *
 * The caretaker's private number is gated in the service (null until CONFIRMED),
 * so this page renders what it is given and cannot leak it.
 */
export default async function TripPage({ params }: { params: Params }) {
  const { reference } = await params;
  const booking = await getTrip(reference);

  if (!booking) {
    return <TripNotFound reference={reference.toUpperCase()} />;
  }

  const [detail, site] = await Promise.all([
    getStayDetail(booking.stay.slug),
    getSiteData(),
  ]);

  return (
    <div className="container-page py-8">
      <div className="animate-fade-up mx-auto flex max-w-3xl flex-col gap-10">
        <TripHeader booking={booking} />

        <TripStatusTracker booking={booking} />

        {canReview(booking.status) && (
          <ReviewInvite
            booking={booking}
            whatsappNumber={site.settings?.whatsappNumber ?? null}
          />
        )}

        <TripDetails booking={booking} />

        {detail && (
          <TripDirections
            stayName={booking.stay.name}
            area={booking.stay.area}
            addressLine={detail.addressLine}
            latitude={detail.latitude}
            longitude={detail.longitude}
          />
        )}

        <TripCaretaker booking={booking} />

        {detail && (
          <TripChecklist
            checkInTime={detail.checkInTime}
            checkOutTime={detail.checkOutTime}
          />
        )}

        <TripWeather area={booking.stay.area} checkIn={booking.checkIn} />

        <NeedHelp settings={site.settings} reference={booking.reference} />
      </div>
    </div>
  );
}
