"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Server-side pagination controls. Builds Prev/Next links that preserve the
 * current search, filter and sort params, so paging never loses the query.
 */
export function Pagination({
  page,
  pageCount,
  total,
  noun = "stay",
  nounPlural,
}: {
  page: number;
  pageCount: number;
  total: number;
  /** The thing being counted — defaults to "stay". */
  noun?: string;
  /** Plural form, if not just `noun + "s"`. */
  nounPlural?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  const href = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const linkCls =
    "border-border text-bark hover:bg-paper-2 focus-visible:ring-ring inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none";
  const disabledCls =
    "border-border text-muted-ink/40 pointer-events-none inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium";

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-ink text-sm">
        <span className="num text-bark font-medium">{total}</span>{" "}
        {total === 1 ? noun : (nounPlural ?? `${noun}s`)} · page{" "}
        <span className="num">{page}</span> of{" "}
        <span className="num">{pageCount}</span>
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={linkCls} rel="prev">
            <ChevronLeft className="size-4" aria-hidden />
            Prev
          </Link>
        ) : (
          <span className={disabledCls} aria-disabled>
            <ChevronLeft className="size-4" aria-hidden />
            Prev
          </span>
        )}
        {page < pageCount ? (
          <Link href={href(page + 1)} className={linkCls} rel="next">
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <span className={disabledCls} aria-disabled>
            Next
            <ChevronRight className="size-4" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
