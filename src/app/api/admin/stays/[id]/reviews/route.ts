import { ok, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { getStayReviewsForAdmin } from "@/services/admin-stay.service";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/stays/:id/reviews — every review for moderation. */
export async function GET(_request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    return ok(await getStayReviewsForAdmin(id));
  });
}
