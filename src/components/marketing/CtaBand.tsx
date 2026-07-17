import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CtaBand — the closing call-to-action panel on a static page.
 *
 * The bark ledger panel used to end About (and anywhere a page wants to send
 * the reader onward). A heading, a line of copy, and a primary + optional
 * secondary action. Presentational.
 */
export function CtaBand({
  title,
  copy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  copy: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="bg-bark text-paper rounded-lg p-8 text-center sm:p-12">
      <h2 className="heading-1 text-paper text-balance">{title}</h2>
      <p className="text-paper/80 mx-auto mt-4 max-w-xl text-base leading-relaxed">
        {copy}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href={primaryHref}>
            {primaryLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        {secondaryHref && secondaryLabel && (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-paper border-paper/30 hover:bg-paper/10"
          >
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
