import { Skeleton } from "@/components/ui/skeleton";

/**
 * The stay page's loading state.
 *
 * Mirrors the real layout — gallery mosaic, story column, booking card — so the
 * page fills in rather than jumping. Route-level, so it covers the whole
 * server render; the reviews and nearby places arrive with the page body (one
 * query), and only related stays stream in separately.
 */
export default function StayLoading() {
  return (
    <div className="container-page pt-5">
      {/* Gallery. */}
      <div className="grid aspect-[16/10] grid-cols-1 gap-2 sm:aspect-[16/9] sm:grid-cols-4 sm:grid-rows-2">
        <Skeleton className="sm:col-span-2 sm:row-span-2" />
        <Skeleton className="hidden sm:col-span-2 sm:block" />
        <Skeleton className="hidden sm:col-span-2 sm:block" />
      </div>

      <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
