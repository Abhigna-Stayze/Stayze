import { AlertCircle } from "lucide-react";
import type { BookingView } from "@/services/types";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { statusMeta, trackerStep, TRIP_MILESTONES } from "@/lib/trip-status";

/**
 * The trip's progress — Requested → Confirmed → Your stay → Completed.
 *
 * Reuses `BookingSteps` (the same numbered tracker the booking flow used), fed
 * a step computed from the booking's *status*, not guessed from dates. A
 * cancelled booking has no "current step", so it shows a plain banner instead
 * of a misleading progress bar.
 *
 * The status headline sits above the bar so the state is legible in a sentence,
 * not only as a highlighted pill.
 */
export function TripStatusTracker({ booking }: { booking: BookingView }) {
  const meta = statusMeta(booking.status);

  if (booking.status === "CANCELLED") {
    return (
      <section
        aria-label="Booking status"
        className="border-error/30 bg-error/5 flex items-start gap-3 rounded-lg border p-5"
      >
        <AlertCircle
          className="text-error mt-0.5 size-5 shrink-0"
          aria-hidden
        />
        <div>
          <h2 className="text-bark text-base font-semibold">{meta.headline}</h2>
          <p className="text-muted-ink mt-1 text-sm">{meta.detail}</p>
        </div>
      </section>
    );
  }

  const current = trackerStep(
    booking.status,
    booking.checkIn,
    booking.checkOut,
  );

  return (
    <section aria-label="Booking status">
      <div className="mb-4">
        <h2 className="heading-3 text-bark">{meta.headline}</h2>
        <p className="text-muted-ink mt-1 text-sm">{meta.detail}</p>
      </div>
      <BookingSteps
        steps={[...TRIP_MILESTONES]}
        current={current}
        className="card-surface overflow-hidden"
      />
    </section>
  );
}
