import Link from "next/link";
import { Compass, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/marketing/ErrorState";

/**
 * The branded 404. Rendered by Next for any unmatched route (and any
 * `notFound()` call), within the root layout — so the header and footer stay,
 * and the friendly panel sits in the `<main>`. The 404 status it returns is
 * what keeps it out of search indexes; no metadata needed.
 */
export default function NotFound() {
  return (
    <ErrorState
      code="404"
      icon={Compass}
      title="This trail doesn’t lead anywhere"
      description="The page you’re after has moved, or perhaps never existed. No harm done — let’s get you back to the good stuff."
    >
      <Button asChild size="lg">
        <Link href="/">
          <Home className="size-4" aria-hidden />
          Back to home
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/explore">
          Explore stays
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </ErrorState>
  );
}
