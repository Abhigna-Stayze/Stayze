/**
 * The booking lifecycle, as the guest experiences it.
 *
 * A pure module (no `server-only`, no data access), so both the Server
 * Component that renders the trip and any client control can read the same
 * mapping. It translates the raw `BookingStatus` into the two things the page
 * needs: a human label + tone for the status badge, and where the guest sits on
 * the four-milestone tracker.
 *
 * Nothing here *derives* status from dates — the database is the authority on
 * status. Dates only decide, within a CONFIRMED booking, whether the guest is
 * still waiting, currently staying, or just back.
 */

export type BookingStatus =
  "NEW" | "CONTACTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type BadgeTone = "neutral" | "mist" | "gold" | "error";

export type StatusMeta = {
  label: string;
  tone: BadgeTone;
  headline: string;
  detail: string;
};

const META: Record<BookingStatus, StatusMeta> = {
  NEW: {
    label: "Requested",
    tone: "gold",
    headline: "Your request is with us",
    detail:
      "We've got it and we'll reply on WhatsApp, usually within a few hours. Nothing is confirmed until we do.",
  },
  CONTACTED: {
    label: "In conversation",
    tone: "gold",
    headline: "We're sorting the details",
    detail:
      "We're chatting on WhatsApp to lock in your dates. Keep an eye on that thread.",
  },
  CONFIRMED: {
    label: "Confirmed",
    tone: "mist",
    headline: "You're all set",
    detail:
      "Your stay is confirmed. Everything you need for the trip is below — your caretaker's details unlock closer to check-in.",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "error",
    headline: "This booking was cancelled",
    detail:
      "If that's not right, or you'd like to rebook, message us on WhatsApp and we'll help.",
  },
  COMPLETED: {
    label: "Completed",
    tone: "neutral",
    headline: "Hope it was lovely",
    detail:
      "Thanks for staying with Stayze. If you have a minute, a few words about the trip would mean a lot.",
  },
};

export function statusMeta(status: string): StatusMeta {
  return META[status as BookingStatus] ?? META.NEW;
}

/** The four milestones on the tracker, in order. */
export const TRIP_MILESTONES = [
  "Requested",
  "Confirmed",
  "Your stay",
  "Completed",
] as const;

/** Midnight, local. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * The tracker's current step, 1-based, in `BookingSteps` semantics: steps
 * before it read as complete (✓), the step itself is the active one, and a
 * value past the last step marks the whole journey done.
 *
 * CANCELLED returns 0 — the caller shows a cancelled banner instead of a
 * progress bar, because a cancelled trip has no "current step".
 */
export function trackerStep(
  status: string,
  checkIn: Date,
  checkOut: Date,
  now: Date = new Date(),
): number {
  const today = startOfDay(now);
  switch (status as BookingStatus) {
    case "NEW":
    case "CONTACTED":
      return 1;
    case "CONFIRMED":
      if (today >= startOfDay(checkOut)) return 4;
      if (today >= startOfDay(checkIn)) return 3;
      return 2;
    case "COMPLETED":
      return 5; // past the last step → all four complete
    case "CANCELLED":
      return 0;
    default:
      return 1;
  }
}

/** Whether the "leave a review" invitation should show. */
export function canReview(status: string): boolean {
  return status === "COMPLETED";
}
