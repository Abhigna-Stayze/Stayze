import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAmenityOptions } from "@/services/admin-stay.service";
import { emptyStayForm } from "@/lib/stay-form";
import { StayForm } from "@/components/admin/stays/StayForm";

export const metadata: Metadata = {
  title: "New stay",
  robots: { index: false, follow: false },
};

/**
 * Create a stay. A Server Component that loads the amenity vocabulary and hands
 * an empty form to the client `StayForm`. It saves as a DRAFT by default.
 */
export default async function NewStayPage() {
  const amenities = await getAmenityOptions();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/stays"
        className="text-muted-ink hover:text-bark inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All stays
      </Link>
      <h1 className="heading-1 text-bark mt-3">New stay</h1>
      <p className="text-muted-ink mt-1.5">
        Onboard a homestay. Save it as a draft and publish when it’s ready.
      </p>

      <div className="mt-6">
        <StayForm
          mode="create"
          defaultValues={emptyStayForm}
          amenities={amenities}
        />
      </div>
    </div>
  );
}
