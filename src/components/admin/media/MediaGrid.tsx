"use client";

import { useState } from "react";
import { ImageOff, Link2, AlertTriangle } from "lucide-react";
import type { MediaItem } from "@/services/admin-media.service";
import { MediaPreviewDialog } from "@/components/admin/media/MediaPreviewDialog";

/** Bytes → a short human size. */
export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * The media grid. Each card is a button that opens the preview dialog, where
 * every action lives. Cards carry the status the library computes — **Unused**
 * (nothing references it, safe to delete) and **Missing** (a row points at it
 * but the object is gone from Storage, i.e. a broken image on the site).
 */
export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [open, setOpen] = useState<MediaItem | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const unused = item.usedBy.length === 0 && !item.missing;
          return (
            <li key={`${item.bucket}/${item.path}`}>
              <button
                type="button"
                onClick={() => setOpen(item)}
                className="card-surface focus-visible:ring-ring w-full overflow-hidden p-0 text-left focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="bg-paper-2/40 relative aspect-[4/3]">
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.altText ?? ""}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-ink flex size-full flex-col items-center justify-center gap-1.5 text-xs">
                      <ImageOff className="size-6" aria-hidden />
                      {item.missing ? "Missing" : "No preview"}
                    </span>
                  )}

                  <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                    {item.missing && (
                      <span className="bg-error/90 text-paper inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.625rem] font-medium">
                        <AlertTriangle className="size-3" aria-hidden />
                        Missing
                      </span>
                    )}
                    {unused && (
                      <span className="bg-card/90 text-muted-ink rounded px-1.5 py-0.5 text-[0.625rem] font-medium">
                        Unused
                      </span>
                    )}
                    {item.isPrivate && (
                      <span className="bg-card/90 text-muted-ink rounded px-1.5 py-0.5 text-[0.625rem] font-medium">
                        Private
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <p
                    className="text-bark truncate text-sm font-medium"
                    title={item.path}
                  >
                    {item.fileName}
                  </p>
                  <p className="text-muted-ink mt-0.5 truncate text-xs">
                    <span className="num">{formatBytes(item.size)}</span>
                    {item.width && item.height && (
                      <>
                        {" · "}
                        <span className="num">
                          {item.width}×{item.height}
                        </span>
                      </>
                    )}
                    {" · "}
                    <span className="num">{formatDate(item.createdAt)}</span>
                  </p>
                  <p className="text-muted-ink mt-1 flex items-center gap-1 truncate text-xs">
                    <Link2 className="size-3 shrink-0" aria-hidden />
                    {item.usedBy.length === 0
                      ? "Not used"
                      : item.usedBy.length === 1
                        ? item.usedBy[0].entityName
                        : `${item.usedBy.length} places`}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Keyed so opening a different file remounts the dialog with fresh fields. */}
      {open && (
        <MediaPreviewDialog
          key={`${open.bucket}/${open.path}`}
          item={open}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
