import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/home/skeletons";

/**
 * The Travel Guide listing loading state — the hero band, the search row, then
 * a grid of card placeholders, so the page fills in rather than jumping.
 */
export default function TravelGuideLoading() {
  return (
    <>
      <div className="bg-paper-2/50 border-border border-b">
        <div className="container-page grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-16 w-full max-w-md" />
          </div>
          <Skeleton className="order-1 aspect-[16/10] w-full rounded-lg lg:order-2" />
        </div>
      </div>

      <div className="container-page section">
        <Skeleton className="h-11 w-full max-w-xl rounded-md" />
        <div className="mt-4 flex flex-wrap gap-2" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}
