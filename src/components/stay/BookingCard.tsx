"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StayDetail } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { GuestCounter } from "@/components/booking/GuestCounter";
import { DateField } from "@/components/booking/DateField";
import {
  Calendar,
  nightsBetween,
  toISODate,
  type DateRange,
} from "@/components/booking/Calendar";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * The booking card — the only clay button on the page.
 *
 * Dates and guests are UI only: they are carried into `/book/[slug]` as query
 * params and the booking flow owns the rest. **No total is shown here on
 * purpose.** A nightly rate can be overridden per date (weekends, festivals),
 * so multiplying the base price would quote a number the server disagrees with;
 * the real estimate comes back from `POST /api/booking`. Better to show the
 * rate and be right than a total and be wrong.
 *
 * The two `DateField`s are triggers — the role they were built for — and open
 * Stayze's own `Calendar` below them. It stays closed until asked for, so the
 * card is compact, and closes itself once a full range is chosen.
 *
 * Nothing is charged at any point — this is request-to-book over WhatsApp, and
 * the copy says so plainly.
 */
export function BookingCard({
  stay,
  whatsappNumber,
}: {
  stay: StayDetail;
  whatsappNumber: string | null;
}) {
  const today = new Date();
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  const [range, setRange] = useState<DateRange>({
    checkIn: null,
    checkOut: null,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guests, setGuests] = useState(2);

  const nights =
    range.checkIn && range.checkOut
      ? nightsBetween(range.checkIn, range.checkOut)
      : 0;

  const params = new URLSearchParams();
  if (range.checkIn) params.set("checkin", toISODate(range.checkIn));
  if (range.checkOut) params.set("checkout", toISODate(range.checkOut));
  params.set("guests", String(guests));

  const expert = whatsappLink(
    whatsappNumber,
    `Hi Stayze! I'd like to know more about ${stay.name}.`,
  );

  return (
    <div className="card-float p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Price amount={stay.basePricePerNight} currency={stay.currency} />
        {stay.ratingAvg !== null ? (
          <Rating
            value={stay.ratingAvg}
            reviewCount={stay.reviewCount}
            showCount
          />
        ) : (
          <span className="text-muted-ink text-xs font-medium">New stay</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <DateField
          label="Check-in"
          value={range.checkIn}
          withYear={false}
          onClick={() => setCalendarOpen((open) => !open)}
        />
        <DateField
          label="Check-out"
          value={range.checkOut}
          withYear={false}
          onClick={() => setCalendarOpen((open) => !open)}
        />
      </div>

      {calendarOpen && (
        <div className="border-border mt-2 rounded-md border p-3">
          <Calendar
            value={range}
            minDate={tomorrow}
            onChange={(next) => {
              setRange(next);
              // A complete range is the cue to get out of the way.
              if (next.checkOut) setCalendarOpen(false);
            }}
            onClear={() => setRange({ checkIn: null, checkOut: null })}
          />
        </div>
      )}

      {nights > 0 && (
        <p className="text-muted-ink mt-2 text-center text-xs">
          <span className="num text-bark font-medium">{nights}</span>{" "}
          {nights === 1 ? "night" : "nights"} at {stay.name}
        </p>
      )}

      <div className="border-input bg-card mt-2 flex flex-row items-center justify-between rounded-md border px-3 py-2">
        <span>
          <span className="eyebrow text-muted-ink block">Guests</span>
          <span className="text-muted-ink text-xs">
            Sleeps up to <span className="num">{stay.maxGuests}</span>
          </span>
        </span>
        <GuestCounter
          value={guests}
          onChange={setGuests}
          min={1}
          max={stay.maxGuests}
        />
      </div>

      <Button asChild size="lg" className="mt-4 w-full">
        <Link href={`/book/${stay.slug}?${params.toString()}`}>
          Reserve now
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>

      <p className="text-muted-ink mt-3 text-center text-xs leading-relaxed">
        Nothing is charged now. We’ll confirm on WhatsApp within a few hours.
      </p>

      {expert && (
        <a
          href={expert}
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay focus-visible:ring-ring focus-visible:ring-offset-paper mt-3 inline-flex w-full items-center justify-center gap-2 text-sm font-medium focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <WhatsappIcon className="size-4" />
          Chat with a stay expert
        </a>
      )}

      {stay.cancellationPolicy && (
        <p className="border-border text-muted-ink mt-4 border-t pt-3 text-xs leading-relaxed">
          {stay.cancellationPolicy}
        </p>
      )}
    </div>
  );
}
