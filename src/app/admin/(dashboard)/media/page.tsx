import type { Metadata } from "next";
import { Images } from "lucide-react";
import {
  listMedia,
  type MediaListParams,
} from "@/services/admin-media.service";
import { BUCKETS } from "@/lib/storage";
import { MediaToolbar } from "@/components/admin/media/MediaToolbar";
import { MediaUploader } from "@/components/admin/media/MediaUploader";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { Pagination } from "@/components/admin/stays/Pagination";

export const metadata: Metadata = {
  title: "Media",
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

function formatBytes(bytes: number): string {
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

/**
 * The Media Library — a Server Component over a **derived** index.
 *
 * There is no media table in Schema v1.1 and this phase adds no columns, so the
 * library is computed on read: the Storage buckets say what exists, and every
 * media reference in Postgres says what uses it. That join is what makes
 * "Unused" trustworthy enough to delete from.
 */
export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const params: MediaListParams = {
    search: str(sp.search),
    bucket: str(sp.bucket),
    filter: str(sp.filter) as MediaListParams["filter"],
    sort: str(sp.sort) as MediaListParams["sort"],
    page: n(sp.page),
    pageSize: 24,
  };

  const list = await listMedia(params);
  const isFiltered = Boolean(
    params.search ||
    params.bucket ||
    (params.filter && params.filter !== "all"),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="heading-1 text-bark">Media</h1>
        <p className="text-muted-ink mt-1.5">
          Every file in the storage buckets, and what uses it.{" "}
          <span className="num">{list.stats.all}</span> files ·{" "}
          <span className="num">{formatBytes(list.stats.bytes)}</span> ·{" "}
          <span className="num">{list.stats.unused}</span> unused
        </p>
      </header>

      <div className="mt-6">
        <MediaUploader buckets={BUCKETS} />
      </div>

      <div className="mt-6">
        <MediaToolbar stats={list.stats} buckets={BUCKETS} />
      </div>

      {list.items.length === 0 ? (
        <div className="border-border bg-card mt-6 flex flex-col items-center rounded-lg border border-dashed px-6 py-16 text-center">
          <span className="bg-paper-2 text-bark/50 mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <Images className="size-6" aria-hidden />
          </span>
          <p className="text-bark font-medium">
            {isFiltered ? "No files match those filters" : "No files yet"}
          </p>
          <p className="text-muted-ink mt-1 max-w-sm text-sm">
            {isFiltered
              ? "Try a different search or clear the filters."
              : "Upload a file, or add images from a stay or experience editor."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <MediaGrid items={list.items} />
          </div>
          <div className="mt-6">
            <Pagination
              page={list.page}
              pageCount={list.pageCount}
              total={list.total}
              noun="file"
            />
          </div>
        </>
      )}
    </div>
  );
}
