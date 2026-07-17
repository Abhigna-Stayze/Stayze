import { SearchX } from "lucide-react";
import { TripLookupForm } from "./TripLookupForm";

/**
 * The "we couldn't find that trip" state.
 *
 * Rendered inline on `/trip/[reference]` rather than as a hard 404, so a guest
 * who mistyped a character can fix it right here without losing the page. It
 * deliberately does not say *why* — wrong code, cancelled, never existed — both
 * because a reference is semi-secret (don't help anyone probe which codes are
 * real) and because the fix is the same either way: check it and try again.
 */
export function TripNotFound({ reference }: { reference?: string }) {
  return (
    <div className="container-page section flex flex-col items-center text-center">
      <span className="bg-paper-2 text-bark/60 inline-flex size-14 items-center justify-center rounded-full">
        <SearchX className="size-7" aria-hidden />
      </span>
      <h1 className="heading-2 text-bark mt-6">We couldn’t find that trip</h1>
      <p className="text-muted-ink mt-2 max-w-md text-sm">
        {reference ? (
          <>
            Nothing matches <span className="num text-bark">{reference}</span>.
            Double-check the code from your confirmation — it’s easy to mix up
            an O and a 0.
          </>
        ) : (
          <>
            Check the code from your confirmation — it’s easy to mix up an O and
            a 0.
          </>
        )}
      </p>
      <div className="mt-8 w-full max-w-sm text-left">
        <TripLookupForm autoFocus />
      </div>
    </div>
  );
}
