"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, Check, RotateCcw, X } from "lucide-react";
import { uploadToLibrary } from "@/lib/admin-client";
import { cn } from "@/lib/utils";

type Job = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

/**
 * Drag-and-drop, multi-file uploader for the library.
 *
 * Files upload one at a time so the per-file state is honest (a failed file
 * shows its own error and can be retried without re-picking the others). A file
 * uploaded here lands in the bucket **unused** — nothing references it until an
 * editor attaches it — which is exactly how the library reports it.
 */
export function MediaUploader({ buckets }: { buckets: readonly string[] }) {
  const router = useRouter();
  const inputId = useId();
  const [bucket, setBucket] = useState(buckets[0] ?? "stays");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const seq = useRef(0);

  const run = async (job: Job, target: string) => {
    setJobs((js) =>
      js.map((j) =>
        j.id === job.id ? { ...j, status: "uploading", error: undefined } : j,
      ),
    );
    try {
      await uploadToLibrary(job.file, target);
      setJobs((js) =>
        js.map((j) => (j.id === job.id ? { ...j, status: "done" } : j)),
      );
      router.refresh();
    } catch (e) {
      setJobs((js) =>
        js.map((j) =>
          j.id === job.id
            ? { ...j, status: "error", error: (e as Error).message }
            : j,
        ),
      );
    }
  };

  const add = async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    const next: Job[] = list.map((file) => ({
      id: `u${seq.current++}`,
      file,
      status: "pending",
    }));
    setJobs((js) => [...js, ...next]);
    for (const job of next) await run(job, bucket);
  };

  const busy = jobs.some((j) => j.status === "uploading");

  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="heading-3 text-bark">Upload</h2>
        <label className="text-muted-ink flex items-center gap-2 text-sm">
          Bucket
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            aria-label="Upload to bucket"
            className="border-input bg-card text-ink focus-visible:ring-ring h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-2"
          >
            {buckets
              .filter((b) => b !== "reviews")
              .map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "mt-4 rounded-lg border border-dashed p-6 text-center transition-colors",
          dragging ? "border-clay bg-clay/5" : "border-border",
        )}
      >
        <UploadCloud className="text-muted-ink mx-auto size-7" aria-hidden />
        <p className="text-bark mt-2 text-sm font-medium">
          Drag files here, or{" "}
          <label
            htmlFor={inputId}
            className="text-clay cursor-pointer underline underline-offset-2"
          >
            browse
          </label>
        </p>
        <p className="text-muted-ink mt-1 text-xs">
          JPEG, PNG, WebP or AVIF. Uploads land unused until you attach them.
        </p>
        <input
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {jobs.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5">
          {jobs.map((j) => (
            <li
              key={j.id}
              className="border-border/60 flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm"
            >
              <span className="shrink-0">
                {j.status === "uploading" && (
                  <Loader2
                    className="text-muted-ink size-4 animate-spin"
                    aria-hidden
                  />
                )}
                {j.status === "done" && (
                  <Check className="text-mist size-4" aria-hidden />
                )}
                {j.status === "error" && (
                  <X className="text-error size-4" aria-hidden />
                )}
                {j.status === "pending" && (
                  <span className="bg-border block size-4 rounded-full" />
                )}
              </span>
              <span className="text-bark min-w-0 flex-1 truncate">
                {j.file.name}
              </span>
              {j.status === "error" && (
                <>
                  <span
                    className="text-error max-w-48 truncate text-xs"
                    title={j.error}
                  >
                    {j.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => run(j, bucket)}
                    disabled={busy}
                    className="text-muted-ink hover:text-bark inline-flex items-center gap-1 text-xs disabled:opacity-50"
                  >
                    <RotateCcw className="size-3.5" aria-hidden />
                    Retry
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
