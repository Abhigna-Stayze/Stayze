"use client";

import { useState } from "react";
import type { StayDetail } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingSummary } from "./BookingSummary";
import { BookingConfirmation, type BookingResult } from "./BookingConfirmation";
import { Calendar, nightsBetween, toISODate, type DateRange } from "./Calendar";
import { GuestCounter } from "./GuestCounter";
import { DateField } from "./DateField";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import {
  validateDates,
  validateDetails,
  validateGuests,
  type BookingFormValues,
  type FieldErrors,
} from "@/lib/booking-form";

/**
 * A 422's per-field text is Zod's own ("Too small: expected string to have >=2
 * characters") — accurate, and not English anyone should be shown. The client
 * validates first so this path is a safety net, but if it ever fires the guest
 * still gets a sentence.
 */
const FRIENDLY_FIELD_ERROR: Record<string, string> = {
  guestName: "Please enter the name for the booking.",
  guestPhone: "That phone number doesn't look right.",
  guestEmail: "That email address doesn't look right.",
  checkIn: "Please check your check-in date.",
  checkOut: "Check-out must be at least one night after check-in.",
  adults: "Please check the number of guests.",
  children: "Please check the number of guests.",
};

/**
 * The booking flow — one screen, two fields.
 *
 * The guest already chose the stay, the dates and the party size on the stay
 * page; asking again would be theatre. So the trip rides along as a line they
 * can open and change, and the only things to type are **a name and a mobile
 * number**. Everything else is composed into the WhatsApp message for them.
 * There is no payment step because v1.1 has no payment, and no account step
 * because there are no accounts.
 *
 * It submits through **`POST /api/booking`** — the REST path, never a service
 * import — and the booking is persisted *before* the handoff, so closing the
 * tab loses nothing.
 *
 * Validation happens twice on purpose: locally (mirroring the server's rules)
 * so a guest is corrected without a round trip, then by the API, which is the
 * layer that actually guarantees it. A 422's per-field issues are mapped back
 * onto the fields, so even if the two drift the guest sees the fix. Nothing
 * technical is ever surfaced.
 */
export function BookingFlow({
  stay,
  initial,
}: {
  stay: StayDetail;
  initial: { checkIn: Date | null; checkOut: Date | null; guests: number };
}) {
  const [range, setRange] = useState<DateRange>({
    checkIn: initial.checkIn,
    checkOut: initial.checkOut,
  });
  const [guests, setGuests] = useState(
    Math.min(Math.max(1, initial.guests), stay.maxGuests),
  );
  const [values, setValues] = useState<BookingFormValues>({
    guestName: "",
    guestPhone: "",
  });

  // Open only when there is something to choose — a guest who arrived with
  // dates shouldn't have to look at a calendar.
  const [tripOpen, setTripOpen] = useState(
    !initial.checkIn || !initial.checkOut,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dateError, setDateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  const nights =
    range.checkIn && range.checkOut
      ? nightsBetween(range.checkIn, range.checkOut)
      : 0;

  const patch = (next: Partial<BookingFormValues>) => {
    setValues((v) => ({ ...v, ...next }));
    setErrors((e) => {
      const rest = { ...e };
      for (const key of Object.keys(next)) delete rest[key];
      return rest;
    });
  };

  const submit = async () => {
    // Check everything up front — one screen, so every problem shows at once.
    const dateProblem = validateDates(range.checkIn, range.checkOut);
    const fieldErrors = validateDetails(values);
    const guestProblem = validateGuests(guests, stay.maxGuests, stay.name);

    setDateError(dateProblem);
    setErrors(fieldErrors);
    setSubmitError(guestProblem);
    if (dateProblem) setTripOpen(true);
    if (dateProblem || guestProblem || Object.keys(fieldErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staySlug: stay.slug,
          guestName: values.guestName,
          guestPhone: values.guestPhone,
          checkIn: toISODate(range.checkIn as Date),
          checkOut: toISODate(range.checkOut as Date),
          adults: guests,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        setResult(payload.data as BookingResult);
        return;
      }

      const issues: Array<{ field?: string; message: string }> =
        payload?.error?.issues ?? [];

      if (response.status === 422 && issues.length > 0) {
        const mapped: FieldErrors = {};
        for (const issue of issues) {
          if (!issue.field) continue;
          mapped[issue.field] ??=
            FRIENDLY_FIELD_ERROR[issue.field] ?? issue.message;
        }
        setErrors(mapped);
        const dateIssue = issues.find(
          (i) => i.field === "checkIn" || i.field === "checkOut",
        );
        if (dateIssue?.field) {
          setDateError(
            FRIENDLY_FIELD_ERROR[dateIssue.field] ?? dateIssue.message,
          );
          setTripOpen(true);
        }
        return;
      }

      if (response.status === 429) {
        setSubmitError(
          "That's a few requests in a short while. Give it a few minutes, or just message us on WhatsApp.",
        );
        return;
      }

      // 400 is a rule the service enforces and phrases for humans — e.g.
      // "CoffeeCharm sleeps 6. You asked for 9." Worth showing verbatim.
      if (
        response.status === 400 &&
        typeof payload?.error?.message === "string"
      ) {
        setSubmitError(payload.error.message);
        return;
      }

      setSubmitError(
        "We couldn't send that just now. Try again in a moment — or message us on WhatsApp and we'll sort it out.",
      );
    } catch {
      // Network died, or the response wasn't JSON. Never surface the raw thing.
      setSubmitError(
        "That didn't go through — check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="container-page section">
        <BookingConfirmation stay={stay} result={result} />
      </div>
    );
  }

  const tripLine = [
    nights > 0
      ? `${nights} ${nights === 1 ? "night" : "nights"}`
      : "Pick your dates",
    `${guests} ${guests === 1 ? "guest" : "guests"}`,
  ].join(" · ");

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div className="min-w-0">
          <h1 className="heading-2 text-bark">Request to book</h1>
          <p className="text-muted-ink mt-2 max-w-md text-sm">
            Two details and you’re talking to us on WhatsApp. Nothing is charged
            — we reply by hand, usually within a few hours.
          </p>

          <div className="mt-8 max-w-md">
            {/* The trip, carried from the stay page. Open it only if you want
                to change something. */}
            <div className="card-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow text-muted-ink">Your trip</p>
                  <p className="text-bark mt-1 text-sm font-medium">
                    {tripLine}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTripOpen((open) => !open)}
                  aria-expanded={tripOpen}
                >
                  {tripOpen ? "Done" : "Change"}
                </Button>
              </div>

              {tripOpen && (
                <div className="animate-fade-up mt-4 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <DateField label="Check-in" value={range.checkIn} />
                    <DateField label="Check-out" value={range.checkOut} />
                  </div>

                  <Calendar
                    value={range}
                    minDate={
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate() + 1,
                      )
                    }
                    onChange={(next) => {
                      setRange(next);
                      setDateError(null);
                    }}
                    onClear={() => setRange({ checkIn: null, checkOut: null })}
                  />

                  <GuestCounter
                    label="Guests"
                    hint={`Sleeps up to ${stay.maxGuests}`}
                    value={guests}
                    onChange={(next) => {
                      setGuests(next);
                      setSubmitError(null);
                    }}
                    min={1}
                    max={stay.maxGuests}
                  />
                </div>
              )}
            </div>

            {dateError && (
              <p role="alert" className="text-error mt-3 text-sm">
                {dateError}
              </p>
            )}

            {/* The only two things to type. */}
            <div className="mt-4 flex flex-col gap-4">
              <Input
                label="Full name"
                autoComplete="name"
                placeholder="Priya Ramesh"
                value={values.guestName}
                onChange={(e) => patch({ guestName: e.target.value })}
                error={errors.guestName}
                required
              />
              <Input
                label="Mobile — WhatsApp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                mono
                placeholder="+91 98450 12345"
                value={values.guestPhone}
                onChange={(e) => patch({ guestPhone: e.target.value })}
                error={errors.guestPhone}
                hint="This is where we reply."
                required
              />
            </div>

            {submitError && (
              <p role="alert" className="text-error mt-4 text-sm">
                {submitError}
              </p>
            )}

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={submit}
              disabled={submitting}
              aria-busy={submitting}
            >
              <WhatsappIcon className="size-4" />
              {submitting ? "Sending…" : "Continue on WhatsApp"}
            </Button>

            <p className="text-muted-ink mt-3 text-center text-xs leading-relaxed">
              We’ll send the details for you. Nothing is confirmed until we
              reply.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BookingSummary
            stay={stay}
            checkIn={range.checkIn}
            checkOut={range.checkOut}
            nights={nights > 0 ? nights : null}
            adults={guests}
            note="Your estimate comes back with the booking — nothing is charged now."
          />
        </aside>
      </div>
    </div>
  );
}
