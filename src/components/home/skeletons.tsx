import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Loading placeholders for the Home page's streamed sections. Each Suspense
 * boundary shows one of these while its service query resolves, so the page
 * paints its shell and hero immediately and the data sections fill in. Card
 * shapes mirror the real cards to avoid layout shift.
 */
function CardSkeleton({ media = "aspect-[16/10]" }: { media?: string }) {
  return (
    <div className="card-surface overflow-hidden">
      <Skeleton className={cn("rounded-none", media)} />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 3,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
  media,
}: {
  count?: number;
  columns?: string;
  media?: string;
}) {
  return (
    <div className={cn("mt-8 grid gap-6", columns)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} media={media} />
      ))}
    </div>
  );
}
