"use client";

import { useState } from "react";
import { FileText, MessageSquare, CalendarDays } from "lucide-react";
import type { StayFormValues } from "@/lib/stay-form";
import type { AmenityOption } from "@/services/admin-stay.service";
import { StayForm } from "@/components/admin/stays/StayForm";
import { ReviewsModeration } from "@/components/admin/stays/ReviewsModeration";
import { AvailabilityCalendar } from "@/components/admin/stays/AvailabilityCalendar";
import { cn } from "@/lib/utils";

type Tab = "content" | "reviews" | "availability";

/**
 * The edit-stay workspace — the content form plus the two sibling collections
 * that aren't part of the big save: reviews (moderation) and availability
 * (calendar). Tabs keep them one click apart without leaving the stay.
 */
export function StayEditorTabs({
  stayId,
  defaultValues,
  amenities,
}: {
  stayId: string;
  defaultValues: StayFormValues;
  amenities: AmenityOption[];
}) {
  const [tab, setTab] = useState<Tab>("content");

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "content", label: "Content", icon: FileText },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "availability", label: "Availability", icon: CalendarDays },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Stay editor"
        className="border-border mb-6 flex gap-1 border-b"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-clay text-bark"
                : "text-muted-ink hover:text-bark border-transparent",
            )}
          >
            <t.icon className="size-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {/* Keep the form mounted so unsaved edits survive a tab switch. */}
      <div className={tab === "content" ? "" : "hidden"}>
        <StayForm
          mode="edit"
          stayId={stayId}
          defaultValues={defaultValues}
          amenities={amenities}
        />
      </div>
      {tab === "reviews" && <ReviewsModeration stayId={stayId} />}
      {tab === "availability" && <AvailabilityCalendar stayId={stayId} />}
    </div>
  );
}
