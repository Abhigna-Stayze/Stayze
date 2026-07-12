import { notFound, ok, route } from "@/lib/api";
import { referenceSchema } from "@/lib/schemas";
import { getBookingByReference } from "@/services/booking.service";

type Params = { params: Promise<{ reference: string }> };

/**
 * GET /api/booking/[reference]
 *
 * The Trip Timeline entry point. A guest has no account — they come back with
 * the code we gave them (STZ-8F3K2). Case-insensitive, because they will type
 * it from a WhatsApp message.
 *
 * The caretaker's phone number is withheld until the booking is CONFIRMED.
 * That rule lives in the service, not here: a reference code is short and
 * guessable, and a caretaker's personal number is not ours to hand to whoever
 * types one in.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { reference } = await params;
    const booking = await getBookingByReference(
      referenceSchema.parse(reference),
    );

    if (!booking) return notFound("No booking with that reference.");
    return ok(booking);
  });
}
