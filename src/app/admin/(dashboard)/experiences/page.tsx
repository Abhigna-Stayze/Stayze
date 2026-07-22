import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Compass } from "lucide-react";
import {
  listExperiences,
  type ListParams,
} from "@/services/admin-experience.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { ExperiencesToolbar } from "@/components/admin/experiences/ExperiencesToolbar";
import { ExperienceRowActions } from "@/components/admin/experiences/ExperienceRowActions";
import { Pagination } from "@/components/admin/stays/Pagination";

export const metadata: Metadata = {
  title: "Experiences",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}
function n(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (s === undefined) return undefined;
  const num = Number(s);
  return Number.isFinite(num) ? num : undefined;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Experience management — the admin table. A Server Component: it reads the
 * query (search, filter, sort, page) and asks the service for that page, so all
 * of it happens on the server. Row actions and the toolbar are client islands.
 */
export default async function AdminExperiencesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const params: ListParams = {
    search: str(sp.search),
    status: str(sp.status) as ListParams["status"],
    sort: str(sp.sort) as ListParams["sort"],
    page: n(sp.page),
    pageSize: 10,
  };

  const list = await listExperiences(params);
  const isFiltered = Boolean(params.search || params.status);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-1 text-bark">Experiences</h1>
          <p className="text-muted-ink mt-1.5">
            Create experiences once, then assign them to the stays that offer
            them.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/experiences/new">
            <Plus className="size-4" aria-hidden />
            New experience
          </Link>
        </Button>
      </header>

      <div className="mt-6">
        <ExperiencesToolbar />
      </div>

      {list.items.length === 0 ? (
        <div className="border-border bg-card mt-6 flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
          <span className="bg-paper-2 text-bark/50 mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <Compass className="size-6" aria-hidden />
          </span>
          <p className="text-bark font-medium">
            {isFiltered
              ? "No experiences match those filters"
              : "No experiences yet"}
          </p>
          <p className="text-muted-ink mt-1 max-w-sm text-sm">
            {isFiltered
              ? "Try a different search or clear the filters."
              : "Add your first experience to get started."}
          </p>
          {!isFiltered && (
            <Button asChild className="mt-5">
              <Link href="/admin/experiences/new">
                <Plus className="size-4" aria-hidden />
                New experience
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="card-surface mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border text-muted-ink border-b text-left">
                  <th className="p-3 font-medium">Experience</th>
                  <th className="hidden p-3 text-center font-medium sm:table-cell">
                    Assigned stays
                  </th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="hidden p-3 font-medium md:table-cell">
                    Created
                  </th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((e) => (
                  <tr
                    key={e.id}
                    className="border-border/60 hover:bg-paper-2/40 border-b last:border-0"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="border-border size-12 shrink-0 overflow-hidden rounded-md border">
                          <div className="relative size-full">
                            <Thumbnail
                              src={e.coverImageUrl}
                              alt={e.title}
                              sizes="48px"
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/experiences/${e.id}/edit`}
                            className="text-bark hover:text-clay block truncate font-medium"
                          >
                            {e.title}
                          </Link>
                          <span className="text-muted-ink block truncate text-xs">
                            /{e.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="num text-muted-ink hidden p-3 text-center sm:table-cell">
                      {e.assignedStays}
                    </td>
                    <td className="p-3">
                      <Badge tone={e.isPublished ? "mist" : "neutral"}>
                        {e.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="num text-muted-ink hidden p-3 whitespace-nowrap md:table-cell">
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="p-3">
                      <ExperienceRowActions
                        id={e.id}
                        title={e.title}
                        slug={e.slug}
                        isPublished={e.isPublished}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              page={list.page}
              pageCount={list.pageCount}
              total={list.total}
              noun="experience"
            />
          </div>
        </>
      )}
    </div>
  );
}
