import { z } from "zod";
import { ok, parseBody, parseQuery, route } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin-guard";
import {
  getAvailabilityForAdmin,
  setAvailability,
  clearAvailability,
} from "@/services/admin-stay.service";

type Params = { params: Promise<{ id: string }> };

const rangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD.");
const mutateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set"),
    dates: z.array(DATE).min(1),
    status: z.enum(["AVAILABLE", "BLOCKED"]),
    priceOverride: z.coerce.number().positive().nullable().optional(),
  }),
  z.object({ action: z.literal("clear"), dates: z.array(DATE).min(1) }),
]);

/**
 * GET  /api/admin/stays/:id/availability?from&to — status + price overrides.
 * POST /api/admin/stays/:id/availability — block/unblock or price dates
 *      ({ action: "set" | "clear", dates, status?, priceOverride? }).
 */
export async function GET(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const { from, to } = parseQuery(rangeSchema, request);
    return ok(
      await getAvailabilityForAdmin(
        id,
        new Date(`${from}T00:00:00.000Z`),
        new Date(`${to}T00:00:00.000Z`),
      ),
    );
  });
}

export async function POST(request: Request, { params }: Params) {
  return route(async () => {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await parseBody(mutateSchema, request);
    if (body.action === "clear") {
      await clearAvailability(id, body.dates);
    } else {
      await setAvailability(
        id,
        body.dates,
        body.status,
        body.priceOverride ?? null,
      );
    }
    return ok({ ok: true });
  });
}
