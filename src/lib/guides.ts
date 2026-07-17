import "server-only";
import { cache } from "react";
import {
  getAllGuides,
  getGuideBySlug,
  getGuideCategories,
} from "@/services/guide.service";
import { getExperiencesForStay } from "@/services/experience.service";
import type { ExperienceCard, GuideCard, GuideDetail } from "@/services/types";

/**
 * Server-only reads for the Travel Guide pages — the seam the architecture
 * prescribes (Server Component → helper → service, never a self-fetch). Each is
 * `cache()`-wrapped so a page and its `generateMetadata` share one read, and
 * each degrades to a safe empty value on a database blip rather than 500-ing.
 */

export const getGuides = cache(async (): Promise<GuideCard[]> => {
  try {
    return await getAllGuides();
  } catch {
    return [];
  }
});

export const getGuideDetail = cache(
  async (slug: string): Promise<GuideDetail | null> => {
    try {
      return await getGuideBySlug(slug);
    } catch {
      return null;
    }
  },
);

export const getGuideCategoryList = cache(
  async (): Promise<Array<{ id: string; name: string; slug: string }>> => {
    try {
      return await getGuideCategories();
    } catch {
      return [];
    }
  },
);

/**
 * "Nearby experiences" for a guide — derived, honestly, from the stays the
 * guide features.
 *
 * There is no guide→experience relation in the schema, so rather than show a
 * generic, unrelated list this gathers the experiences offered *at the stays
 * this guide recommends* — which genuinely are the things a reader of this
 * guide could do — deduplicates them, and caps the set. Returns an empty array
 * when the guide features no stays or those stays offer nothing, and the
 * section is then simply omitted.
 */
export async function getGuideExperiences(
  stayIds: string[],
  limit = 4,
): Promise<ExperienceCard[]> {
  if (stayIds.length === 0) return [];
  try {
    const lists = await Promise.all(
      stayIds.map((id) => getExperiencesForStay(id)),
    );
    const seen = new Set<string>();
    const experiences: ExperienceCard[] = [];
    for (const exp of lists.flat()) {
      if (seen.has(exp.id)) continue;
      seen.add(exp.id);
      experiences.push(exp);
      if (experiences.length >= limit) break;
    }
    return experiences;
  } catch {
    return [];
  }
}
