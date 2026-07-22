import { ok, parseBody, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { experienceStatusSchema } from "@/lib/experience-form";
import { setExperiencePublished } from "@/services/admin-experience.service";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/experiences/:id/status  — publish / unpublish.
 *
 * SUPER_ADMIN only. Kept separate from the big update so the list's toggle is a
 * single, cheap call.
 */
export async function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const { isPublished } = await parseBody(experienceStatusSchema, request);
    await setExperiencePublished(id, isPublished);
    return ok({ id, isPublished });
  });
}
