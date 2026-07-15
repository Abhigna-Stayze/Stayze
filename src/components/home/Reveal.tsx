"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — a subtle on-enter fade-up for a section.
 *
 * Progressive enhancement, done imperatively (no React state, so nothing
 * re-renders and the effect stays lint-clean):
 *
 *  - The server renders the children fully visible. If JavaScript never runs,
 *    or the browser has no IntersectionObserver, the content simply stays
 *    visible — the animation is never a prerequisite for reading the page.
 *  - On mount, only for a section that is still *below* the fold and only when
 *    the visitor hasn't asked to reduce motion, it adds the `.reveal` resting
 *    state (down + transparent) and flips `data-revealed` when the section
 *    scrolls into view. Above-the-fold content is left untouched, so nothing
 *    flashes on first paint.
 *
 * The motion itself (transform + opacity only) lives in the `.reveal` utility
 * in globals.css. Children are passed straight through, so they stay Server
 * Components — no server code enters the client bundle.
 */
export function Reveal({
  children,
  delayMs = 0,
  className,
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Don't animate what's already on screen — avoids a first-paint flash.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    el.classList.add("reveal");
    if (delayMs) el.style.transitionDelay = `${delayMs}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-revealed", "true");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
