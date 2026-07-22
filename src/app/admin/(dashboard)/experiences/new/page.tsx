import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getStayOptions } from "@/services/admin-experience.service";
import { emptyExperienceForm } from "@/lib/experience-form";
import { ExperienceForm } from "@/components/admin/experiences/ExperienceForm";

export const metadata: Metadata = {
  title: "New experience",
  robots: { index: false, follow: false },
};

/**
 * Create an experience. A Server Component that loads the stay options for the
 * assign multi-select and hands an empty form to the client `ExperienceForm`.
 * It saves as a draft by default.
 */
export default async function NewExperiencePage() {
  const stays = await getStayOptions();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/experiences"
        className="text-muted-ink hover:text-bark inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All experiences
      </Link>
      <h1 className="heading-1 text-bark mt-3">New experience</h1>
      <p className="text-muted-ink mt-1.5">
        Describe the experience and assign it to the stays that offer it.
      </p>

      <div className="mt-6">
        <ExperienceForm
          mode="create"
          defaultValues={emptyExperienceForm}
          stays={stays}
        />
      </div>
    </div>
  );
}
