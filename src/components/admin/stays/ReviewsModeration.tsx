"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Star,
  Check,
  EyeOff,
  Trash2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { moderateReview, removeReview } from "@/lib/admin-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type Review = {
  id: string;
  guestName: string;
  rating: number;
  title: string | null;
  comment: string;
  stayedOn: string | null;
  source: string;
  isPublished: boolean;
  imageCount: number;
};

/**
 * Reviews moderation — approve, hide or delete guest reviews. Content is never
 * editable (only moderated). Each action goes through the review service, which
 * recomputes the stay's rating, so the star average stays true. Reviews load
 * over REST on mount and refresh after every action.
 */
export function ReviewsModeration({ stayId }: { stayId: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/stays/${stayId}/reviews`);
    const json = await res.json();
    if (json.success) setReviews(json.data);
  }, [stayId]);

  useEffect(() => {
    // Fetch on mount; the state update happens after the network round trip.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>, id: string) => {
    setBusy(id);
    try {
      await fn();
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (reviews === null) {
    return (
      <div className="text-muted-ink flex items-center gap-2 py-10 text-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading reviews…
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border-border bg-card flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
        <span className="bg-paper-2 text-bark/50 mb-4 inline-flex size-12 items-center justify-center rounded-full">
          <MessageSquare className="size-6" aria-hidden />
        </span>
        <p className="text-bark font-medium">No reviews yet</p>
        <p className="text-muted-ink mt-1 text-sm">
          Guest reviews will appear here to approve or hide.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <div key={r.id} className="card-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-bark font-medium">{r.guestName}</span>
                <span className="text-gold inline-flex items-center gap-0.5 text-sm">
                  <Star className="size-3.5 fill-current" aria-hidden />
                  <span className="num">{r.rating}</span>
                </span>
                <Badge tone="neutral">{r.source}</Badge>
                <Badge tone={r.isPublished ? "mist" : "gold"}>
                  {r.isPublished ? "Published" : "Pending"}
                </Badge>
                {r.imageCount > 0 && (
                  <span className="text-muted-ink text-xs">
                    <span className="num">{r.imageCount}</span> photo
                    {r.imageCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              {r.title && (
                <p className="text-bark mt-2 font-medium">{r.title}</p>
              )}
              <p className="text-muted-ink mt-1 text-sm leading-relaxed">
                {r.comment}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {r.isPublished ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === r.id}
                  onClick={() => act(() => moderateReview(r.id, false), r.id)}
                >
                  <EyeOff className="size-4" aria-hidden />
                  Hide
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={busy === r.id}
                  onClick={() => act(() => moderateReview(r.id, true), r.id)}
                >
                  <Check className="size-4" aria-hidden />
                  Approve
                </Button>
              )}
              <ConfirmDialog
                title="Delete this review?"
                description="This permanently removes the review and recomputes the rating."
                confirmLabel="Delete"
                destructive
                onConfirm={() => act(() => removeReview(r.id), r.id)}
                trigger={
                  <button
                    type="button"
                    aria-label="Delete review"
                    className="text-error hover:bg-error/10 grid size-9 place-items-center rounded-md"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
