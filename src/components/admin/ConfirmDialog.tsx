"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A branded confirmation dialog for a destructive or significant action.
 *
 * Radix Dialog gives the focus trap, Escape-to-close, scroll lock and focus
 * return for free. `onConfirm` may be async; the confirm button shows a spinner
 * and both buttons disable until it settles, then the dialog closes. Reusable
 * across the admin (delete a stay, and future modules).
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-bark/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm" />
        <Dialog.Content className="card-float data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 duration-150 outline-none">
          <div className="flex gap-4">
            {destructive && (
              <span className="bg-error/10 text-error inline-flex size-10 shrink-0 items-center justify-center rounded-full">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              <Dialog.Title className="heading-3 text-bark">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-muted-ink mt-1.5 text-sm leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={busy}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant={destructive ? "primary" : "primary"}
              onClick={confirm}
              disabled={busy}
              className={destructive ? "bg-error hover:bg-error/90" : undefined}
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
