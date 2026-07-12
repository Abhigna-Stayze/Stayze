import { notFound, ok, route } from "@/lib/api";
import { slugSchema } from "@/lib/schemas";
import { getGuideBySlug } from "@/services/guide.service";

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/guides/[slug]
 *
 * The full article — body included — plus the stays it features.
 * 404 for an unknown slug or an unpublished draft.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    const { slug } = await params;
    const guide = await getGuideBySlug(slugSchema.parse(slug));

    if (!guide) return notFound("No such guide.");
    return ok(guide);
  });
}
