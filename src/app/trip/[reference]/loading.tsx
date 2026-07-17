import { Skeleton } from "@/components/ui/skeleton";

/**
 * The trip dashboard's loading state.
 *
 * Mirrors the real layout — the wide header, the status bar, then stacked
 * section cards — so the page fills in rather than jumping.
 */
export default function TripLoading() {
  return (
    <div className="container-page py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Skeleton className="aspect-[16/9] w-full rounded-lg sm:aspect-[21/9]" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
