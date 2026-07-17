/**
 * Experience themes — a discovery facet derived from the content itself.
 *
 * The `Experience` model carries a title, an excerpt and a story, but **no
 * structured `category` column** — so there is nothing in the database to build
 * a filter row from. Rather than fabricate per-experience metadata (a duration,
 * a difficulty, a category we never recorded), this module derives a small set
 * of *themes* from the words already on the page. It is a search-index facet,
 * honest about being derived, not a claim of curated data.
 *
 * A pure module — no `server-only`, no data access — so the Server Component
 * that renders the listing and the Client island that filters it share exactly
 * one classifier and one vocabulary.
 *
 * The design is deliberately future-ready: the `THEMES` table is the single
 * source of truth, and `availableThemes()` hides any theme nothing matches, so
 * the filter row only ever shows themes with real experiences behind them. When
 * a real `Experience.category` lands, swap `themesFor()` to read the column and
 * every consumer keeps working unchanged.
 */

import type { ExperienceCard } from "@/services/types";

export type Theme = {
  /** URL-safe token, used in the query string. */
  value: string;
  /** What the chip reads. */
  label: string;
  /**
   * Lower-cased substrings that mark this theme. Chosen to be specific — a
   * generic word ("up", "view") would over-tag — so a match is meaningful.
   */
  match: string[];
};

/**
 * The vocabulary, in the order the chips appear. Tuned to the real content
 * (gentle estate mornings, coffee, walks, food) rather than a generic
 * adventure taxonomy — but adding a theme is just another row here.
 */
export const THEMES: Theme[] = [
  {
    value: "coffee",
    label: "Coffee & plantation",
    match: [
      "coffee",
      "plantation",
      "estate",
      "pepper",
      "berr",
      "harvest",
      "roast",
      "brew",
      "bean",
      "pick",
    ],
  },
  {
    value: "mornings",
    label: "Slow mornings",
    match: ["sunrise", "morning", "mist", "dawn", "at seven", "daybreak"],
  },
  {
    value: "walks",
    label: "Walks & views",
    match: ["walk", "ridge", "trek", "hike", "summit", "climb", "viewpoint"],
  },
  {
    value: "food",
    label: "Food & table",
    match: [
      "breakfast",
      "cook",
      "roti",
      "chutney",
      "dinner",
      "meal",
      "kitchen",
      "table",
    ],
  },
  {
    value: "evenings",
    label: "Evenings & stars",
    match: ["bonfire", "evening", "stargaz", "star", "night", "after dark"],
  },
  {
    value: "water",
    label: "By the water",
    match: ["pool", "swim", "waterfall", "river", "falls"],
  },
  {
    value: "wellness",
    label: "Rest & wellness",
    match: ["yoga", "meditat", "stretch", "restful", "quiet"],
  },
  {
    value: "workation",
    label: "Work with a view",
    match: ["desk", "work", "wifi", "mbps", "workation"],
  },
];

const BY_VALUE = new Map(THEMES.map((t) => [t.value, t]));

export function themeLabel(value: string): string {
  return BY_VALUE.get(value)?.label ?? value;
}

/** The text a classifier reads — everything the card carries. */
function haystack(exp: Pick<ExperienceCard, "title" | "excerpt">): string {
  return `${exp.title} ${exp.excerpt ?? ""}`.toLowerCase();
}

/**
 * The themes an experience belongs to — zero or more. An experience that
 * matches nothing is not mis-filed: it still shows under "All" and in search,
 * it simply carries no theme chip.
 */
export function themesFor(
  exp: Pick<ExperienceCard, "title" | "excerpt">,
): string[] {
  const text = haystack(exp);
  return THEMES.filter((theme) =>
    theme.match.some((needle) => text.includes(needle)),
  ).map((theme) => theme.value);
}

/**
 * The themes worth showing as filters: only those at least one experience in
 * this set actually matches, in vocabulary order. No empty chips.
 */
export function availableThemes(experiences: ExperienceCard[]): Theme[] {
  const present = new Set(experiences.flatMap(themesFor));
  return THEMES.filter((theme) => present.has(theme.value));
}

/**
 * Filter an already-loaded set by free text and selected themes. Pure, so it
 * runs identically on the server (first paint) and in the client island.
 *
 *  - `query` matches against the title and excerpt (case-insensitive).
 *  - `themes` is OR within the selection — pick "Coffee" and "Walks" and you
 *    get either — which is the friendlier default for discovery.
 */
export function filterExperiences(
  experiences: ExperienceCard[],
  { query = "", themes = [] }: { query?: string; themes?: string[] },
): ExperienceCard[] {
  const q = query.trim().toLowerCase();
  const wanted = new Set(themes);

  return experiences.filter((exp) => {
    if (q && !haystack(exp).includes(q)) return false;
    if (wanted.size > 0) {
      const mine = themesFor(exp);
      if (!mine.some((t) => wanted.has(t))) return false;
    }
    return true;
  });
}
