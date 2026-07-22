import { Badge } from "@/components/ui/badge";

/** Stay status → a branded badge. Published = mist (live), Draft = neutral,
 *  Hidden/Archived = error-toned (off the public site). */
const META: Record<
  string,
  { tone: "mist" | "neutral" | "error"; label: string }
> = {
  PUBLISHED: { tone: "mist", label: "Published" },
  DRAFT: { tone: "neutral", label: "Draft" },
  HIDDEN: { tone: "error", label: "Hidden" },
  ARCHIVED: { tone: "error", label: "Archived" },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = META[status] ?? { tone: "neutral" as const, label: status };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
