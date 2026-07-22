"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Send, EyeOff, Trash2, Loader2 } from "lucide-react";
import { setStayStatus, deleteStay } from "@/lib/admin-client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const ICON_BTN =
  "text-muted-ink hover:bg-paper-2 hover:text-bark focus-visible:ring-ring grid size-8 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50";

/**
 * Row actions for one stay — View, Edit, Publish/Unpublish, Delete. The status
 * toggle and delete call the REST API then `router.refresh()` so the
 * server-rendered table reflects the change without a full reload. Delete is
 * guarded by a confirmation dialog (soft delete — recoverable). An action error
 * (e.g. "add a cover photo before publishing") surfaces inline.
 */
export function StayRowActions({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "status" | "delete">(null);
  const [error, setError] = useState<string | null>(null);

  const isPublished = status === "PUBLISHED";

  const toggle = async () => {
    setError(null);
    setBusy("status");
    try {
      await setStayStatus(id, isPublished ? "HIDDEN" : "PUBLISHED");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    await deleteStay(id);
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

      <Link
        href={`/admin/stays/${id}`}
        className={ICON_BTN}
        aria-label={`View ${name}`}
      >
        <Eye className="size-4" aria-hidden />
      </Link>
      <Link
        href={`/admin/stays/${id}/edit`}
        className={ICON_BTN}
        aria-label={`Edit ${name}`}
      >
        <Pencil className="size-4" aria-hidden />
      </Link>

      <button
        type="button"
        onClick={toggle}
        disabled={busy !== null}
        className={ICON_BTN}
        aria-label={isPublished ? `Unpublish ${name}` : `Publish ${name}`}
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
        title={`Delete “${name}”?`}
        description="This removes the stay from the admin list and the public site. It’s a soft delete — the record is kept and can be restored."
        confirmLabel="Delete stay"
        destructive
        onConfirm={remove}
        trigger={
          <button
            type="button"
            className={ICON_BTN}
            aria-label={`Delete ${name}`}
            title="Delete"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        }
      />
    </div>
  );
}
