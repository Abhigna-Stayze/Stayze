import { z } from "zod";
import { created, ok, parseBody, parseQuery, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { stayFormSchema, STAY_STATUSES } from "@/lib/stay-form";
import { createStay, listStays } from "@/services/admin-stay.service";

/**
 * GET  /api/admin/stays   — the admin table (all statuses, private fields).
 * POST /api/admin/stays   — create a stay.
 *
 * SUPER_ADMIN only. This is a separate surface from the public `/api/stays`
 * (published-only), so drafts and owner phone numbers can never leak through
 * the public contract.
 */

const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(STAY_STATUSES).optional(),
  type: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z
    .enum(["newest", "oldest", "price-asc", "price-desc", "name"])
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional(),
});

export async function GET(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const params = parseQuery(listQuerySchema, request);
    return ok(await listStays(params));
  });
}

export async function POST(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const input = await parseBody(stayFormSchema, request);
    return created(await createStay(input));
  });
}
