import { created, parseBody, route } from "@/lib/api";
import { BOOKING_LIMIT, rateLimit } from "@/lib/rate-limit";
import { createBookingSchema } from "@/lib/schemas";
import { createBookingRequest } from "@/services/booking.service";

/**
 * POST /api/booking
 *
 * Create a booking enquiry. There is no payment and no login: we store what the
 * guest typed, build a prefilled WhatsApp message, and return a wa.me link for
 * the client to open. Stayze replies by hand and confirms manually.
 *
 * Body:
 *   { staySlug, guestName, guestPhone, guestEmail?, checkIn, checkOut,
 *     adults, children?, note? }
 *
 * 201 -> { reference, whatsappUrl, estimatedTotal, nights }
 *
 * The reference is the ONLY way a guest returns to their trip timeline, since
 * there are no accounts. The client must show it to them.
 *
 * Errors:
 *   422  the body failed validation (missing field, checkout before checkin)
 *   400  a rule the service enforces — unknown stay, more guests than it sleeps
 *
 * This endpoint is intentionally public and unauthenticated: it IS the booking
 * flow. It is therefore also the obvious thing to spam, so it is rate limited
 * to 5 per IP per 10 minutes — far above a real guest, far below a script.
 * 429 with a Retry-After header once that is spent.
 *
 * That limiter is in-process, which makes it a speed bump rather than a wall on
 * serverless. See src/lib/rate-limit.ts.
 */
export async function POST(request: Request) {
  return route(async () => {
    rateLimit(request, BOOKING_LIMIT);

    const body = await parseBody(createBookingSchema, request);

    const result = await createBookingRequest({
      staySlug: body.staySlug,
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      guestEmail: body.guestEmail ?? null,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      adults: body.adults,
      children: body.children ?? 0,
      note: body.note ?? null,
    });

    return created(result);
  });
}
