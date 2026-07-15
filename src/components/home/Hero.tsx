import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeSearch } from "./HomeSearch";

/**
 * Hero — the immersive first impression.
 *
 * A muted, looping plantation video fills the section on tablet and up; on
 * mobile it falls back to a still poster (video is bandwidth this audience,
 * mostly on Indian mobile data, should not have to spend). A bark overlay plus
 * a bottom gradient keep the paper text readable over any frame — the one
 * sanctioned gradient in the brand, purely for legibility.
 *
 * A Server Component: the video and poster are static assets, the copy is
 * static, and the only interactive piece — the search bar — is its own small
 * client island. Sells Chikmagalur before it sells a room.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[34rem] flex-col justify-center overflow-hidden md:min-h-[40rem]">
      {/* Background media — the plantation video on every screen, with the
          poster as its still fallback until it plays (and if it can't). */}
      <div className="absolute inset-0 -z-10">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero/hero-poster.jpg"
          aria-hidden
        >
          <source src="/hero/hero-background.mp4" type="video/mp4" />
        </video>
        {/* Legibility: a flat bark wash + a stronger gradient at the foot. */}
        <div aria-hidden className="bg-bark/45 absolute inset-0" />
        <div
          aria-hidden
          className="from-bark/70 via-bark/10 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>

      <div className="container-page flex w-full flex-col py-10 md:py-14">
        <div className="animate-fade-up max-w-2xl">
          <p className="eyebrow text-paper/80">
            Plantation stays · Chikmagalur · Western Ghats
          </p>
          <h1 className="display text-paper mt-4 text-balance">
            Escape the noise.
            <br />
            Stay in the Western Ghats.
          </h1>
          <p className="text-paper/85 mt-5 max-w-xl text-lg leading-relaxed">
            Handpicked, personally inspected plantation stays — coffee estates,
            heritage bungalows and riverside cottages, each one visited before
            it earns a place here.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/explore">
                Explore stays
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-paper/40 text-paper hover:bg-paper/10 hover:text-paper bg-transparent"
            >
              <Link href="/travel-guide">Read the travel guide</Link>
            </Button>
          </div>
        </div>

        {/* Search — visually part of the hero, sitting in its lower third. */}
        <div className="animate-fade-up mt-8 w-full [animation-delay:150ms] md:mt-10">
          <HomeSearch />
        </div>
      </div>
    </section>
  );
}
