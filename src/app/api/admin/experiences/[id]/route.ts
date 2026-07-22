import { notFound, ok, parseBody, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { experienceFormSchema } from "@/lib/experience-form";
import {
  deleteExperience,
  getExperienceForAdmin,
  updateExperience,
} from "@/services/admin-experience.service";

type Params = { params: Promise<{ id: string }> };

/**
 * GET    /api/admin/experiences/:id  — full detail for the editor.
 * PATCH  /api/admin/experiences/:id  — update every editable field.
 * DELETE /api/admin/experiences/:id  — hard delete (links cascade away).
 *
 * SUPER_ADMIN only.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const exp = await getExperienceForAdmin(id);
    if (!exp) return notFound("No such experience.");
    return ok(exp);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const input = await parseBody(experienceFormSchema, request);
    return ok(await updateExperience(id, input));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    await deleteExperience(id);
    return ok({ id, deleted: true });
  });
}
