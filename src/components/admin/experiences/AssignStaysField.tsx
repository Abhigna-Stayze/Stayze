"use client";

import { useMemo, useState } from "react";
import { Search, X, Check } from "lucide-react";
import type { StayOption } from "@/services/admin-experience.service";

/**
 * A searchable multi-select for assigning stays to an experience. Controlled:
 * `value` is the selected stay ids, `onChange` gets the next set. Selected stays
 * show as removable chips; a search box filters the checkbox list below. Draft
 * stays are marked, since a link to one won't surface publicly until it's live.
 */
export function AssignStaysField({
  options,
  value,
  onChange,
}: {
  options: StayOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const chosen = options.filter((o) => selected.has(o.id));

  return (
    <div className="flex flex-col gap-3">
      {chosen.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chosen.map((o) => (
            <span
              key={o.id}
              className="border-border bg-paper-2 text-bark inline-flex items-center gap-1.5 rounded-full border py-1 pr-1 pl-3 text-sm"
            >
              {o.name}
              <button
                type="button"
                onClick={() => toggle(o.id)}
                aria-label={`Remove ${o.name}`}
                className="text-muted-ink hover:bg-border hover:text-bark grid size-5 place-items-center rounded-full"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-muted-ink text-sm">No stays assigned yet.</p>
      )}

      <div className="relative">
        <Search
          className="text-muted-ink pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stays to assign…"
          aria-label="Search stays"
          className="border-input bg-card text-ink placeholder:text-muted-ink/70 focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>

      <div className="border-border max-h-64 overflow-y-auto rounded-md border">
        {filtered.length === 0 ? (
          <p className="text-muted-ink px-3 py-6 text-center text-sm">
            No stays match “{query}”.
          </p>
        ) : (
          <ul>
            {filtered.map((o) => {
              const on = selected.has(o.id);
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => toggle(o.id)}
                    className="hover:bg-paper-2/50 border-border/60 flex w-full items-center gap-3 border-b px-3 py-2.5 text-left text-sm last:border-0"
                  >
                    <span
                      className={
                        on
                          ? "bg-clay border-clay text-paper grid size-5 shrink-0 place-items-center rounded border"
                          : "border-border grid size-5 shrink-0 place-items-center rounded border"
                      }
                    >
                      {on && <Check className="size-3.5" aria-hidden />}
                    </span>
                    <span className="text-bark flex-1 truncate">{o.name}</span>
                    {o.status !== "PUBLISHED" && (
                      <span className="text-muted-ink text-xs">Draft</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
