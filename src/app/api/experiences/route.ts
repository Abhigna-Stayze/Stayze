import { ok, route } from "@/lib/api";
import { getAllExperiences } from "@/services/experience.service";

/**
 * GET /api/experiences
 *
 * Destination experiences — a coffee estate tour, a sunrise trek. Each has its
 * own page, which is the point of the model: the same experience can be offered
 * at several stays, so it earns a URL rather than being buried in one of them.
 *
 * Published only.
 */
export async function GET() {
  return route(async () => ok(await getAllExperiences()));
}
