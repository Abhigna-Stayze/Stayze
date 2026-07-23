"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Copy,
  Check,
  Download,
  Trash2,
  Loader2,
  ImageOff,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";
import type { MediaItem } from "@/services/admin-media.service";
import { updateMediaMeta, deleteMedia, replaceMedia } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBytes, formatDate } from "@/components/admin/media/MediaGrid";

/**
 * The media detail dialog — full-size preview plus every per-file action:
 * copy public URL, download, edit alt text/caption, replace the bytes, delete.
 *
 * Two rules the UI enforces honestly rather than hiding:
 *  - **Alt text and caption only persist for stay images.** `StayImage` is the
 *    only model with those columns, so for anything else the fields are absent
 *    with the reason shown.
 *  - **Deleting a file that is still used** requires a second, explicit confirm
 *    that lists exactly what will lose its image; the server detaches every
 *    reference in one transaction so nothing is left pointing at a dead path.
 *
 * The caller mounts this with a `key` of the file's bucket/path, so opening a
 * different file remounts it and the editable fields re-initialise — no effect
 * syncing props into state.
 */
export function MediaPreviewDialog({
  item,
  onClose,
}: {
  item: MediaItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [altText, setAltText] = useState(item.altText ?? "");
  const [caption, setCaption] = useState(item.caption ?? "");
  const [busy, setBusy] = useState<null | "meta" | "delete" | "replace">(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmUsed, setConfirmUsed] = useState(false);

  const used = item.usedBy.length > 0;

  const saveMeta = async () => {
    setError(null);
    setBusy("meta");
    try {
      await updateMediaMeta({
        bucket: item.bucket,
        path: item.path,
        altText,
        caption,
      });
      router.refresh();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (used && !confirmUsed) {
      setConfirmUsed(true);
      return;
    }
    setError(null);
    setBusy("delete");
    try {
      await deleteMedia(item.bucket, item.path, used);
      router.refresh();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const replace = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy("replace");
    try {
      await replaceMedia(file, item.bucket, item.path);
      router.refresh();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const copyUrl = async () => {
    if (!item.url) return;
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy to the clipboard.");
    }
  };

  return (
    <Dialog.Root open onOpenChange={(o) => !o && !busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-bark/50 fixed inset-0 z-50 backdrop-blur-sm" />
        <Dialog.Content className="card-float fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-0 outline-none">
          <div className="border-border flex items-start justify-between gap-4 border-b p-4 sm:p-5">
            <div className="min-w-0">
              <Dialog.Title className="heading-3 text-bark truncate">
                {item.fileName}
              </Dialog.Title>
              <Dialog.Description className="text-muted-ink mt-0.5 truncate font-mono text-xs">
                {item.bucket}/{item.path}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="text-muted-ink hover:bg-paper-2 hover:text-bark grid size-8 shrink-0 place-items-center rounded-md"
              >
                <X className="size-4" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[1.4fr_1fr]">
            {/* Preview */}
            <div className="bg-paper-2/40 border-border grid min-h-48 place-items-center overflow-hidden rounded-lg border">
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.altText ?? ""}
                  className="max-h-[50vh] w-full object-contain"
                />
              ) : (
                <span className="text-muted-ink flex flex-col items-center gap-2 p-8 text-sm">
                  <ImageOff className="size-7" aria-hidden />
                  {item.missing
                    ? "This file is missing from storage."
                    : "No preview available."}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-4 text-sm">
              {item.missing && (
                <p className="border-error/30 bg-error/10 text-error flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  Referenced but not in storage — wherever this is used shows a
                  broken image.
                </p>
              )}

              <dl className="flex flex-col gap-1.5">
                <Row label="Type" value={item.mimeType ?? "—"} />
                <Row label="Size" value={formatBytes(item.size)} mono />
                <Row
                  label="Dimensions"
                  value={
                    item.width && item.height
                      ? `${item.width}×${item.height}`
                      : "—"
                  }
                  mono
                />
                <Row label="Uploaded" value={formatDate(item.createdAt)} mono />
                <Row label="Bucket" value={item.bucket} />
              </dl>

              <div>
                <p className="eyebrow text-muted-ink mb-1.5">Used by</p>
                {item.usedBy.length === 0 ? (
                  <p className="text-muted-ink text-xs">
                    Nothing references this file — safe to delete.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {item.usedBy.map((u, i) => (
                      <li key={i} className="text-xs">
                        {u.href ? (
                          <Link
                            href={u.href}
                            className="text-clay underline underline-offset-2"
                          >
                            {u.entityName}
                          </Link>
                        ) : (
                          <span className="text-bark">{u.entityName}</span>
                        )}
                        <span className="text-muted-ink"> · {u.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.url && !item.isPrivate && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyUrl}
                    className="h-9"
                  >
                    {copied ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      <Copy className="size-4" aria-hidden />
                    )}
                    {copied ? "Copied" : "Copy URL"}
                  </Button>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    download={item.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border text-bark hover:bg-paper-2 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium"
                  >
                    <Download className="size-4" aria-hidden />
                    Download
                  </a>
                )}
              </div>
              {item.isPrivate && (
                <p className="text-muted-ink text-xs">
                  Guest photos live in a private bucket — the preview is a
                  short-lived signed link, so there is no public URL to copy.
                </p>
              )}
            </div>
          </div>

          {/* Editable meta */}
          <div className="border-border border-t p-4 sm:p-5">
            {item.editableMeta ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Alt text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
                <Input
                  label="Caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            ) : (
              <p className="text-muted-ink text-xs">
                Alt text and caption are only stored for stay images — no other
                model has those columns, so there is nowhere to keep them for
                this file.
              </p>
            )}

            {error && (
              <p role="alert" className="text-error mt-3 text-sm">
                {error}
              </p>
            )}

            {confirmUsed && (
              <p
                role="alert"
                className="border-error/30 bg-error/10 text-error mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                This file is used by {item.usedBy.length} item
                {item.usedBy.length === 1 ? "" : "s"}. Deleting it removes the
                image from {item.usedBy.length === 1 ? "it" : "them"}. Press
                Delete again to confirm.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              {!item.missing && (
                <label className="border-border text-bark hover:bg-paper-2 inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium">
                  {busy === "replace" ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="size-4" aria-hidden />
                  )}
                  Replace
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    disabled={busy !== null}
                    onChange={(e) => replace(e.target.files?.[0])}
                  />
                </label>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={remove}
                disabled={busy !== null}
                className="border-error/40 text-error hover:bg-error/10 h-9"
              >
                {busy === "delete" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
                {confirmUsed ? "Delete anyway" : "Delete"}
              </Button>
              {item.editableMeta && (
                <Button
                  type="button"
                  onClick={saveMeta}
                  disabled={busy !== null}
                  className="h-9"
                >
                  {busy === "meta" && (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  )}
                  Save
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-ink text-xs">{label}</dt>
      <dd
        className={`text-bark truncate text-xs ${mono ? "num" : ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
