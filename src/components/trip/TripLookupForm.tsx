"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** The public reference shape, e.g. STZ-8F3K2. Mirrors `referenceSchema`. */
const REFERENCE = /^STZ-[A-Z0-9]{4,8}$/;

/**
 * The way back to a trip — there is no login, so a booking reference is the
 * key. A guest returns with the code from their confirmation.
 *
 * A small Client Component: it validates the *shape* locally (so an obvious
 * typo is caught without a round trip) and then navigates to
 * `/trip/[reference]`, where the Server Component is the authority on whether a
 * booking actually exists. It deliberately does not check existence here —
 * that would let anyone probe which codes are real.
 */
export function TripLookupForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const reference = value.trim().toUpperCase();
    if (!REFERENCE.test(reference)) {
      setError(
        "That doesn't look like a booking reference — it's like STZ-8F3K2.",
      );
      return;
    }
    router.push(`/trip/${reference}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <Input
        label="Booking reference"
        mono
        autoFocus={autoFocus}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="STZ-8F3K2"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        error={error ?? undefined}
        aria-describedby="reference-hint"
      />
      <p id="reference-hint" className="text-muted-ink text-xs">
        It’s on your confirmation and in your WhatsApp thread with us.
      </p>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Find my trip
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </form>
  );
}
