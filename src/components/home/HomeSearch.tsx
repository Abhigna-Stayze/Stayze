"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchField } from "@/components/search/SearchField";
import { GuestCounter } from "@/components/booking/GuestCounter";
import { Button } from "@/components/ui/button";

/**
 * HomeSearch — the hero's search bar. **UI only, no booking logic.**
 *
 * Composes the Phase 3 search primitives (`SearchBar` + `SearchField` +
 * `GuestCounter`) into the four-field bar. On submit it does the one thing the
 * spec allows at this stage: routes to `/explore` with the choices in the query
 * string, so the result is shareable and the back button works. It reads and
 * writes no data — Explore will interpret the params.
 *
 * "Where" is locked to Chikmagalur: a single-region product is honest with one
 * option, and a free-text box that finds nothing is not.
 */
export function HomeSearch() {
  const router = useRouter();

  // Sensible defaults so the bar is never empty: tomorrow and the day after.
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const plusDays = (n: number) =>
    iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + n));

  const [checkIn, setCheckIn] = useState(plusDays(1));
  const [checkOut, setCheckOut] = useState(plusDays(3));
  const [guests, setGuests] = useState(2);

  const submit = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    params.set("guests", String(guests));
    router.push(`/explore?${params.toString()}`);
  };

  const dateInputClass =
    "num w-full bg-transparent text-bark outline-none [color-scheme:light]";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      aria-label="Search stays"
    >
      <SearchBar
        variant="floating"
        action={
          <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto">
            <Search className="size-4" aria-hidden />
            Search
          </Button>
        }
      >
        <SearchField label="Where" className="sm:min-w-40">
          <span className="font-medium">Chikmagalur</span>
        </SearchField>
        <SearchField label="Check-in">
          <input
            type="date"
            aria-label="Check-in date"
            value={checkIn}
            min={plusDays(1)}
            onChange={(e) => setCheckIn(e.target.value)}
            className={dateInputClass}
          />
        </SearchField>
        <SearchField label="Check-out">
          <input
            type="date"
            aria-label="Check-out date"
            value={checkOut}
            min={checkIn || plusDays(2)}
            onChange={(e) => setCheckOut(e.target.value)}
            className={dateInputClass}
          />
        </SearchField>
        <SearchField label="Guests">
          <GuestCounter value={guests} onChange={setGuests} min={1} max={12} />
        </SearchField>
      </SearchBar>
    </form>
  );
}
