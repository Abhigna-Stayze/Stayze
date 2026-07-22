import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Home as HomeIcon } from "lucide-react";
import {
  listStays,
  getStayTypes,
  type ListParams,
} from "@/services/admin-stay.service";
import { Button } from "@/components/ui/button";
import { Thumbnail } from "@/components/shared/Thumbnail";
import { formatPrice } from "@/components/ui/price";
import { StatusBadge } from "@/components/admin/stays/StatusBadge";
import { StaysToolbar } from "@/components/admin/stays/StaysToolbar";
import { StayRowActions } from "@/components/admin/stays/StayRowActions";
import { Pagination } from "@/components/admin/stays/Pagination";

export const metadata: Metadata = {
  title: "Stays",
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
 * Stay management — the admin table. A Server Component: it reads the query
 * (search, filters, sort, page) and asks the service for that page, so search,
 * filtering, sorting and pagination all happen on the server. Row actions and
 * the toolbar are the only client islands.
 */
export default async function AdminStaysPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const params: ListParams = {
    search: str(sp.search),
    status: str(sp.status) as ListParams["status"],
    type: str(sp.type),
    minPrice: n(sp.minPrice),
    maxPrice: n(sp.maxPrice),
    sort: str(sp.sort) as ListParams["sort"],
    page: n(sp.page),
    pageSize: 10,
  };

  const [list, types] = await Promise.all([listStays(params), getStayTypes()]);
  const isFiltered = Boolean(
    params.search ||
    params.status ||
    params.type ||
    params.minPrice ||
    params.maxPrice,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-1 text-bark">Stays</h1>
          <p className="text-muted-ink mt-1.5">
            Create, edit and publish the homestays on Stayze.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/stays/new">
            <Plus className="size-4" aria-hidden />
            New stay
          </Link>
        </Button>
      </header>

      <div className="mt-6">
        <StaysToolbar types={types} />
      </div>

      {list.items.length === 0 ? (
        <div className="border-border bg-card mt-6 flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
          <span className="bg-paper-2 text-bark/50 mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <HomeIcon className="size-6" aria-hidden />
          </span>
          <p className="text-bark font-medium">
            {isFiltered ? "No stays match those filters" : "No stays yet"}
          </p>
          <p className="text-muted-ink mt-1 max-w-sm text-sm">
            {isFiltered
              ? "Try a different search or clear the filters."
              : "Add your first homestay to get started."}
          </p>
          {!isFiltered && (
            <Button asChild className="mt-5">
              <Link href="/admin/stays/new">
                <Plus className="size-4" aria-hidden />
                New stay
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="card-surface mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-border text-muted-ink border-b text-left">
                  <th className="p-3 font-medium">Property</th>
                  <th className="hidden p-3 font-medium lg:table-cell">
                    Owner
                  </th>
                  <th className="p-3 text-right font-medium">Price</th>
                  <th className="hidden p-3 text-center font-medium sm:table-cell">
                    Rooms
                  </th>
                  <th className="hidden p-3 text-center font-medium sm:table-cell">
                    Guests
                  </th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="hidden p-3 font-medium md:table-cell">
                    Created
                  </th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((s) => (
                  <tr
                    key={s.id}
                    className="border-border/60 hover:bg-paper-2/40 border-b last:border-0"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="border-border size-12 shrink-0 overflow-hidden rounded-md border">
                          <div className="relative size-full">
                            <Thumbnail
                              src={s.coverImageUrl}
                              alt={s.name}
                              sizes="48px"
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/stays/${s.id}`}
                            className="text-bark hover:text-clay block truncate font-medium"
                          >
                            {s.name}
                          </Link>
                          <span className="text-muted-ink block truncate text-xs">
                            {s.type}
                            {s.isFeatured && " · Featured"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-ink hidden p-3 lg:table-cell">
                      {s.ownerName}
                    </td>
                    <td className="text-bark p-3 text-right whitespace-nowrap">
                      {formatPrice(s.basePricePerNight, s.currency)}
                    </td>
                    <td className="num text-muted-ink hidden p-3 text-center sm:table-cell">
                      {s.bedrooms}
                    </td>
                    <td className="num text-muted-ink hidden p-3 text-center sm:table-cell">
                      {s.maxGuests}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="num text-muted-ink hidden p-3 whitespace-nowrap md:table-cell">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="p-3">
                      <StayRowActions
                        id={s.id}
                        name={s.name}
                        status={s.status}
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
            />
          </div>
        </>
      )}
    </div>
  );
}
