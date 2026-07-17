import { Lock, Phone } from "lucide-react";
import type { BookingView } from "@/services/types";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Your caretaker — the person who meets you at the gate.
 *
 * **The number is not ours to give out early.** The service returns
 * `caretakerName`/`caretakerPhone` as null until the booking is CONFIRMED,
 * because a reference is guessable and a caretaker's personal number is not
 * ours to hand to a stranger. This component only renders what it is given: a
 * real card when the details are present, a calm locked state when they aren't.
 * There is nothing to work around here — the gate is in the service.
 */
export function TripCaretaker({ booking }: { booking: BookingView }) {
  const { caretakerName, caretakerPhone } = booking;

  if (!caretakerName || !caretakerPhone) {
    return (
      <section aria-labelledby="caretaker-heading">
        <SectionHeading id="caretaker-heading" title="Your caretaker" />
        <div className="border-border bg-card/60 mt-5 flex items-start gap-3 rounded-lg border border-dashed p-5">
          <Lock className="text-muted-ink mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="text-bark text-sm font-medium">
              Their details unlock once your booking is confirmed.
            </p>
            <p className="text-muted-ink mt-1 text-sm">
              You’ll get the caretaker’s name and number here — and on WhatsApp
              — closer to check-in, so you can reach them directly on the day.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const wa = whatsappLink(
    caretakerPhone,
    `Hi ${caretakerName}, this is a Stayze guest (${booking.reference}) arriving at ${booking.stay.name}.`,
  );

  return (
    <section aria-labelledby="caretaker-heading">
      <SectionHeading id="caretaker-heading" title="Your caretaker" />
      <div className="card-surface mt-5 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={null} name={caretakerName} size="lg" />
          <div>
            <h3 className="heading-3 text-bark">{caretakerName}</h3>
            <p className="text-muted-ink text-sm">
              Meets you at {booking.stay.name} and looks after you through the
              stay.
            </p>
            <p className="num text-bark mt-1 text-sm">{caretakerPhone}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <a href={`tel:${caretakerPhone.replace(/\s+/g, "")}`}>
              <Phone className="size-4" aria-hidden />
              Call
            </a>
          </Button>
          {wa && (
            <Button asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-4" />
                WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
