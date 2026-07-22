import { z } from "zod";
import { created, ok, parseBody, parseQuery, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { experienceFormSchema } from "@/lib/experience-form";
import {
  createExperience,
  listExperiences,
} from "@/services/admin-experience.service";

/**
 * GET  /api/admin/experiences  — the admin table (drafts included).
 * POST /api/admin/experiences  — create an experience.
 *
 * SUPER_ADMIN only. Separate from the public `/api/experiences`
 * (published-only), so drafts never leak through the public contract.
 */

const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
  sort: z.enum(["newest", "oldest", "name"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional(),
});

export async function GET(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const params = parseQuery(listQuerySchema, request);
    return ok(await listExperiences(params));
  });
}

export async function POST(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const input = await parseBody(experienceFormSchema, request);
    return created(await createExperience(input));
  });
}
