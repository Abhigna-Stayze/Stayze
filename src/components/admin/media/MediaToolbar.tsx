"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const SELECT =
  "border-input bg-card text-ink focus-visible:ring-ring h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * The media toolbar — search, bucket/type filter and sort. Every control writes
 * to the URL; the grid is a Server Component that re-reads those params and
 * re-derives the library, so filtering and sorting happen server-side. Search is
 * debounced; any change resets to page 1.
 */
export function MediaToolbar({
  stats,
  buckets,
}: {
  stats: { all: number; unused: number; missing: number };
  /** Passed from the server page — `storage.ts` must not reach the client bundle. */
  buckets: readonly string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("search") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      sp.delete("page");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router],
  );

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if ((params.get("search") ?? "") !== search) push({ search });
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filter = params.get("filter") ?? "all";
  const chips: { id: string; label: string; count?: number }[] = [
    { id: "all", label: "All", count: stats.all },
    { id: "images", label: "Images" },
    { id: "videos", label: "Videos" },
    { id: "recent", label: "Recent" },
    { id: "unused", label: "Unused", count: stats.unused },
    { id: "missing", label: "Missing", count: stats.missing },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="text-muted-ink pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search file name, alt text, caption…"
            aria-label="Search media"
            className="border-input bg-card text-ink placeholder:text-muted-ink/70 focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border pr-9 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-muted-ink hover:text-bark absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>

        <select
          aria-label="Filter by bucket"
          className={SELECT}
          value={params.get("bucket") ?? ""}
          onChange={(e) => push({ bucket: e.target.value || undefined })}
        >
          <option value="">All buckets</option>
          {buckets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort"
          className={SELECT}
          value={params.get("sort") ?? "newest"}
          onChange={(e) =>
            push({
              sort: e.target.value === "newest" ? undefined : e.target.value,
            })
          }
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const on = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                push({ filter: c.id === "all" ? undefined : c.id })
              }
              aria-pressed={on}
              className={
                on
                  ? "bg-bark text-paper inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  : "border-border text-muted-ink hover:bg-paper-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
              }
            >
              {c.label}
              {c.count !== undefined && (
                <span className="num opacity-70">{c.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
