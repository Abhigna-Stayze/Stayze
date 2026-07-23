import { ok, parseBody, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { settingsFormSchema } from "@/lib/settings-form";
import {
  getSettingsForAdmin,
  updateSettings,
} from "@/services/admin-settings.service";

/**
 * GET   /api/admin/settings — the single config row, for the settings form.
 * PATCH /api/admin/settings — create or update it (upsert on a fixed id).
 *
 * SUPER_ADMIN only. The public read is `GET /api/site`, which exposes the same
 * row through the public contract.
 */
export async function GET() {
  return route(async () => {
    await requireSuperAdmin();
    return ok(await getSettingsForAdmin());
  });
}

export async function PATCH(request: Request) {
  return route(async () => {
    await requireSuperAdmin();
    const input = await parseBody(settingsFormSchema, request);
    return ok(await updateSettings(input));
  });
}
