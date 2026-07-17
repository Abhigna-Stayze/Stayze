import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/home/skeletons";

/**
 * The experience detail loading state — back link, the immersive hero, then the
 * stacked content blocks and the related-stays grid, mirroring the real layout.
 */
export default function ExperienceLoading() {
  return (
    <div className="pb-16">
      <div className="container-page pt-5">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="container-page mt-4">
        <Skeleton className="aspect-[4/3] w-full rounded-lg sm:aspect-[16/9] lg:aspect-[21/9]" />
      </div>
      <div className="container-page">
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-12">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      </div>
      <div className="container-page section">
        <Skeleton className="h-7 w-56" />
        <CardGridSkeleton count={3} />
      </div>
    </div>
  );
}
