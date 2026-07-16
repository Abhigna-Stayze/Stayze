"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import type { StayDetail } from "@/services/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/price";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";

export type BookingResult = {
  reference: string;
  whatsappUrl: string;
  estimatedTotal: number;
  nights: number;
};

/**
 * The confirmation — and the handoff.
 *
 * **The booking already exists in the database by the time this renders.** That
 * is the whole point of the ordering: if the guest closes the tab now, or
 * WhatsApp never opens, Stayze still has the enquiry.
 *
 * The reference is the largest thing on the screen because there are no
 * accounts — it is the only way back to this trip. So it is shown *before* the
 * jump to WhatsApp, and the jump is attempted rather than forced: a browser
 * may block a popup that follows an await, so WhatsApp is opened
 * opportunistically and the same link is also a button the guest can press. A
 * blocked popup then costs a tap, not the booking.
 *
 * The estimate here is the server's own, priced night by night — the first and
 * only total the flow quotes.
 */
export function BookingConfirmation({
  stay,
  result,
}: {
  stay: StayDetail;
  result: BookingResult;
}) {
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }, [result.whatsappUrl]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <span className="bg-mist text-paper inline-flex size-12 items-center justify-center rounded-full">
        <Check className="size-6" strokeWidth={2.5} aria-hidden />
      </span>

      <h1 className="heading-1 text-bark mt-6">Your request is with us</h1>

      <p className="num text-bark mt-6 text-4xl font-semibold tracking-wide sm:text-5xl">
        {result.reference}
      </p>
      <p className="text-clay mt-3 text-sm font-medium">
        Save this code. It’s how you’ll find your trip again.
      </p>

      <p className="text-muted-ink mt-6 text-sm">
        <span className="num text-bark font-medium">{result.nights}</span>{" "}
        {result.nights === 1 ? "night" : "nights"} at {stay.name} · estimated{" "}
        <span className="num text-bark font-medium">
          {formatPrice(result.estimatedTotal, stay.currency)}
        </span>
      </p>
      <p className="text-muted-ink mt-1 text-xs">
        An estimate, not a charge. Nothing is confirmed until we reply.
      </p>

      <Button asChild size="lg" className="mt-8">
        <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
          <WhatsappIcon className="size-4" />
          Continue on WhatsApp
        </a>
      </Button>
      <p className="text-muted-ink mt-2 text-xs">
        If WhatsApp didn’t open on its own, use the button.
      </p>

      <ul className="mt-10 grid w-full list-none gap-3 text-left sm:grid-cols-3">
        {[
          {
            title: "We’ll reply on WhatsApp",
            body: "Usually within a few hours.",
          },
          {
            title: "Your caretaker, 48h before",
            body: "Their number arrives once the booking is confirmed.",
          },
          {
            title: "A review request, 24h after",
            body: "Only if you’d like to.",
          },
        ].map((item) => (
          <li key={item.title} className="bg-paper-2/60 rounded-lg p-4">
            <p className="text-bark text-sm font-medium">{item.title}</p>
            <p className="text-muted-ink mt-1 text-sm">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
