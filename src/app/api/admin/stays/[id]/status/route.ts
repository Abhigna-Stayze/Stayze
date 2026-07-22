import { ok, parseBody, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { stayStatusSchema } from "@/lib/stay-form";
import { setStayStatus } from "@/services/admin-stay.service";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/stays/:id/status — the list's Publish / Unpublish / Hide
 * quick actions. Publishing is refused without a cover photo. SUPER_ADMIN only.
 */
export async function PATCH(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const { status } = await parseBody(stayStatusSchema, request);
    await setStayStatus(id, status);
    return ok({ id, status });
  });
}
