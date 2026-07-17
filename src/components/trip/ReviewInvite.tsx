import { Star } from "lucide-react";
import type { BookingView } from "@/services/types";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Leave a review — shown only when the stay is behind them.
 *
 * The caller gates this on status (`canReview`), so it never nudges someone
 * mid-trip. For the MVP the invitation hands off to WhatsApp with a prefilled
 * message rather than a star form: reviews are moderated by hand anyway, and
 * this keeps one honest channel instead of a form that writes nowhere yet. The
 * `POST /api/reviews` form is the natural next step, and slots in here.
 */
export function ReviewInvite({
  booking,
  whatsappNumber,
}: {
  booking: BookingView;
  whatsappNumber: string | null;
}) {
  const wa = whatsappLink(
    whatsappNumber,
    `Hi Stayze! I'd like to leave a review for my stay at ${booking.stay.name} (${booking.reference}).`,
  );

  return (
    <section
      aria-labelledby="review-heading"
      className="bg-bark rounded-lg p-6 sm:p-8"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-gold inline-flex items-center gap-1.5">
            <Star className="fill-gold size-3.5" aria-hidden />
            Your stay
          </p>
          <h2 id="review-heading" className="heading-3 text-paper mt-2">
            How was {booking.stay.name}?
          </h2>
          <p className="text-paper/75 mt-1 max-w-md text-sm">
            A few words help the next guest — and the family who hosted you. It
            takes a minute.
          </p>
        </div>
        {wa && (
          <Button asChild size="lg" className="shrink-0">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon className="size-4" />
              Leave a review
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
