"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { STAY_STATUSES } from "@/lib/stay-form";

const SELECT =
  "border-input bg-card text-ink focus-visible:ring-ring h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * The admin stays toolbar — search, status/type filters, and sort. Every
 * control writes to the URL query string; the listing is a Server Component
 * that re-reads those params and re-queries, so filtering, sorting and
 * pagination are all **server-side**. Search is debounced so a keystroke isn't a
 * request. Changing any filter resets to page 1.
 */
export function StaysToolbar({ types }: { types: string[] }) {
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
      sp.delete("page"); // any change returns to the first page
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router],
  );

  // Debounced search → URL.
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

  return (
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
          placeholder="Search name, owner, type, address…"
          aria-label="Search stays"
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
        aria-label="Filter by status"
        className={SELECT}
        value={params.get("status") ?? ""}
        onChange={(e) => push({ status: e.target.value || undefined })}
      >
        <option value="">All statuses</option>
        {STAY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      {types.length > 0 && (
        <select
          aria-label="Filter by type"
          className={SELECT}
          value={params.get("type") ?? ""}
          onChange={(e) => push({ type: e.target.value || undefined })}
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={params.get("minPrice") ?? ""}
          onBlur={(e) => push({ minPrice: e.target.value || undefined })}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="Min ₹"
          aria-label="Minimum price"
          className={`${SELECT} num w-24`}
        />
        <span className="text-muted-ink text-sm">–</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={params.get("maxPrice") ?? ""}
          onBlur={(e) => push({ maxPrice: e.target.value || undefined })}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="Max ₹"
          aria-label="Maximum price"
          className={`${SELECT} num w-24`}
        />
      </div>

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
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="name">Alphabetical</option>
      </select>
    </div>
  );
}
