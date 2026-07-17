import "server-only";
import { cache } from "react";
import { getBookingByReference } from "@/services/booking.service";
import type { BookingView } from "@/services/types";

/**
 * The trip dashboard's data, read the architecture's way: a Server Component
 * calls this server-only helper, which calls the service layer — never a
 * self-`fetch` of the REST API, never Prisma directly.
 *
 * The service is the one that keeps a caretaker's phone number private
 * (returned null until the booking is CONFIRMED), so this page cannot leak it
 * even by accident — it only renders what it is handed.
 *
 * `cache()` dedupes within a render, so `generateMetadata` and the page body
 * share a single query.
 */
export const getTrip = cache(
  async (reference: string): Promise<BookingView | null> => {
    try {
      return await getBookingByReference(reference);
    } catch (error) {
      console.error(`[trip] getTrip failed for "${reference}":`, error);
      return null;
    }
  },
);
