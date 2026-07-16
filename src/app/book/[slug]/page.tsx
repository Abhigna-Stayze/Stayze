import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStayDetail } from "@/lib/stay";
import { BookingFlow } from "@/components/booking/BookingFlow";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * A booking screen is a private moment, not a landing page — and it would be a
 * thin, duplicate one anyway. Keep it out of the index; `/stays/[slug]` is the
 * page that should rank.
 */
export const metadata: Metadata = {
  title: "Request to book",
  robots: { index: false, follow: true },
};

/** "2026-08-14" from the query string, or null if it isn't a real date. */
function parseDate(value: string | string[] | undefined): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseGuests(value: string | string[] | undefined): number {
  if (typeof value !== "string") return 2;
  const guests = Number.parseInt(value, 10);
  return Number.isFinite(guests) && guests > 0 ? guests : 2;
}

/**
 * `/book/[slug]` — the conversion path.
 *
 * The shell is a Server Component: the stay is read through `getStayDetail`
 * (server-only helper → service layer, never a self-fetch), so the summary card
 * is real from the first paint and an unknown slug 404s before a guest can type
 * anything. The flow itself is a Client Component, and the one write it makes
 * goes over `POST /api/booking`.
 *
 * Dates and guests arrive prefilled from the stay page's Reserve button, so a
 * guest who already chose them doesn't choose twice.
 */
export default async function BookPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const stay = await getStayDetail(slug);
  if (!stay) notFound();

  return (
    <BookingFlow
      stay={stay}
      initial={{
        checkIn: parseDate(query.checkin),
        checkOut: parseDate(query.checkout),
        guests: parseGuests(query.guests),
      }}
    />
  );
}
