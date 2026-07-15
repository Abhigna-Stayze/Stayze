# FRONTEND.md — Building the Stayze customer portal UI

The plan for turning the finished backend into pages. The API, services, schema
and seed data all exist and are tested; **no UI does yet**. This file is the
rules for building it.

Read this with two companions open:

- **`CONTEXT.md`** — the architecture, the API surface, the storage rules. Non-negotiable.
- **`Stayze — Website Page-by-Page Design.pdf`** and **`Stayze — Website UI Design.pdf`** (in the parent folder) — the page-by-page spec and the rendered mockups. **These are the reference.** We are not pixel-matching an external screenshot; we are building what those documents describe.

## Always do first

1. **Read `CONTEXT.md`** — specifically the "Rules", "Architecture" and "The API" sections. The frontend has one hard constraint (below) that everything depends on.
2. **Apply the brand foundation before any page.** `src/app/globals.css` still ships the scaffold's Geist fonts and neutral greys. Nothing looks right until the plantation-ledger tokens and the three fonts are in. Do this once, first — everything built before it gets restyled twice.
3. There is **no `frontend-design` skill** in this project. To see a change running, use the `/run` skill or `npm run dev` + a screenshot (workflow below). To confirm a flow end to end, use `/verify`.

## The one rule everything hangs on

**Pages never touch Prisma or Supabase. Ever.**

```
Server Component / Client Component
      ↓  fetch()                        ↓  import (server components only)
GET /api/stays/[slug]        —or—   stayService.getStayBySlug(slug)
      ↓
src/services/*.service.ts          ← all data access lives here
```

- Server Components may call a **service** directly (`src/services/*`) or fetch the REST route. Client Components fetch the REST route.
- Services already return **DTOs** (`src/services/types.ts`) — plain objects with `number`s, not Prisma `Decimal`s, and resolved image **URLs**, not `bucket`+`path`. Never re-resolve a storage path in a component; the service did it.
- A component that imports `@/lib/prisma`, `@/lib/supabase`, or `@/lib/env` is a **build error** by design (`server-only`). That error is the guard working — do not route around it.
- **Owner `phone`/`email` do not exist on the DTO.** You cannot render them by accident. Keep it that way.

## What we're building on

|            |                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16, App Router, Server Components by default                                                         |
| Language   | TypeScript, strict                                                                                           |
| Styling    | Tailwind CSS v4 — config is CSS-first in `globals.css` via `@theme`, **not** a JS config and **not** the CDN |
| Components | shadcn/ui (Radix), skinned to the brand — install per-component, do not vendor the whole kit                 |
| Fonts      | `next/font/google` — Fraunces, Inter, JetBrains Mono                                                         |
| Data       | The REST API in `src/app/api/` and the services behind it                                                    |
| Images     | Real seeded objects in Supabase Storage, URL-resolved by the services                                        |

**Not** a single `index.html`. **Not** Tailwind via CDN. **Not** `placehold.co` — we have real seeded photos of the three stays; use them. The only place a placeholder is acceptable is a stay with genuinely no image, where the card falls back per the design.

## Brand foundation — do this first, in `globals.css`

Palette (plantation ledger). Define as CSS custom properties + Tailwind `@theme` tokens:

| Token       | Hex       | Only for                                              |
| ----------- | --------- | ----------------------------------------------------- |
| `--bark`    | `#3D2B1F` | Primary ink, dark surfaces, footer                    |
| `--clay`    | `#B5651D` | CTAs, active chips, focus rings — **never body text** |
| `--mist`    | `#5B7553` | Verification, success, the ✓                          |
| `--gold`    | `#C9A05C` | The Inspected stamp, tags                             |
| `--paper`   | `#F2ECE0` | Page ground — the default surface, **not white**      |
| `--paper-2` | `#E8DFCC` | Card wells, dividers                                  |
| `--ink`     | `#2A2620` | Body text                                             |
| `--error`   | `#A8321E` | Errors only                                           |

Type — load all three via `next/font/google`:

- **Fraunces** → headings/display (optical size 24+ on heroes).
- **Inter** → body/UI.
- **JetBrains Mono** → **every number.** Prices, ratings, FitScores, distances, dates, night counts. A brand rule, not a preference. Set it in a `.font-mono` utility and reach for it whenever a figure renders.

Two rules that are easy to break and hard to notice:

- **Clay fails WCAG AA on paper** (~4.3:1). Body text is `--bark` or `--ink`. Clay is for buttons, borders and focus rings. This is why the palette has two dark tokens.
- **One elevation level.** `0 1px 2px rgba(0,0,0,.06)` on cards. No glossy shadows, no glass, no multi-stop gradients. The ledger is flat and grounded — the anti-generic gradient advice below is overridden here by the brand.

Marks live in `public/brand/` (not `brand_assets/`): horizontal lockup → header; roofline icon → favicon/mobile; **stamp → only the ✓ Inspected badge, never the brand logo**; contour → watermark on About / Become-a-Host.
(Known asset bug: `stayze-stamp-badge.svg` renders its "FS" monogram as "F 8" — fix the SVG before it ships on cards.)

## Reference-matching workflow

The reference is our own design docs, and the real data behind them.

- **Match the mockups' layout, spacing, hierarchy and colour.** Do not improve, embellish, or add sections. The spec is the contract (Handoff §22).
- Build with **real content** from the API — CoffeeCharm, ₹4,500, FitScore 89, the seeded reviews and guides. Never lorem, never fake numbers.
- **Screenshot, compare, fix, re-screenshot. At least two rounds per page.** Stop when there is no visible gap against the mockup, or the user says stop.

### Local server + screenshots (Linux, this machine)

- Serve on localhost — never screenshot a `file://` URL: `npm run dev` (Next.js on `http://localhost:3000`). If it's already running, don't start a second.
- Screenshot with headless Chromium (installed at `/usr/bin/chromium`):
  ```bash
  chromium --headless=new --disable-gpu --no-sandbox \
    --force-device-scale-factor=2 --window-size=1440,3000 \
    --screenshot="/tmp/shot.png" http://localhost:3000/stays/coffeecharm
  ```
- Also capture mobile — `--window-size=390,2400` — because most guests arrive on a phone.
- Read the PNG back with the Read tool and compare specifically: "price is 18px, mockup shows ~14pt mono", "card gap is 12px, should be ~12mm", "clay used on body copy — must be bark".

## Anti-generic guardrails (brand overrides where noted)

- **Colours:** only the eight tokens above. Never a default Tailwind palette colour (`blue-600`, `indigo-500`). Derive tints from the tokens.
- **Typography:** Fraunces + Inter + JetBrains Mono, never one family for everything. Tight tracking on large Fraunces headings; generous line-height (~1.6) on body.
- **Shadows:** the single `0 1px 2px rgba(0,0,0,.06)`. **Do not** layer tinted shadows — the brand is flat. (This overrides the generic "layered shadows" advice.)
- **Gradients / grain:** avoid. The ledger has no gradient heroes or noise. The one exception is a subtle dark overlay on the hero photo so white text holds contrast. (Overrides the generic "layer radial gradients" advice.)
- **Animations:** animate only `transform` and `opacity`, spring-ish easing, and respect `prefers-reduced-motion`. Never `transition-all`. Keep motion sparse — over-animation reads as generic.
- **Interactive states:** every clickable element gets hover, `focus-visible` (clay 2px ring), and active. No exceptions.
- **Images:** real Supabase URLs. On photo heroes, a `from-bark/40` overlay for legibility. **Review-photo URLs are signed and expire in ~1h — never cache, store, or bake them into a static build.**
- **Depth:** paper → card (`paper-2`/white well) → floating (booking card, help button). A real layering system, not everything on one plane.

## Build order

1. **Brand foundation** — `globals.css` tokens, the three fonts, the real favicon, shadcn/ui init.
2. **The shell** — header, footer, floating "Need Help?" — all from `GET /api/site` (so the WhatsApp number is never hardcoded).
3. **The stay card** — one component; Home, Explore, related, guides and experiences all use it.
4. **Home → Explore → Stay detail** — real data and endpoints exist for all three today.
5. **Booking → Trip timeline** — the conversion path. Booking is saved before the WhatsApp handoff.
6. **Experiences → Travel guide** — the SEO surface.
7. Static pages, legal, 404/500 (in-brand even when broken).
8. SEO (`LodgingBusiness` on stays, `Article` on guides), analytics, accessibility audit, Lighthouse ≥ 90 mobile.

## Hard rules

- **Do not build pages Schema v1.1 has no data for.** No `/login`, `/signup`, `/account`, wishlist collections, or `/admin`. There is no `User` model. In particular: **no heart/save icon on the stay card** — it has nowhere to persist to, and a `localStorage` wishlist silently loses a guest's saves on device change.
- **A guest returns to a trip by reference code** (`/trip/[reference]`), not by logging in.
- **Booking has three steps, no payment step.** WhatsApp request-to-book. Say plainly that nothing is charged and confirmation comes later.
- **`ratingAvg: null` renders "New stay", never 0.** Zero is a rating; it shows a new property as one star.
- **Every number is mono. Body text is never clay.**
- Match the spec; do not add scope. Do not stop after one screenshot pass. Do not use `transition-all`. Do not use a default Tailwind blue/indigo.
- Pages never import Prisma, Supabase, or `env` — go through `src/services/` or `src/app/api/`.
