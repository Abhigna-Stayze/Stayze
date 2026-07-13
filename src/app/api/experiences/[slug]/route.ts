import { notFound, ok, route } from "@/lib/api";
import { slugSchema } from "@/lib/schemas";
import { getExperienceBySlug } from "@/services/experience.service";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/experiences/[slug]
 *
 * The experience page: the long story, its SEO metadata, and the stays where
 * you can actually do it.
 *
 * 404 for an unknown slug or an unpublished draft.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { slug } = await params;
    const experience = await getExperienceBySlug(slugSchema.parse(slug));

    if (!experience) return notFound("No such experience.");
    return ok(experience);
  });
}
