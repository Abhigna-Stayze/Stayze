import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/home/skeletons";

/**
 * The guide detail loading state — back link, the hero, then the article column
 * and the recommended-stays grid, mirroring the real layout.
 */
export default function GuideLoading() {
  return (
    <div className="pb-16">
      <div className="container-page pt-5">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="container-page mt-4">
        <Skeleton className="aspect-[4/3] w-full rounded-lg sm:aspect-[16/9] lg:aspect-[21/9]" />
      </div>
      <div className="container-page">
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-6 h-7 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="container-page section">
        <Skeleton className="h-7 w-56" />
        <CardGridSkeleton count={3} />
      </div>
    </div>
  );
}
