import { Container } from "./Container";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { MobileNavigation } from "./MobileNavigation";

/**
 * The global site header.
 *
 * Server Component — it holds no state. Sticky to the top on a paper ground
 * with a hairline base, so it stays available as the page scrolls without the
 * glass/shadow tricks the brand avoids. Desktop nav and the mobile drawer
 * trigger swap at `lg`.
 */
export function Header() {
  return (
    <header className="border-border bg-paper/95 supports-[backdrop-filter]:bg-paper/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo priority />
        <Navigation />
        <MobileNavigation />
      </Container>
    </header>
  );
}
