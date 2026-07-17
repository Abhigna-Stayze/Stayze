"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudOff, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/marketing/ErrorState";

/**
 * The branded 500 / runtime-error boundary.
 *
 * A Client Component (required for `error.tsx`) that catches unexpected errors
 * in the route tree and shows a calm, non-technical panel — never a stack trace
 * or a digest, which are logged for us, not shown to a guest. `reset()` retries
 * the segment; the Home link is the escape hatch if it keeps failing.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged for debugging; the guest never sees the detail.
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="500"
      icon={CloudOff}
      title="Something went wrong on our end"
      description="A mist rolled in and we lost the thread for a moment. It’s not you — try again, and if it keeps happening, we’re a message away."
    >
      <Button size="lg" onClick={reset}>
        <RotateCcw className="size-4" aria-hidden />
        Try again
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/">
          <Home className="size-4" aria-hidden />
          Back to home
        </Link>
      </Button>
    </ErrorState>
  );
}
