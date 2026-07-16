import { z } from "zod";

/**
 * The booking form's validation — two fields, because that is all we ask for.
 *
 * **`createBookingSchema` in `schemas.ts` remains the authority** — the server
 * revalidates everything and is the layer that actually guarantees it. This
 * module exists because that file imports `BUCKETS` from `storage.ts`, which is
 * `server-only`; importing it from a Client Component would fail the build. So
 * the rules are mirrored here, deliberately, in a module whose only dependency
 * is Zod.
 *
 * The two are kept honest by the round trip rather than by hope: a 422 comes
 * back with per-field `issues`, and the form maps them onto the fields.
 */

/** Digits only — guests type numbers in a dozen formats. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * The phone is the whole product: it *is* the WhatsApp number Stayze replies
 * to. Strict enough to catch a typo, loose enough not to refuse a real guest —
 * the server is deliberately permissive here, so this is the only place a
 * friendly nudge can happen.
 */
const guestPhone = z
  .string()
  .trim()
  .min(1, "We need a number — it's where we reply.")
  .superRefine((value, ctx) => {
    const digits = digitsOf(value);
    if (digits.length < 10) {
      ctx.addIssue({
        code: "custom",
        message: "That looks short — enter a 10-digit mobile number.",
      });
      return;
    }
    if (digits.length > 15) {
      ctx.addIssue({ code: "custom", message: "That number looks too long." });
      return;
    }
    // A bare 10-digit number is an Indian mobile; those start 6–9.
    if (digits.length === 10 && !/^[6-9]/.test(digits)) {
      ctx.addIssue({
        code: "custom",
        message: "An Indian mobile starts with 6, 7, 8 or 9.",
      });
    }
  });

export const bookingFormSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(2, "Please enter the name for the booking.")
    .max(100, "That name is too long."),
  guestPhone,
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/** Field-keyed messages, the shape both Zod and the API's 422 collapse into. */
export type FieldErrors = Partial<Record<string, string>>;

export function validateDetails(values: BookingFormValues): FieldErrors {
  const result = bookingFormSchema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return errors;
}

/**
 * Date rules, mirroring the server's two refinements: a stay is at least one
 * night, and it cannot start in the past.
 */
export function validateDates(
  checkIn: Date | null,
  checkOut: Date | null,
): string | null {
  if (!checkIn) return "Pick a check-in date.";
  if (!checkOut) return "Pick a check-out date.";
  if (checkOut <= checkIn) return "Check-out must be at least one night later.";
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (checkIn < startOfToday) return "Check-in cannot be in the past.";
  return null;
}

/**
 * The service refuses more guests than the stay sleeps, and says so in a line
 * worth showing verbatim. Catching it here saves the guest a round trip.
 */
export function validateGuests(
  guests: number,
  maxGuests: number,
  stayName: string,
): string | null {
  if (guests > maxGuests) {
    return `${stayName} sleeps ${maxGuests}. You've asked for ${guests}.`;
  }
  return null;
}
