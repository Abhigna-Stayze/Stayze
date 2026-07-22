"use client";

import { useId, useState } from "react";
import { ImagePlus, X, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { uploadImage } from "@/lib/admin-client";
import { cn } from "@/lib/utils";

type Ref = { bucket: string; path: string; url?: string | null };
type GalleryRef = Ref & {
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};
type Kind = "cover" | "gallery" | "menu" | "owner-photo" | "experience";

/**
 * A single controlled image field — cover, owner photo, or the menu photo.
 *
 * Selecting a file uploads it straight to Supabase Storage (`/api/admin/upload`)
 * and stores the returned `{ bucket, path, url }` in the form; the preview is
 * that URL. "Remove" clears the field; picking another file replaces it. The
 * uploaded object is only wired to the stay when the form is saved.
 */
export function ImageField({
  value,
  onChange,
  kind,
  aspect = "aspect-[4/3]",
  className,
}: {
  value: Ref | null;
  onChange: (v: Ref | null) => void;
  kind: Kind;
  aspect?: string;
  className?: string;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const up = await uploadImage(file, kind);
      onChange({ bucket: up.bucket, path: up.path, url: up.url });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <div
        className={cn(
          "border-border bg-paper-2/40 relative overflow-hidden rounded-lg border",
          aspect,
        )}
      >
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="" className="size-full object-cover" />
        ) : (
          <label
            htmlFor={id}
            className="text-muted-ink hover:text-clay flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-sm"
          >
            {busy ? (
              <Loader2 className="size-6 animate-spin" aria-hidden />
            ) : (
              <>
                <ImagePlus className="size-6" aria-hidden />
                Upload image
              </>
            )}
          </label>
        )}

        {value?.url && (
          <div className="absolute top-2 right-2 flex gap-1.5">
            <label
              htmlFor={id}
              className="bg-card/90 text-bark hover:bg-card grid size-8 cursor-pointer place-items-center rounded-md text-xs font-medium shadow-sm backdrop-blur-sm"
              title="Replace"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-4" aria-hidden />
              )}
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-card/90 text-error hover:bg-card grid size-8 place-items-center rounded-md shadow-sm backdrop-blur-sm"
              title="Remove"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error && <p className="text-error mt-1.5 text-xs">{error}</p>}
    </div>
  );
}

/**
 * A controlled gallery — many images with remove and reorder. The first image
 * on save becomes the hero if no separate cover is set, but the cover field
 * owns the hero here, so this is purely the supporting gallery. Order is edited
 * with the arrow buttons and persisted as `sortOrder`.
 */
export function GalleryField({
  value,
  onChange,
}: {
  value: GalleryRef[];
  onChange: (v: GalleryRef[]) => void;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) => uploadImage(f, "gallery")),
      );
      onChange([
        ...value,
        ...uploaded.map((u) => ({
          bucket: u.bucket,
          path: u.path,
          url: u.url,
          width: u.width,
          height: u.height,
        })),
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, i) => (
          <div
            key={`${img.bucket}/${img.path}`}
            className="border-border bg-paper-2/40 group relative aspect-[4/3] overflow-hidden rounded-lg border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url ?? ""}
              alt=""
              className="size-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move left"
                  className="text-paper grid size-6 place-items-center rounded bg-black/40 disabled:opacity-30"
                >
                  <ArrowLeft className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label="Move right"
                  className="text-paper grid size-6 place-items-center rounded bg-black/40 disabled:opacity-30"
                >
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="grid size-6 place-items-center rounded bg-black/40 text-red-300"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        ))}

        <label
          htmlFor={id}
          className="border-border text-muted-ink hover:text-clay hover:border-clay/50 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm"
        >
          {busy ? (
            <Loader2 className="size-6 animate-spin" aria-hidden />
          ) : (
            <>
              <ImagePlus className="size-6" aria-hidden />
              Add
            </>
          )}
        </label>
      </div>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        onChange={(e) => add(e.target.files)}
      />
      {error && <p className="text-error mt-1.5 text-xs">{error}</p>}
    </div>
  );
}
