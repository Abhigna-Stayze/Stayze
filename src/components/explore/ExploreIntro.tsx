"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  BUDGET_OPTIONS,
  GUEST_OPTIONS,
  type ExploreFilters,
} from "@/lib/explore-filters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Selection = Pick<ExploreFilters, "budget" | "guests">;

/**
 * ExploreIntro — a two-step welcome that tailors the page to the visitor.
 *
 * On entering Explore (with no filters already in the URL) this asks two quick
 * questions — budget, then group size — one screen at a time, then reveals the
 * results filtered to those answers. Skipping shows the full collection.
 *
 * Built on Radix Dialog for the focus trap, Escape and scroll lock. Controlled
 * and presentational: `ExploreClient` decides when it opens and applies the
 * answer (which updates the URL and refetches). Motion is opacity/transform
 * only, per step; a reduced-motion visitor gets the steps without the fade.
 */
export function ExploreIntro({
  open,
  initial,
  onApply,
  onSkip,
}: {
  open: boolean;
  initial: Selection;
  onApply: (selection: Selection) => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(initial.budget);
  const [guests, setGuests] = useState<number | null>(initial.guests);

  const isLast = step === 1;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onSkip()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-bark/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm" />
        <Dialog.Content className="card-float data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[calc(100dvh-2rem)] max-w-lg -translate-y-1/2 overflow-y-auto p-6 duration-200 outline-none sm:p-9">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-clay">Let’s find your stay</p>
            <div className="flex items-center gap-1.5" aria-hidden>
              <span
                className={
                  "h-1.5 rounded-full transition-[width,background-color] duration-300 " +
                  (step === 0 ? "bg-clay w-5" : "bg-border w-1.5")
                }
              />
              <span
                className={
                  "h-1.5 rounded-full transition-[width,background-color] duration-300 " +
                  (step === 1 ? "bg-clay w-5" : "bg-border w-1.5")
                }
              />
            </div>
          </div>

          {/* One question at a time; the key restarts the fade on each step. */}
          <div key={step} className="animate-fade-up mt-5">
            {step === 0 ? (
              <>
                <Dialog.Title className="heading-2 text-bark">
                  What’s your budget a night?
                </Dialog.Title>
                <Dialog.Description className="text-muted-ink mt-2">
                  We’ll show stays that fit — you can change it any time.
                </Dialog.Description>
                <div className="mt-6 flex flex-col gap-3">
                  {BUDGET_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      selected={budget === opt.value}
                      onClick={() => setBudget(opt.value)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <Dialog.Title className="heading-2 text-bark">
                  How many of you?
                </Dialog.Title>
                <Dialog.Description className="text-muted-ink mt-2">
                  So we only show stays that sleep your whole group.
                </Dialog.Description>
                <div className="mt-6 flex flex-col gap-3">
                  {GUEST_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      selected={(guests ? String(guests) : "") === opt.value}
                      onClick={() =>
                        setGuests(opt.value ? Number(opt.value) : null)
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip · browse all
            </Button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(0)}
                  aria-label="Back"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back
                </Button>
              )}
              {isLast ? (
                <Button size="sm" onClick={() => onApply({ budget, guests })}>
                  See stays
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setStep(1)}>
                  Next
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-offset-card flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left text-base transition-[color,background-color,border-color] duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        selected
          ? "border-clay bg-clay/10 text-bark font-medium"
          : "border-border text-bark hover:border-clay/50 hover:bg-paper-2/50",
      )}
    >
      {label}
      {selected && <Check className="text-clay size-5" aria-hidden />}
    </button>
  );
}
