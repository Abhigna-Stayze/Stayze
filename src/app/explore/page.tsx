import type { Metadata } from "next";
import { getExploreStays } from "@/lib/explore";
import { parseFilters, sortStays } from "@/lib/explore-filters";
import { ExploreClient } from "@/components/explore/ExploreClient";

const DESCRIPTION =
  "Browse Stayze's curated collection of verified plantation stays in Chikmagalur — coffee estates, heritage bungalows and riverside cottages. Filter by budget, group size and more.";

export const metadata: Metadata = {
  title: "Explore stays in Chikmagalur",
  description: DESCRIPTION,
  alternates: { canonical: "/explore" },
  openGraph: {
    type: "website",
    url: "/explore",
    title: "Explore stays in Chikmagalur · Stayze",
    description: DESCRIPTION,
  },
};

/** Next passes `searchParams` as a promise of raw query values. */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toURLSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else if (value !== undefined) params.append(key, value);
  }
  return params;
}

/**
 * Explore — the property discovery page.
 *
 * A Server Component. It parses the filters from the URL, reads the matching
 * stays through the service layer (`getExploreStays`, never a self-fetch), sorts
 * them for the initial paint, and hands them to `ExploreClient`, which owns the
 * interactive filtering against the REST API. Rendering the first result set on
 * the server keeps every filter URL crawlable and instantly shareable.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseFilters(toURLSearchParams(await searchParams));
  const stays = sortStays(await getExploreStays(filters), filters.sort);

  return (
    <>
      {/* Compact page header — eyebrow + title only. The live property count
          sits with the results in ExploreClient, since it changes with the
          filters. */}
      <div className="container-page pt-8 pb-2">
        <p className="eyebrow text-muted-ink">Discover · Chikmagalur</p>
        <h1 className="heading-1 text-bark mt-2">
          Explore verified plantation stays
        </h1>
      </div>

      <ExploreClient initialStays={stays} initialFilters={filters} />
    </>
  );
}
