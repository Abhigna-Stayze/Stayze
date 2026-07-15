import "server-only";
import { cache } from "react";
import { getFeaturedStays } from "@/services/stay.service";
import { getAllExperiences } from "@/services/experience.service";
import { getFeaturedGuides } from "@/services/guide.service";
import type { StayCard, ExperienceCard, GuideCard } from "@/services/types";

/**
 * The Home page's data, read the way the architecture prescribes: a Server
 * Component calls these server-only helpers, which call the service layer —
 * never a self-`fetch` of the REST API, never Prisma directly.
 *
 * Each helper is independent and resilient: it returns its own slice and, on a
 * database hiccup, degrades to an empty list rather than 500-ing the whole
 * page. The section then renders its empty state. Each is wrapped in React
 * `cache()` so a helper called more than once in a render runs a single query.
 */

export const getHomeFeaturedStays = cache(async (): Promise<StayCard[]> => {
  try {
    return await getFeaturedStays(3);
  } catch (error) {
    console.error("[home] featured stays failed:", error);
    return [];
  }
});

export const getHomeExperiences = cache(async (): Promise<ExperienceCard[]> => {
  try {
    return await getAllExperiences();
  } catch (error) {
    console.error("[home] experiences failed:", error);
    return [];
  }
});

export const getHomeGuides = cache(async (): Promise<GuideCard[]> => {
  try {
    return await getFeaturedGuides(3);
  } catch (error) {
    console.error("[home] guides failed:", error);
    return [];
  }
});
