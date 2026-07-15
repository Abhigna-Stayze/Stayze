import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineStatus = "locked" | "active" | "complete";

const STATUS_META: Record<
  TimelineStatus,
  { label: string; accent: string; eyebrow: string }
> = {
  complete: {
    label: "Complete",
    accent: "border-l-mist",
    eyebrow: "text-mist",
  },
  active: {
    label: "Active",
    accent: "border-l-clay",
    eyebrow: "text-clay",
  },
  locked: {
    label: "Locked",
    accent: "border-l-border",
    eyebrow: "text-muted-ink",
  },
};

/**
 * TimelineStep — one node of the trip timeline.
 *
 * The nine steps from "Booking confirmed" to "Leave a review", each `locked`
 * (grey), `active` (clay) or `complete` (mist ✓). A left accent border and a
 * mono status eyebrow carry the state; the title and its line of copy sit
 * below, with an optional `children` slot for a node's own content (a forecast,
 * directions, the caretaker card once unlocked).
 *
 * Presentational: the caller decides each node's status. A locked node reads
 * dimmer but is never hidden, so the guest can see what is still to come. The
 * spec's access rules (a caretaker's number stays null until the booking is
 * confirmed) are enforced by the API, not here — this only renders what it is
 * given.
 */
export function TimelineStep({
  status,
  title,
  description,
  children,
  className,
}: {
  status: TimelineStatus;
  title: string;
  description?: string | null;
  children?: React.ReactNode;
  className?: string;
}) {
  const meta = STATUS_META[status];

  return (
    <div
      className={cn(
        "card-surface border-l-4 p-4",
        meta.accent,
        status === "locked" && "opacity-70",
        className,
      )}
    >
      <p
        className={cn("eyebrow inline-flex items-center gap-1.5", meta.eyebrow)}
      >
        {status === "complete" && (
          <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
        )}
        {status === "active" && (
          <span aria-hidden className="bg-clay size-2 rounded-full" />
        )}
        {status === "locked" && <Lock className="size-3" aria-hidden />}
        {meta.label}
      </p>

      <h3 className="text-bark mt-2 text-sm font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-ink mt-1 text-sm">{description}</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
