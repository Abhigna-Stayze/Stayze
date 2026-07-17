import "server-only";
import { cache } from "react";
import {
  getAllExperiences,
  getExperienceBySlug,
} from "@/services/experience.service";
import type { ExperienceCard, ExperienceDetail } from "@/services/types";

/**
 * Server-only reads for the Experiences pages.
 *
 * The seam the architecture prescribes: a Server Component calls one of these,
 * never a service or Prisma directly, and never a self-fetch of the REST route.
 * Each is `cache()`-wrapped so a page and its `generateMetadata` share a single
 * database read, and each degrades to a safe empty value on a database blip
 * rather than 500-ing the page — a listing renders its empty state, a detail
 * page falls to `notFound()`.
 */

export const getExperiences = cache(async (): Promise<ExperienceCard[]> => {
  try {
    return await getAllExperiences();
  } catch {
    return [];
  }
});

export const getExperienceDetail = cache(
  async (slug: string): Promise<ExperienceDetail | null> => {
    try {
      return await getExperienceBySlug(slug);
    } catch {
      return null;
    }
  },
);
