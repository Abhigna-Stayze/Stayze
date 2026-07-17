import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { TripLookupForm } from "@/components/trip/TripLookupForm";

/**
 * A booking reference is semi-secret, and this is a personal surface — keep the
 * whole of `/trip` out of the index.
 */
export const metadata: Metadata = {
  title: "Find your trip",
  robots: { index: false, follow: false },
};

/**
 * `/trip` — the way back in, without a login.
 *
 * A guest returns with the reference from their confirmation. This is a plain
 * Server Component; the only interactive part is the small `TripLookupForm`
 * client island, which validates the code's shape and routes to
 * `/trip/[reference]`.
 */
export default function TripLookupPage() {
  return (
    <div className="container-page section">
      <div className="mx-auto max-w-md">
        <span className="bg-mist/12 text-mist inline-flex size-12 items-center justify-center rounded-full">
          <Ticket className="size-6" aria-hidden />
        </span>
        <h1 className="heading-1 text-bark mt-6">Your trip</h1>
        <p className="text-muted-ink mt-2 text-sm leading-relaxed">
          There’s no login at Stayze. Enter your booking reference and we’ll
          pull up everything about your stay — dates, directions, your
          caretaker, and what to pack.
        </p>
        <div className="mt-8">
          <TripLookupForm autoFocus />
        </div>
      </div>
    </div>
  );
}
