import { BadgeCheck, Star } from "lucide-react";

/**
 * Placeholder — NOT the Home page.
 *
 * Phase 1 builds only the brand foundation; no product pages yet. This page
 * exists so the design system is visible and verifiable: it renders on paper,
 * in Fraunces / Inter / JetBrains Mono, using the token utilities from
 * globals.css. It will be replaced by the real Home page in Phase 2.
 */
export default function FoundationPlaceholder() {
  return (
    <main className="container-page section flex flex-1 flex-col justify-center">
      <p className="eyebrow">Plantation ledger · Chikmagalur</p>

      <h1 className="display mt-3 max-w-2xl">
        Escape the noise.
        <br />
        Stay in the Western Ghats.
      </h1>

      <p className="lede mt-5 max-w-xl">
        The design foundation is in place. Fonts, colours, spacing and the
        design language are configured — every page built next inherits them.
      </p>

      {/* A card, at the one resting elevation, showing the number + stamp rules. */}
      <div className="card-surface mt-10 max-w-sm p-5">
        <span className="stamp">
          <BadgeCheck className="text-mist size-3.5" aria-hidden />
          Inspected <span className="num">89</span>
        </span>

        <h3 className="heading-3 mt-4">CoffeeCharm</h3>
        <p className="text-muted-ink mt-1 text-sm">Coffee Estate Stay</p>

        <div className="border-border mt-4 flex items-baseline justify-between border-t pt-4">
          <span>
            <span className="num text-bark text-lg font-medium">₹4,500</span>
            <span className="text-muted-ink text-sm"> / night</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="fill-gold text-gold size-3.5" aria-hidden />
            <span className="num text-sm">4.8</span>
          </span>
        </div>
      </div>
    </main>
  );
}
