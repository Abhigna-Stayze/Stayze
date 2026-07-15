# public/ — static frontend assets

Everything the browser loads directly by URL. Organized so development is never
blocked by a missing or misfiled asset. **Drop real media into the matching
folder and it just works** — the paths below are the contract.

## Structure

```
public/
  brand/         Logo system — 12 SVGs (lockups, wordmark, icon, stamp, placemark).
                 REFERENCED by code (api/docs favicon) — do not rename or move.
  icons/         Custom UI icon SVGs that lucide-react does NOT provide.
                 Generic icons (phone, mail, map-pin, chevrons…) come from
                 lucide-react in code — do not add SVGs for those.
  hero/          Home hero media. EMPTY — awaiting real photography (see below).
  og/            Open Graph / social share images. stayze-avatar-512.png is the
                 real roofline-on-bark avatar (also the Instagram profile photo).
  placeholders/  Branded fallbacks shown when real media is missing. Temporary
                 by design — they disappear once real assets land.
  swagger/       Generated API-docs assets (postinstall). Not a design asset.
```

Favicon is **not** here — Next.js serves it from `src/app/icon.svg` and
`src/app/apple-icon.png` (metadata convention). Already in place.

## Where real media goes (drop zones)

| Put the file here                  | Named like                   | Used by                        |
| ---------------------------------- | ---------------------------- | ------------------------------ |
| `hero/hero-desktop.jpg`            | one wide landscape, ≥ 2000px | Home hero, desktop             |
| `hero/hero-mobile.jpg`             | one portrait/square crop     | Home hero, mobile              |
| `hero/hero.mp4` + `hero/hero.webm` | 30–60s, muted, ≤ ~6 MB       | Home hero video (desktop only) |
| `hero/hero-poster.jpg`             | first frame of the video     | video poster fallback          |

**Property, room, owner, review, guide and experience photos do NOT go here.**
They live in **Supabase Storage** (buckets `stays / owners / reviews / guides /
experiences`), are uploaded via `POST /api/upload`, and the services resolve
their URLs. `public/` is only for site-chrome media that ships with the build.

## What's a placeholder vs. a real asset

`placeholders/` holds graceful-degradation art, not content:

- `stay-fallback.svg` — a stay card/gallery with no photo (16:10).
- `avatar-fallback.svg` — a host/guest with no portrait.
- `hero-fallback.svg` — the hero before real hero photography exists (16:9).

Wire these as the `onError` / null-image fallback in components. When the real
media arrives, nothing needs changing — the fallback simply stops rendering.

## Icons — the rule

- **Generic UI icons → `lucide-react`** (installed), imported in code. Do not
  vendor SVGs for anything Lucide already has.
- **`icons/` is only for what Lucide lacks.** Right now that's `whatsapp.svg`
  — Lucide removed its WhatsApp glyph. It uses `currentColor`, so it inherits
  clay on paper or paper on bark from its container.

## House style for any SVG added here

Match the plantation ledger: palette is bark `#3D2B1F`, clay `#B5651D`, mist
`#5B7553`, gold `#C9A05C`, paper `#F2ECE0`, ink `#2A2620`. **Flat only — no
gradients, no glossy shadows.** UI icons use `currentColor` and a ~1.7 stroke
with rounded joints, to sit beside Lucide without clashing.
