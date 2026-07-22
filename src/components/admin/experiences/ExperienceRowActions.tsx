"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Send,
  EyeOff,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { setExperiencePublished, deleteExperience } from "@/lib/admin-client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const ICON_BTN =
  "text-muted-ink hover:bg-paper-2 hover:text-bark focus-visible:ring-ring grid size-8 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50";

/**
 * Row actions for one experience — Preview, Edit, Publish/Unpublish, Delete.
 * The status toggle and delete call the REST API then `router.refresh()` so the
 * server-rendered table reflects the change without a full reload. Delete is a
 * hard delete (the model has no soft-delete column), so it's confirmed. An
 * action error surfaces inline.
 */
export function ExperienceRowActions({
  id,
  title,
  slug,
  isPublished,
}: {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "status" | "delete">(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setError(null);
    setBusy("status");
    try {
      await setExperiencePublished(id, !isPublished);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    await deleteExperience(id);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-0.5">
      {error && (
        <span
          className="text-error mr-1 max-w-40 truncate text-xs"
          title={error}
        >
          {error}
        </span>
      )}

      {isPublished && (
        <a
          href={`/experiences/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={ICON_BTN}
          aria-label={`Preview ${title}`}
          title="Preview"
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
      )}
      <Link
        href={`/admin/experiences/${id}/edit`}
        className={ICON_BTN}
        aria-label={`Edit ${title}`}
      >
        <Pencil className="size-4" aria-hidden />
      </Link>

      <button
        type="button"
        onClick={toggle}
        disabled={busy !== null}
        className={ICON_BTN}
        aria-label={isPublished ? `Unpublish ${title}` : `Publish ${title}`}
        title={isPublished ? "Unpublish" : "Publish"}
      >
        {busy === "status" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : isPublished ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
      </button>

      <ConfirmDialog
        title={`Delete “${title}”?`}
        description="This permanently removes the experience and unassigns it from every stay. This can’t be undone."
        confirmLabel="Delete experience"
        destructive
        onConfirm={remove}
        trigger={
          <button
            type="button"
            className={ICON_BTN}
            aria-label={`Delete ${title}`}
            title="Delete"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        }
      />
    </div>
  );
}
