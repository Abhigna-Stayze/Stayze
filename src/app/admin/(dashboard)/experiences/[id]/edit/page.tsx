import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getExperienceForAdmin,
  getStayOptions,
  type AdminExperienceDetail,
} from "@/services/admin-experience.service";
import {
  emptyExperienceForm,
  type ExperienceFormValues,
} from "@/lib/experience-form";
import { ExperienceForm } from "@/components/admin/experiences/ExperienceForm";

export const metadata: Metadata = {
  title: "Edit experience",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

/** Map the stored detail into the form's value shape. */
function detailToForm(e: AdminExperienceDetail): ExperienceFormValues {
  return {
    ...emptyExperienceForm,
    title: e.title,
    slug: e.slug,
    excerpt: e.excerpt ?? "",
    story: e.story,
    coverImage: e.coverImageRef
      ? { ...e.coverImageRef, url: e.coverImageUrl }
      : null,
    metaTitle: e.metaTitle ?? "",
    metaDescription: e.metaDescription ?? "",
    stayIds: e.stayIds,
    isPublished: e.isPublished,
  };
}

/**
 * Edit an experience — every field. A Server Component reads the full detail and
 * the stay options, maps them to form defaults, and hands them to the same
 * `ExperienceForm` the create page uses.
 */
export default async function EditExperiencePage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [exp, stays] = await Promise.all([
    getExperienceForAdmin(id),
    getStayOptions(),
  ]);
  if (!exp) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/experiences"
        className="text-muted-ink hover:text-bark inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All experiences
      </Link>
      <h1 className="heading-1 text-bark mt-3">Edit experience</h1>
      <p className="text-muted-ink mt-1.5">{exp.title}</p>

      <div className="mt-6">
        <ExperienceForm
          mode="edit"
          experienceId={exp.id}
          slug={exp.slug}
          defaultValues={detailToForm(exp)}
          stays={stays}
        />
      </div>
    </div>
  );
}
