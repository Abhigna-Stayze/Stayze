import { notFound, ok, parseBody, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { stayFormSchema } from "@/lib/stay-form";
import {
  getStayForAdmin,
  softDeleteStay,
  updateStay,
} from "@/services/admin-stay.service";

type Params = { params: Promise<{ id: string }> };

/**
 * GET    /api/admin/stays/:id  — full detail for view/edit.
 * PATCH  /api/admin/stays/:id  — update every editable field.
 * DELETE /api/admin/stays/:id  — soft delete (recoverable; drops from list + site).
 *
 * SUPER_ADMIN only.
 */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const stay = await getStayForAdmin(id);
    if (!stay) return notFound("No such stay.");
    return ok(stay);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const input = await parseBody(stayFormSchema, request);
    return ok(await updateStay(id, input));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    await softDeleteStay(id);
    return ok({ id, deleted: true });
  });
}
