import Link from "next/link";
import type { StayDetail } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";

/**
 * The sticky mobile conversion bar — price on the left, Reserve on the right.
 *
 * Below `lg` only; on desktop the booking card is already pinned in the side
 * column. A plain Server Component: it holds no state and links straight into
 * the booking flow, where dates and guests are chosen.
 */
export function MobileBookingBar({ stay }: { stay: StayDetail }) {
  return (
    <div className="border-border bg-paper/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-sm lg:hidden">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Price amount={stay.basePricePerNight} currency={stay.currency} />
        <Button asChild size="lg">
          <Link href={`/book/${stay.slug}`}>Reserve now</Link>
        </Button>
      </div>
    </div>
  );
}
