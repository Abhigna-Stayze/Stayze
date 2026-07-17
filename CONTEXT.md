# Context — development

Development context for the Stayze customer portal. Scope is deliberately narrow: **how the codebase is set up, and how to work in it.** It is written so that someone (or some agent) with no prior conversation can pick the project up cold.

Business context — brand, business model, operations, payout tiers, open items — lives in `CONTEXT.md` and `AGENTS.md` in the **parent workspace folder**, one level above this repo. It is intentionally **not** duplicated here. Read it there. Don't copy it in: two copies drift, and a stale copy is worse than none.

## Rules — read before touching the database or the client

Three things that a fresh reader gets wrong by default. The repo's early history will actively mislead you on the first one.

1. **Schema changes go through `npx prisma migrate dev`. Never `npx prisma db push`.**
   `db push` applies a schema with no migration file, leaving no history and no way to replay a change. It was used during initial setup, so you will see it in old commands and old commits — that is not the pattern to copy. Migrations are versioned and committed under `prisma/migrations/`.

2. **Import the client from `@/lib/prisma`. Never construct one.**

   ```ts
   import { prisma } from "@/lib/prisma";
   ```

   `new PrismaClient()` does not compile: Prisma 7 requires a driver adapter argument. `src/lib/prisma.ts` supplies it and caches the instance across hot reloads. (This module was called `db.ts` until 2026-07-12.)

3. **Generated types come from `@/generated/prisma/client`, not `@prisma/client`.**
   `@prisma/client` is the runtime dependency, but the generator writes to `src/generated/prisma`, so that is the import path.

4. **`prisma generate` after every schema change.** `migrate dev` does not do it for you — see "Migrations" below.

5. **Pages never touch Prisma or Supabase. Go through `src/services/`.** See "Architecture" below.

## Stack

|                 |                               |
| --------------- | ----------------------------- |
| Framework       | Next.js 16, App Router        |
| Language        | TypeScript (strict)           |
| Styling         | Tailwind CSS v4               |
| Database        | Supabase (Postgres)           |
| ORM             | Prisma 7                      |
| Linting         | ESLint (`eslint-config-next`) |
| Package manager | npm                           |
| Node            | 22 or newer (Prisma 7)        |

Next.js is a settled founder decision (2026-07-03), recorded in the parent folder under `00 — Foundation / Stayze — Decision Log — Tech Direction Resolution (2026-07-03).md`. It supersedes the earlier "static HTML, no framework" ADR. App Router vs Pages was left open in that entry; this scaffold answers it — **App Router**.

## Layout

```
src/
  app/          App Router routes, layouts, global styles
  app/api/      REST endpoints. Validate, call a service, return JSON.
  lib/
    prisma.ts     The Prisma client singleton — import `prisma` from here
    supabase.ts   Supabase clients (browser + privileged admin)
    storage.ts    The only door to Supabase Storage
    env.ts        Zod-validated server environment
    api.ts        Response envelope, central error handling, admin guard
    schemas.ts    Zod request schemas
    rate-limit.ts In-process limiter for the public write endpoints
  services/     The data layer. All database access goes through here.
    stay.service.ts     Explore, Home, Stay Detail
    guide.service.ts    Travel guides
    booking.service.ts  WhatsApp booking + trip timeline
    review.service.ts   Reviews + the denormalised rating on Stay
    experience.service.ts  Destination experiences
    site.service.ts     Site settings, tags, amenities, contact
    media.service.ts    Keeps Postgres rows and Storage objects in step
    types.ts            DTOs the services return
    mappers.ts          Prisma row -> DTO (Decimal->number, ref->URL)
  generated/    Prisma client — generated, gitignored
prisma/
  schema.prisma Data model — Schema v1.1, 21 models
  migrations/   Migration history — committed, replayable
  seed.ts       Development seed — wipes and repopulates every table
  seed/
    content.ts  The data itself: 3 stays, owners, guides, reviews…
    media.ts    Downloads source images, uploads them to Supabase Storage
public/
  brand/        Logo, wordmark, favicon and badge SVGs
```

The `@/*` path alias maps to `src/*`.

`.agents/`, `.claude/` and `skills-lock.json` hold agent-skill setup locally. All are gitignored — see §4 below.

The repo is scoped to `web/`, nested inside the `Stayze/` workspace folder on disk. The parent folder holds decks, design exports, images and the Drive-mirrored knowledge base — none of it is under version control here, and it should stay that way. Keeps the code history clean and the binaries out.

## How the project was built, in order

### 1. Next.js scaffold

`create-next-app` — TypeScript, Tailwind, ESLint, App Router, `src/` directory, `@/*` alias, npm. Git init was skipped so the repo could be initialized deliberately.

Then the boilerplate was stripped: the `CLAUDE.md` / `AGENTS.md` that `create-next-app` emits, the demo splash page, and the Next.js / Vercel marketing SVGs in `public/`. The home page is now a plain Stayze placeholder. Metadata in `src/app/layout.tsx` uses a `%s · Stayze` title template. The package was renamed from `web` to `stayze` and a `typecheck` script added.

**Two scaffold defaults were wrong and were fixed.** Both are easy to reintroduce, so they're worth knowing:

- **Font.** `create-next-app` loads Geist via `next/font`, then overrides `body` with `font-family: Arial, Helvetica, sans-serif` in `globals.css` — so the font it just loaded never applied. Now points at `var(--font-sans)`.
- **Package name.** Defaulted to `web`, after the directory. Not what the project is called.

### 2. Brand assets

The logo, wordmark, favicon and badge SVGs were copied from the design folder into `public/brand/`.

### 3. Prisma + Supabase

```bash
npm install prisma typescript tsx @types/node --save-dev
npm install dotenv --save-dev
npm install @prisma/client @prisma/adapter-pg pg
npm install @types/pg --save-dev
npx prisma init
npx prisma db push      # <- initial setup only. Do NOT use this again; see Rules above.
npx prisma generate
```

Note `@types/node`, not `@type/node` — the latter is a typo and does not exist on npm.

`@prisma/client` is the runtime the generated client needs; `dotenv` is required because `prisma.config.ts` opens with `import "dotenv/config"`. Both are declared explicitly rather than leaned on as transitive dependencies.

**Import the client from the generated path, not from `@prisma/client`:**

```ts
import { PrismaClient } from "@/generated/prisma/client";
```

The `prisma-client` generator emits to `src/generated/prisma` (see the `output` in `schema.prisma`), so `@prisma/client` is the runtime dependency but not the import path. This import resolves and typechecks today — verified.

**Prisma 7 has no zero-argument `PrismaClient` constructor.** `PrismaClientOptions` requires _either_ a driver adapter _or_ an Accelerate URL — `new PrismaClient()` will not compile. For Supabase Postgres the adapter is `@prisma/adapter-pg` (with `pg` and `@types/pg`), and the wiring lives in **`src/lib/prisma.ts`**:

```ts
import { prisma } from "@/lib/prisma";

const stays = await prisma.stay.count();
```

In practice you should not import this outside `src/services/` — see "Architecture".

That module builds the client over the **pooled** `DATABASE_URL` — `DIRECT_URL` is for migrations only — and caches the instance on `globalThis` outside production, so Next's hot reload doesn't open a fresh connection pool on every edit.

Verified end to end against the live Supabase database: read, write and delete all work.

`prisma init` produced `prisma/schema.prisma` and `prisma.config.ts`. The setup differs from stock Prisma in two ways that will confuse you if you don't know:

- **Connection config lives in `prisma.config.ts`, not the schema.** The `datasource db` block in `schema.prisma` deliberately carries no `url` / `directUrl`. Prisma 7 reads them from the config file instead, which is where `DIRECT_URL` is wired in for migrations.
- **The client is generated to `src/generated/prisma`**, not into `node_modules`. That path is gitignored, so it must be generated after a clone. The `postinstall` script does this automatically — without it, CI and Vercel builds fail with `Cannot find module '@/generated/prisma/client'`.

#### Migrations

`prisma.config.ts` already points `migrations.path` at `prisma/migrations/` and routes migrations through `DIRECT_URL` — PgBouncer, on the pooled `DATABASE_URL`, cannot run the statements migrations need. The plumbing is done; the only thing required is to stop reaching for `db push`.

**The first migration is done** (`a361f15`, 2026-07-11). `prisma/migrations/20260711174828_init/` is the baseline: all 21 models of Schema v1.1 and all 11 enums, 502 lines of SQL. The database was reset first — it carried a placeholder `User` table from `db push` with no migration behind it, which would have shown up as schema drift:

```bash
npx prisma migrate reset --force     # dropped the placeholder User table
npx prisma migrate dev --name init   # wrote prisma/migrations/ and applied it
```

Verified afterwards against the live database, not just from CLI output: all 21 tables exist, `_prisma_migrations` has the one `init` row.

**`migrate dev` does NOT regenerate the client.** This surprised us: after the migration, `src/generated/prisma` was still exporting the old placeholder `User` model, and the seed would not compile against it. Prisma 7 decoupled the two. **Run `npx prisma generate` yourself after every schema change** — `postinstall` only covers a fresh install, not an edit.

**Two Prisma 7 surprises, both of which will bite you again:**

- **`--skip-seed` no longer exists.** Seeding moved into `prisma.config.ts`. Passing the flag makes the command print its help text and do nothing — easy to misread as a failure. No seed script is configured here, so nothing seeds either way.
- **`migrate reset` is blocked for AI agents.** Prisma refuses it and prints a notice demanding explicit human consent, then requires the command be re-run with `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` set to the exact text of the user's approving message. This is a Prisma guardrail, not a Claude Code one. Expect any agent to stop and ask here — that is working as intended.

**`migrate reset` is destructive and development-only.** It was safe on 2026-07-11 because the database held no rows. It will not be safe again once real bookings exist. From here, every schema change is `migrate dev`, and `prisma/migrations/` is committed with `schema.prisma`.

Supabase's own schemas (`auth`, `storage`, `realtime`, `vault`) sit outside `public` and the reset left them untouched.

#### The `.env` gotcha

`prisma init` writes a `.env` template, and the `DATABASE_URL` line here had been pasted in twice — the value itself began with `DATABASE_URL="`, so the URL parsed to a hostname of `base`.

It went unnoticed because **`prisma.config.ts` points migrations at `DIRECT_URL`**, which was fine. So `prisma db push` succeeded, `prisma generate` succeeded, and everything _looked_ healthy — while the pooled runtime URL, the one the app actually uses, was broken. Nothing touches `DATABASE_URL` until the first real query.

`src/lib/env.ts` now validates both URLs with Zod at import time, so a malformed value fails immediately with a readable message instead of surfacing as a bizarre connection error much later.

### 4. Agent skills

```bash
npx skills add supabase/agent-skills
```

Installs the Supabase Postgres best-practices skill into `.agents/skills/`, with `.claude/skills/` holding a **relative symlink** to it so Claude Code picks it up.

**None of this is committed.** `.agents/`, `.claude/` and `skills-lock.json` are all gitignored — the skill is a local development aid, not part of the project. Run the command above to set it up on a new machine.

(The skill files _were_ committed briefly, in commit `0d0e073`, then removed. They remain in git history. They're public documentation from the Supabase repo — no secrets — so history was left alone rather than rewritten.)

### 5. Seed data

```bash
npx prisma db seed          # wired via `migrations.seed` in prisma.config.ts
```

**Development data only.** Three stays (`CoffeeCharm`, `Mistwood Bungalow`, `Kaapi Nest`), 3 owners, 15 amenities, 10 tags, 6 travel guides, 15 reviews, 5 bookings across every `BookingStatus`, and 180 days of availability per stay — 776 rows and 75 storage objects in total. The places are real Chikmagalur locations (Mullayanagiri, Hebbe Falls, Aldur); the properties, owners, guests, prices and phone numbers are invented.

**It wipes every table first**, so it is safe to re-run and dangerous to point at anything real. See "Known gaps".

Two things worth knowing before you touch it:

- **Images are uploaded, not faked.** `prisma/seed/media.ts` downloads from Wikimedia Commons (real, freely-licensed photographs of Chikmagalur — used for landscapes and nearby places) and Unsplash (interiors, portraits, food), then uploads to the five buckets and records the true `width`, `height`, `fileSize` and `mimeType`. Commons rate-limits: the downloader identifies itself with a User-Agent, paces distinct sources 500 ms apart, and backs off on a 429. Remove that and the seed fails partway through.
- **Availability is deterministic.** A seeded PRNG, not `Math.random()`, so re-running produces identical data. Weekends get a 25% price override, festival dates 50%, roughly 7 days per stay are `BLOCKED`, and the nights taken by confirmed bookings are marked `BOOKED` — so the calendar agrees with `BookingRequest` instead of contradicting it.

`ratingAvg` and `reviewCount` on `Stay` are denormalised with nothing maintaining them, so the seed computes both from the reviews it inserts. Application code that publishes a review must do the same.

### 6. Tooling

- **`postinstall` runs `prisma generate`.** Not optional: the generated client is gitignored, so without this any fresh clone, CI run or Vercel build fails at typecheck.
- **Zod-validated env** in `src/lib/env.ts`. Import `env` from there, not `process.env`.
- **Prettier**, with `prettier-plugin-tailwindcss` to sort class names and `eslint-config-prettier` to stop ESLint fighting it. `npm run format` writes, `npm run format:check` verifies.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs format-check, lint, typecheck and build on every push to `main` and every PR. It supplies placeholder connection strings — the build never opens a connection, but `env.ts` validates the shape at import.

**CI pins Node 24, and the version matters twice over.** Prisma 7 requires Node ≥ 22 (`@prisma/streams-local` declares it), so Node 20 is out. And the npm major has to match the one that wrote `package-lock.json`: npm 10 and npm 11 resolve optional native dependencies differently, so `npm ci` on Node 20 rejects an npm 11 lockfile with `Missing: @emnapi/runtime from lock file`. Node 24 ships npm 11. If you regenerate the lockfile on a different npm major, expect CI to fail until the two agree. `engines` in `package.json` declares the floor.

## Environment

All from Supabase. Copy **`.env.example`** to `.env` and fill it in from the dashboard. `.env.example` is the one env file that is committed — it holds placeholders only. `.env` itself never is.

| Variable                               | Purpose                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`                         | Pooled connection, port 6543 (PgBouncer). App runtime.                    |
| `DIRECT_URL`                           | Direct, unpooled, port 5432. Migrations and the seed require this.        |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL. Public by design — the browser needs it to build image URLs. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key. Public by design.                                               |
| `SUPABASE_SERVICE_ROLE_KEY`            | **Secret.** Bypasses RLS. Seed/server only.                               |

The first two are validated at import by `src/lib/env.ts`. The Supabase keys deliberately are **not** — CI supplies only the two database URLs, so requiring the others in `env.ts` would break the build. The seed reads them directly.

> **Never prefix the service-role key with `NEXT_PUBLIC_`.** Next.js inlines every `NEXT_PUBLIC_*` variable into the JavaScript bundle sent to the browser. The service-role key bypasses Row Level Security completely, so a `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` hands every visitor full read/write access to the database. This was very nearly done on 2026-07-12 and caught before any build shipped. The project URL and the publishable key are fine to expose — they are designed for it. The service-role key is not.

The pooled/direct split is a Supabase requirement, not a preference: PgBouncer in transaction mode can't run the statements migrations need.

## Architecture

One rule, and everything else follows from it: **the UI never talks to the database or to storage.** How it reaches data depends on whether it renders on the server or the client.

**Server Components** read through a **server-only helper in `src/lib`** (e.g. `getSiteData` in `src/lib/site.ts`), which calls a service. They may call a service directly, but the helper is the preferred seam. They must **never** import Prisma or a Supabase client, and must **not self-fetch a REST route** without a specific reason — a self-fetch needs `headers()` for an absolute URL, which forces the page dynamic.

```
Server Component
      ↓
src/lib/*  (server-only helper)     ← getSiteData, etc.
      ↓
src/services/*.service.ts           ← all database access lives here
      ↓
src/lib/prisma.ts → PostgreSQL
```

**Client Components** always go over **HTTP** to the REST API. They must **never** import a service, Prisma, or a Supabase server client. (A pure helper like `whatsappLink` in `src/lib/whatsapp.ts` — no `server-only`, no data access — is fine to share.)

```
Client Component
      ↓  fetch()
src/app/api/**/route.ts             ← REST. Validates, calls a service, returns JSON.
      ↓
src/services/*.service.ts
      ↓
src/lib/prisma.ts → PostgreSQL
```

**Media** goes through the storage service, the only door to Supabase Storage:

```
route / service
      ↓
src/lib/storage.ts  →  src/lib/supabase.ts  →  Supabase Storage
```

**The service layer is the single home of business logic** — Prisma queries, Storage orchestration, business rules, transactions, calculations. Neither Server Components, `src/lib` helpers, nor API routes may contain it. `src/lib` is for configuration, utilities, server-only helpers, API/validation helpers, env and shared infrastructure — **not business rules**. (`src/lib/storage.ts` is the low-level Storage _adapter_; the _rules_ about media — orphan cleanup, hero promotion, row/object lifecycle — live in `src/services/media.service.ts`.)

**Server Actions are not used.** The decision (2026-07-12) is a REST API via Route Handlers, so the same endpoints can serve the website, a future mobile app, an admin dashboard, WhatsApp automation and AI integrations. Nothing is coupled to a React render.

**Services return DTOs, not Prisma rows.** This is the part that looks like ceremony and is not. Two things break if you skip it:

- **`Decimal` cannot cross to a client component.** Price, coordinates and rating come out of Prisma as `Decimal` objects, and passing one into a client component throws at runtime. `src/services/mappers.ts` converts them to `number` in one place.
- **`bucket` + `path` is not a URL.** Rows hold a storage reference; components need something to put in `src`. Services resolve it via `storage.ts`, so no page ever imports the Supabase client.

The DTOs are in `src/services/types.ts`. A useful example of why they earn their keep: `OwnerPublicView` simply **has no `phone` or `email` field**. Those columns are internal-ops only, and the type is what stops them reaching a component — a rule enforced by the compiler rather than remembered by a reviewer. In the same spirit, `booking.service.ts` withholds `caretakerPhone` until a booking is actually `CONFIRMED`, because reference codes are guessable and a caretaker's personal number is not ours to hand out.

**`server-only` is load-bearing.** `env.ts`, `prisma.ts` and every service import it. If a client component ever imports one of them, the **build fails** instead of the service-role key being bundled into the browser. That is the intended behaviour — an import error here is the guard working, not a bug to route around.

## The API

`src/app/api/`. Routes are thin: validate with Zod, call a service, return. No route touches Prisma.

**Interactive docs: `/api/docs`** — Swagger UI. The OpenAPI 3.1 spec is at `/api/openapi.json`, and `/api` itself redirects a browser to the docs (it is a folder, not an endpoint — without a `route.ts` it would be a bare 404 that reads like the API is broken).

Swagger UI is **served from this origin, not a CDN**: `scripts/copy-swagger.mjs` vendors the two assets out of `node_modules` into `public/swagger/` at `postinstall`. They are gitignored — generated output, same argument as the Prisma client. If the docs page 404s on its CSS, `npm install` (or `npm run postinstall`) is what puts them back.

**The spec is generated, never hand-written.** `src/lib/openapi.ts` builds it from the same Zod schemas the API validates with, so it cannot drift from the implementation. Response shapes are pinned to the service DTOs by a compile-time check: change `StayCard` without changing its schema and `npm run typecheck` fails. That check is the only thing keeping the published docs honest — do not delete it to make an error go away.

Note the spec documents the **wire format**: services return `Date` objects, the API sends ISO strings, and `Jsonify<T>` in `openapi.ts` is what reconciles the two.

| Method | Endpoint                    | Notes                                                                                              |
| ------ | --------------------------- | -------------------------------------------------------------------------------------------------- |
| GET    | `/api/stays`                | `?featured=true` `?tag=` (repeatable, AND) `?area=` `?minPrice=` `?maxPrice=` `?guests=` `?limit=` |
| GET    | `/api/stays/[slug]`         | Full detail: images, rooms, experiences, amenities, owner                                          |
| GET    | `/api/stays/[slug]/nearby`  |                                                                                                    |
| GET    | `/api/stays/[slug]/reviews` | Published only                                                                                     |
| GET    | `/api/stays/[slug]/related` |                                                                                                    |
| GET    | `/api/guides`               | `?featured=true` `?category=` `?limit=`                                                            |
| GET    | `/api/guides/[slug]`        | Body included                                                                                      |
| GET    | `/api/reviews?stay=<slug>`  | Flat form of the nested route. `stay` is required.                                                 |
| GET    | `/api/site`                 | Settings + tags + amenities, in one call                                                           |
| GET    | `/api/docs`                 | Swagger UI. `/api/openapi.json` is the spec.                                                       |
| POST   | `/api/booking`              | Returns `{ reference, whatsappUrl, estimatedTotal, nights }`. Rate limited: 5/IP/10 min.           |
| GET    | `/api/booking/[reference]`  | Trip timeline. Case-insensitive.                                                                   |
| POST   | `/api/upload`               | multipart. Uploads, and optionally attaches to a row. **`x-admin-key`.**                           |
| DELETE | `/api/media/[type]/[id]`    | Removes the row **and** the storage object. **`x-admin-key`.**                                     |

Every response uses the same envelope, so a client can branch on `success` without knowing the endpoint:

```jsonc
{ "success": true,  "data": … }
{ "success": false, "error": { "message": "…", "issues": [{ "field": "adults", "message": "…" }] } }
```

Status codes: **200**, **201**, **400** (bad JSON, or a service rule like "sleeps 4, you asked for 9"), **401** (missing admin key), **404**, **409** (object already at that path), **413**, **415**, **422** (Zod), **500**, **502** (Storage down).

**Raw Prisma errors are never returned.** They carry table, column and constraint names — a free schema dump for anyone probing the API. `src/lib/api.ts` logs them server-side and returns a generic 500. Keep it that way.

**`POST /api/upload` is protected by a shared secret**, not real auth. It writes to Storage with the service-role key, so leaving it open would let anyone fill the buckets or overwrite a hero image. It requires an `x-admin-key` header matching `ADMIN_API_KEY`. With that variable unset it works in development and is **refused in production** — failing closed, because an unset secret must never mean "allow everyone". Replace this the moment auth lands.

`POST /api/booking` is deliberately public and unauthenticated: it _is_ the booking flow. It is therefore also the obvious thing to spam, so it is rate limited to **5 per IP per 10 minutes** — far above a real guest, far below a script. Read the caveat in `src/lib/rate-limit.ts` before trusting it: the counter is in-process, so on serverless it is a speed bump, not a wall.

### The denormalised rating

`Stay.ratingAvg` and `Stay.reviewCount` are copies. **Nothing in Postgres keeps them true** — no trigger, no computed column. They exist because the Explore grid must be fast.

**`src/services/review.service.ts` is the only thing that may write them.** Every review write that could change the answer — create, publish, unpublish, edit the rating, delete — recomputes them _inside the same transaction_. Miss one and the number on the card drifts away from the reviews underneath it, which is a bug nobody reports and everybody notices.

Two things worth knowing:

- **A stay with no published reviews gets `ratingAvg: null`, not `0`.** Zero is a rating; it would render as a one-star property. Null means "no reviews yet".
- **Only PUBLISHED reviews count.** An unpublished review is awaiting moderation and must not move the average.

`recalculateAllRatings()` is the repair tool if the numbers ever drift — a bad import, a hand-written `UPDATE`. It is not on any request path.

### Experiences

`Experience` is a destination-level thing you can DO (a coffee estate tour, a sunrise trek) with its own page and its own SEO. **`StayExperience` is now only a junction** — it says which stays offer which experience, and in what order. It used to hold the title, description and image itself; the 2026-07-13 migration moved those onto `Experience` and backfilled one row per distinct title.

The same experience can be offered at several stays. That is the entire reason it earns a URL.

### Media lifecycle

**Postgres and Storage do not stay in step by themselves.** A cascade delete removes child ROWS and leaves the FILES in the bucket forever. `src/services/media.service.ts` is the only thing that changes both, and everything that touches media must go through it.

`POST /api/upload` can attach in the same request — pass `target` (`stay-image`, `review-image`, `owner-photo`, `room-image`, `experience-image`, `nearby-image`, `guide-cover`) and `targetId`. **If the attach fails, the object just uploaded is deleted again.** Upload-then-attach as two calls is precisely what produces orphans: the first succeeds, the client dies, and the bucket keeps a file no row points at. Uploading with no `target` is still allowed and still orphans; pass one unless you have a reason not to.

`DELETE /api/media/[type]/[id]` removes the row and the object together.

Two invariants the service maintains, and code that bypasses it will break:

- **A stay with images has exactly one hero.** Attaching with `isHero=true` demotes the incumbent, and deleting the hero promotes the next image by sort order. A stay with images and no hero renders from a fallback, which is a silent trap — the card looks fine until someone reorders the gallery and the picture changes for no visible reason.
- **Replacing single-reference media repoints the row first, then deletes the old object** — and skips the delete when old and new paths are identical, which is what `upsert=true` produces. Get that wrong and you delete the file you just wrote.

## Storage

Five buckets: **`stays`**, **`owners`**, **`guides`**, **`experiences`** are **public**. **`reviews` is PRIVATE.**

Guest review photos are photographs people took on holiday. The other four buckets hold marketing media we publish on purpose; a guest's photo is not marketing media, and a public URL to one is permanent and impossible to take back once it has been indexed. So `reviews` objects are reached through short-lived **signed URLs**, generated by the storage service.

`getPublicUrl()` **throws** for a private bucket rather than returning a link that 400s — a broken image is a bug you notice; a link that silently exposes a guest's photo is one you do not. Use `signRefs()` (batched — one call per bucket, not one per photo) or `getSignedUrl()`.

Signed URLs **expire** (`SIGNED_URL_TTL_SECONDS`, currently 1 hour). They must not be cached, stored in the database, or baked into a static build.

Postgres stores only `bucket` + `path`. The app resolves the URL at read time:

```ts
const { data } = supabase.storage.from(image.bucket).getPublicUrl(image.path);
```

Never store a full URL (it hardcodes the project ref into your data) and never store binary. Path convention, as the seed writes it:

```
stays/property-001/hero.jpg
stays/property-001/gallery-1.jpg … gallery-7.jpg
stays/property-001/rooms/estate-room.jpg
stays/property-001/nearby/mullayanagiri.jpg
experiences/property-001/morning-coffee-walk.jpg
owners/owner-001/profile.jpg
guides/2-day-chikmagalur-itinerary/cover.jpg
reviews/review-001/img-1.jpg
```

## Known gaps

Real, and worth handling before building on top of this:

- **Rate limiting is in-process, so it is weak on serverless.** `POST /api/booking` is capped at 5/IP/10 min and `/api/upload` at 60, but the counter lives in one instance's memory. On Vercel each instance keeps its own, and instances come and go — an attacker spread across enough cold starts gets more than the limit implies. It raises the cost of casual abuse above zero, which is where we started. The real fix is a shared store: Vercel's firewall, or Upstash Redis keyed the same way. `src/lib/rate-limit.ts` is shaped so that swap touches one file.
- **`ADMIN_API_KEY` is a stopgap, not auth.** One shared secret guards `POST /api/upload`. It has no identity, no audit trail and no revocation short of rotating the key. It is a floor, not a design — replace it when Supabase Auth lands.
- **Orphaned objects are still possible.** `media.service.ts` deletes the row and the object together, and a failed attach rolls the upload back — but an upload with no `target` that is never attached still leaves a file nobody points at. There is no sweeper that reconciles the buckets against the database.
- **The seed is destructive and points at the only database.** `prisma/seed.ts` wipes all 21 tables before inserting. There is no separate dev database, so once real bookings exist, running it would delete them.
- **Schema v1.1 cuts scope the Developer Handoff lists as in-MVP.** Confirm with the founder before building around it, because §22 of that document makes it the contract:
  - **There is no `User` model — no auth, no accounts.** So `/login`, `/signup`, `/account`, `/account/saved` (wishlist collections) and `/admin` have no data model behind them, yet §19 lists all of them as MVP. The trip timeline sidesteps this: a guest returns via the `BookingRequest.reference` code rather than logging in. Wishlist collections and the admin back-office (§9, "not skippable") cannot be built on v1.1 as written.
  - **No standalone `Experience` model.** `StayExperience` is scoped to a single stay, so `/experiences` and `/experiences/[slug]` (§6.5) are unsupported.
  - **No payment fields.** v1.1 settles open decision #1 as **Option B, WhatsApp request-to-book**. That matches §8's heading but contradicts §8's own recommendation ("Build A") and §19 ("Full booking flow (Option A)"). The handoff doc should be amended so it stops saying both.
  - **`Review` has no link to `BookingRequest`**, so a reviewer cannot be verified as having stayed. Possibly deliberate, since `ReviewSource` allows imported Airbnb/Google reviews.
  - **`Stay.ratingAvg` and `Stay.reviewCount` are denormalised.** Nothing maintains them; they must be recomputed whenever a review is published.
- **Row Level Security is bypassed.** Prisma connects through the pooler as the `postgres` role, which ignores Supabase RLS policies entirely. It matters the moment auth exists: if Supabase Auth is added on the assumption that RLS protects rows, **it will not**. Either enforce every access rule in application code, or connect as a restricted role and design RLS deliberately. An architecture decision, not a bug — but it must be a conscious one.
- **No tests.** CI runs format, lint, typecheck and build — but there is nothing to test yet.

## Commit identity

Commits here are authored as `Abhigna <302452169+Abhigna-Stayze@users.noreply.github.com>`, set **repo-locally**, not globally.

The machine's global git identity is `AbhignaGowda <abhignagowda07@gmail.com>`, but the GitHub CLI is authenticated as `Abhigna-Stayze`. Committing with the global identity produces commits GitHub can't link to the account they were pushed under — they show as an unlinked author. The `users.noreply.github.com` address is the one tied to `Abhigna-Stayze`, so attribution resolves without exposing a personal email.

On a fresh clone, set it again, or the global identity silently takes over:

```bash
git config user.name "Abhigna"
git config user.email "302452169+Abhigna-Stayze@users.noreply.github.com"
```

Repo: `Abhigna-Stayze/Stayze` — private, default branch `main`.

## Conventions

- Routes, layouts and global styles under `src/app/`.
- Schema changes via `prisma migrate dev` — **never `db push`**. Commit the migration with the schema.
- `npm run typecheck` and `npm run lint` both pass before a commit.
- Never commit `.env`. `.env.example` is the sole exception, and it holds placeholders only — keep it in step with `src/lib/env.ts` when a variable is added.
- Spec documents (`.docx`, `.pdf`, `.pptx`) stay in the parent workspace, never in this repo.
- Regenerate the Prisma client after any schema change (`migrate dev` does this for you).
- **Update this file in the same commit as the change it describes.** A stale `CONTEXT.md` is the one failure mode that makes every other convention here useless. If a step is now done, say it is done; if a command no longer works, fix the command.
- **Commits carry no AI attribution.** No `Co-Authored-By` trailers, no "Generated with" badges, no mention of Claude in a commit message. Authored as the commit identity above, and nothing else. `.claude/settings.json` sets `includeCoAuthoredBy: false` to enforce this locally; that file is gitignored, so re-create it on a fresh clone.

## Frontend foundation

Phase 1 of the UI is the brand foundation — no pages yet. It is done. The rules for building pages on top are in **`FRONTEND.md`** (start there); the design system itself lives in **`src/app/globals.css`**.

- **Palette — the plantation ledger, eight tokens only.** `--bark --clay --mist --gold --paper --paper-2 --ink --error`, defined as CSS variables and exposed as Tailwind utilities (`bg-paper`, `text-bark`, …). **Never a default Tailwind colour** (no `blue-600`). Two dark tokens exist because **clay fails WCAG AA on paper** (~4.3:1) — body text is `--ink`/`--bark`, clay is for buttons, borders and focus rings only. The ground is `--paper`, **not white**.
- **Three fonts, loaded once in `layout.tsx` via `next/font/google`.** Fraunces → headings (`--font-serif`), Inter → body/UI (`--font-sans`), JetBrains Mono → **every number** (`--font-mono`). The mono rule is a brand rule; reach for the `.num` utility on any figure.
- **Tailwind v4, CSS-first.** All config is in `globals.css` via `@theme` — there is **no `tailwind.config.js`**, and adding one is a regression. Custom utilities (`.num`, `.eyebrow`, `.stamp`, `.display`, `.heading-*`, `.container-page`, `.section`, `.card-surface`, `.card-float`) are `@utility` blocks; they tree-shake, so they only appear in the compiled CSS once something uses them.
- **One elevation.** `--elevation` (`0 1px 2px rgba(0,0,0,.06)`) → `shadow-card`; a second `--elevation-float` → `shadow-float` for genuinely floating things (booking card, help button). No glossy, tinted or layered shadows — the ledger is flat.
- **shadcn/ui is initialised, not populated.** `components.json` + `src/lib/utils.ts` (`cn`) exist, and the brand tokens are mapped to shadcn's semantic names (`--primary` = clay, `--background` = paper, `--ring` = clay …), so `npx shadcn@latest add <component>` produces an in-brand component with no restyling. No components are vendored yet — add per-component.
- **Icons: Lucide** (`lucide-react`), the single icon system.
- **Favicon:** `src/app/icon.svg` (roofline mark) and `src/app/apple-icon.png` (180×180, rasterised from the avatar). The scaffold `favicon.ico` is gone.
- **Light only.** No dark theme is shipped — dark surfaces (footer, hero) use `--bark` as a colour, not a `.dark` mode. shadcn's `dark:` variant is defined so its components compile, but nothing toggles it.

`src/app/page.tsx` is a **placeholder that proves the foundation**, not the Home page — it renders the tokens (paper ground, Fraunces display, mono numbers, the gold stamp) and gets replaced in a later phase.

### The application shell (Phase 2)

The global chrome every page inherits, composed in `src/app/layout.tsx`: **Header → page `<main>` → Footer → floating help**. Components live in `src/components/layout/`.

- **The shell's data comes from one source: `src/lib/site.ts` (`getSiteData`)**, which calls the site service — the same code path `GET /api/site` runs. **Nothing is hardcoded**: the footer's email, phone, WhatsApp link and Instagram icon, and the floating button's number, all come from `SiteSetting`. It is wrapped in React `cache()` and called once in the layout. No component imports Prisma/Supabase — they import `getSiteData` (server) or receive props. `whatsappLink()` lives in `src/lib/whatsapp.ts` (a pure helper, no `server-only`) so Client Components can use it too.
- **The root layout is `export const dynamic = "force-dynamic"`, and this is load-bearing — do not remove it.** The shell reads `SiteSetting` from the database on every page. If the layout renders statically, `next build` runs that query while prerendering `/` and `/_not-found` — and CI builds with **placeholder** credentials, so it dies with `ECONNREFUSED` (this exact regression broke CI once). Dynamic rendering keeps the build DB-free and always serves current contacts. `getSiteData` is also wrapped in try/catch: a DB blip degrades to an empty shell (the footer drops missing fields) rather than 500-ing every page. A local `npm run build` will _not_ catch a reintroduction of this bug because your `.env` reaches the real DB — reproduce CI with placeholder `DATABASE_URL`/`DIRECT_URL` to test.
- **Header** (`Header.tsx`) is a Server Component, `sticky top-0`, paper with a hairline base. Desktop `Navigation` and the `MobileNavigation` drawer swap at `lg`. Only `NavLink` is a Client Component — it reads the pathname for the active (clay) state; everything else stays server-rendered.
- **MobileNavigation** is a Radix Dialog (`src/components/ui/sheet.tsx`), which gives the focus trap, Escape-to-close, body scroll lock and focus return for free — verified in a browser. shadcn's registry is unreachable from this environment, so `button.tsx` and `sheet.tsx` were authored directly against `@radix-ui/react-dialog`; they are what `shadcn add` would have vendored.
- **FloatingHelpButton** (`src/components/layout/FloatingHelpButton.tsx`) is a Client Component that **hides on `/book/*`** (no exit at the moment of conversion) and opens WhatsApp from the API number. **It is currently not mounted in `layout.tsx`** — removed on request for now; re-add `<FloatingHelpButton whatsappNumber={site.settings?.whatsappNumber ?? null} />` after the footer to restore it.
- **Footer** gracefully drops any missing field. Route links (Explore, About, Become a Host…) are structural and live in `src/lib/nav.ts`; the footer's "Explore" column is built from real API tags. `PRIMARY_NAV` deliberately has **no** /login, /signup or /account — there is no `User` model.
- **Icons: Lucide.** Note lucide 1.x removed brand icons, so the Instagram link uses `Camera` (with an `aria-label`) rather than mixing in a second icon system.

### The component library (Phase 3)

The reusable, **presentational** design system every page is assembled from. It ships **no pages** — the components take typed props and render; the data comes from a Server Component (via a service) or a Client Component (via REST) higher up. **A component never fetches, never imports a service/Prisma/Supabase.** Props are the DTOs from `src/services/types.ts`, so a component consumes exactly what the API returns.

Organised by role under `src/components/`:

- **`ui/`** — primitives: `button`, `badge`, `tag`, `chip` (interactive filter/link pill), `rating`, `price` (+ `formatPrice`), `avatar`, `divider`, `skeleton`, `input`, `textarea`, `select`, `empty-state`.
- **`shared/`** — indicators and helpers: `Thumbnail` (photo well with the roofline fallback for a stay with no image), `FitScoreBadge` (the gold ✓ Inspected stamp), `VerifiedBadge` (mist-tick trust mark), `AmenityIcon` (keyword→Lucide glyph), `FeatureItem`, `StatItem` (the dotted-leader ledger line).
- **`sections/`** — `SectionHeading`, `SectionDivider`.
- **`cards/`** — `StayCard` (the one that matters most — five pages use it), `ReviewCard`, `HostCard`, `ExperienceCard`, `GuideCard`.
- **`search/`** — `SearchBar` + `SearchField` (the composable bar), `SearchFilters` (the chip row).
- **`booking/`** — `BookingSummary`, `BookingSteps`, `GuestCounter`, `DateField` (trigger only — the picker is a later phase), `TimelineStep` (the trip-timeline node).
- **`gallery/`** — `Gallery` (hero mosaic), `ImageGrid`, `Lightbox` (Radix Dialog: focus trap, Escape, scroll lock).

Rules baked into the components so a caller cannot break them: the **FitScore stamp renders only when `fitScore` is set**; **`ratingAvg === null` shows "New stay", never a zero** (`Rating` returns `null`, `StayCard` shows a Badge); **every figure is mono** via `.num` (`Price`, `Rating`, `StatItem`, `GuestCounter`); the **owner DTO has no phone/email**, so `HostCard` cannot leak them; **review photos are signed URLs** — `ReviewCard` drops a null-URL photo rather than caching or breaking. Interactivity is isolated to the few Client Components that need it (`Chip`, `SearchFilters`, `GuestCounter`, `DateField`, `Gallery`, `Lightbox`); the cards and most primitives stay Server Components. Motion animates `transform`/`opacity` only, never `transition-all`, and the global `prefers-reduced-motion` backstop covers it.

`next.config.ts` allows `*.supabase.co` through `next/image` so components render real Storage media; a stay with no photo falls back to `Thumbnail`'s roofline well.

### The Home page (Phase 4)

`src/app/page.tsx` — the first real product page, replacing the placeholder. A **Server Component**, assembled entirely from Phase 3 components; the section components live in `src/components/home/`.

- **Data follows the architecture exactly.** Each data section is an async Server Component that reads through a server-only helper in **`src/lib/home.ts`** (`getHomeFeaturedStays`, `getHomeExperiences`, `getHomeGuides`) → the service layer → Prisma. **No self-fetch of the REST API.** Each helper is `cache()`-wrapped and try/catches to an empty list, so a DB blip degrades one section (empty/omitted) instead of 500-ing the page.
- **Sections, in order:** `Hero` (with `HomeSearch`), `TrustBar`, `FeaturedStays`, `ExperienceCategories`, `TravelInspiration`, `FinalCTA`, `VerificationChecklist` (the "what verification actually means" band — static brand copy). Experiences and guides render nothing when empty; featured stays shows an `EmptyState`. The data sections **stream inside `<Suspense>`** with card-shaped skeleton fallbacks (`src/components/home/skeletons.tsx`), so the hero paints immediately.
- **The hero uses the seeded plantation video** (`public/hero/hero-background.mp4`) on every screen — muted, looping, `playsInline` — with a still poster (`hero-poster.jpg`, an ffmpeg-extracted frame) as its fallback until it plays, under a bark overlay + bottom gradient (the one sanctioned gradient, for legibility). Its height is a **fixed `min-h` (34/40rem), not `100svh`** — a deliberate call so the headline, copy, both CTAs **and the search card all sit within the first viewport on phone and desktop**.
- **`HomeSearch` is the only client island besides `Reveal`** — UI only, no booking logic: it composes the search primitives and, on submit, routes to `/explore?checkin=…&checkout=…&guests=N` (Explore will interpret them). `Reveal` is a tiny IntersectionObserver wrapper that fades sections up on scroll (transform/opacity only, no-JS-safe, respects reduced-motion; motion tokens `animate-fade-up`/`reveal` are in globals.css).
- **SEO:** per-page `metadata` (absolute title, description, canonical `/`, Open Graph + Twitter with the plantation poster as the image, never the logo) plus `Organization` JSON-LD. `metadataBase` is set in the layout. Semantic landmarks throughout; sections are `aria-labelledby` their `SectionHeading` (which now takes an `id`).
- **Two Phase 3 components gained responsive polish here** (used only on Home so far): `SearchBar` lays its fields out as a 2×2 grid on mobile / a divided row on desktop, and `SearchField` carries its own `bg-card` and grows to share the row.

### The Explore page (Phase 5)

`src/app/explore/page.tsx` — property discovery, built on a **hybrid** of the two data paths, exactly as the architecture prescribes.

- **Initial render is server-side via the service.** The page is a Server Component: it parses the filters from the URL (`searchParams`), reads the matching stays through `getExploreStays` in `src/lib/explore.ts` → `getAllStays` (service) → Prisma, sorts them, and hands the result to the client. So **every filter URL is real SSR HTML** — crawlable, shareable, and correct on first paint (verified: `/explore?budget=10000-` server-renders the empty state; `/explore?tag=couples&tag=family` server-renders only the stay carrying both tags — AND semantics). No self-fetch of `/api/stays` on the server.
- **Interactive filtering is client-side via REST.** `ExploreClient` (`src/components/explore/`) takes the SSR result as `initialStays` (a `skipInitialFetch` ref avoids a redundant fetch on mount). Each filter change (a) updates state, (b) pushes the new query to the URL with the **History API** (`pushState`) — shareable, bookmarkable, and back/forward-navigable via a `popstate` listener — **without a server round-trip**, and (c) re-fetches `GET /api/stays` for the new filters, dimming the grid while it loads. It never reads `useSearchParams` after mount, so a History-API URL change causes no re-render or double fetch.
- **Filters live in the URL, nowhere else.** All the vocabulary and the pure URL⇄filter functions are in **`src/lib/explore-filters.ts`** — framework-free, no `server-only` (it type-imports `StayCard`, which is erased at build), so **both the server page and the client use the same parser/serialiser**. Filter chips map to real tag slugs (AND semantics); Budget → `minPrice`/`maxPrice`; Group size → `guests`.
- **Sort is client-side.** The `/api/stays` endpoint has no sort param, so `sortStays` reorders the fetched array (Recommended / Price ↑ / Price ↓ / Top rated / Newest). "Newest" is why `StayCard` gained a **`createdAt`** field (added to the DTO: `types.ts`, `cardSelect`, `mappers.ts`, and the OpenAPI `stayCardSchema`/`stayDetailSchema` — the compile-time DTO pin enforced both). Changing only the sort re-orders without a network call. `createdAt` crosses the RSC boundary as a `Date` and arrives from REST as an ISO string, so `sortStays` coerces with `new Date(...)`.
- **Onboarding chooser.** Budget and group size are set through **`ExploreIntro`** — a big, friendly two-step Radix dialog (budget → group size, one screen at a time) that opens on **every entry** to `/explore` (a fresh mount = a fresh visit; it pre-fills from the current URL filters). "See stays" applies the answers (updates the URL + refetches); "Skip" shows everything. The page toolbar therefore has **no** budget/group-size selects — the choices show back as **removable pills** with an "Adjust" button that reopens the chooser. `introOpen` starts `true` from a pure initializer (no effect, so it's lint-clean and hydration-safe; Radix defers the portal to the client). Reopening bumps an `introKey` to remount the dialog fresh.
- **Reused, not rebuilt:** `StayCard`, `SearchFilters` (the chip row), `EmptyState`, `Button`, and the Home `CardGridSkeleton`; sort uses a small custom animated `Dropdown` (`ui/dropdown.tsx`). The filter toolbar (preference pills + Adjust, Sort, tag chips) sits under the compact header and **scrolls away with the page — it is not sticky**. The live count and reset sit above the grid. While a filter fetch is in flight the grid is **replaced by skeleton cards** (keeping the previous count so the layout holds), not dimmed.
- **No map.** The design's optional map pane was deliberately left out for now (per instruction); the single-column-to-3-up grid stands on its own and a map column can be added later without reworking the data flow.
- **SEO:** per-page metadata, canonical `/explore`, `h1`/`h2` hierarchy, `aria-live` on the count.

### The Stay Detail page (Phase 6)

`src/app/stays/[slug]/page.tsx` — the page everything upstream exists to deliver a guest to. A Server Component; sections live in `src/components/stay/`.

- **One query for the body.** `getStayDetail` (`src/lib/stay.ts`, server-only → `getStayBySlug`) already returns images, rooms, experiences, amenities, nearby places, owner and published reviews together — the same services the `/reviews` and `/nearby` routes delegate to — so the page does **not** re-fetch those separately (and never self-fetches REST). Related stays are a genuinely separate query: `getRelated` behind its own `<Suspense>`. `cache()` means the page and `generateMetadata` share one read. A missing/unpublished slug → `notFound()`.
- **Order:** gallery → identity → (mobile booking card) → story → quick facts → amenities → rooms → host → experiences → nearby → reviews, with the booking card pinned in a right column (`lg:sticky top-20`) and related stays full-width below.
- **The story block is the brand's signature** — bark panel, gold eyebrow, paper italic narrative, `whitespace-pre-line` so the writer's paragraphs survive. The Inspected note (gold panel, "Visited by Rohan Shetty, March 2026") renders **only when there is a real FitScore and a real visit date**.
- **Dates are picked in Stayze's own `Calendar`** (`src/components/booking/Calendar.tsx`), not a native picker or a third-party one — built so the ledger's rules hold: **every day number is mono**, the month is Fraunces with the year in mono, and the selection is **mist** (never a generic black), with a soft `mist/12` band tying the two filled ends together. Unavailable days are **struck through, not hidden** — a guest should see the shape of the month. It takes an optional `disabled(date)` predicate, so per-date availability can drop in later without a redesign. The two `DateField`s are its triggers (the role Phase 3 built them for); the calendar stays closed until asked for and closes itself once a full range is picked. `toISODate`/`nightsBetween` live beside it, so nothing re-implements date maths.
- **The booking card shows no total, deliberately.** Nightly rates can be overridden per date (weekends, festivals), so multiplying the base price would quote a figure the server disagrees with; the real estimate comes from `POST /api/booking`. It carries dates/guests into `/book/[slug]` as query params. Desktop = sticky side card; mobile = the same card inline **plus** a sticky bottom bar (`MobileBookingBar`).
- **Reused, not rebuilt:** `Gallery` + `Lightbox`, `StayCard`, `ReviewCard`, `HostCard`, `ExperienceCard`, `Thumbnail`, `StatItem`, `AmenityIcon`, `FitScoreBadge`, `Rating`, `Price`, `Tag`, `GuestCounter`, `SectionHeading`, `Skeleton`. "Show all N reviews" is a native `<details>` — no client JS. The only client components are the gallery/lightbox and the booking card.
- **The gallery rotates on a 5-second hold** (`Gallery`, rebuilt in this phase). **Mobile** is a full-width scroll-snap carousel of _every_ photo (it used to show one static photo — the worst use of the best asset on the page); autoplay scrolls it, and native swipe works with no JS. **Desktop** keeps the mosaic, where the lead tile crossfades through the photos the side tiles don't already show (0, then 3, 4, 5…), so an image is never on screen twice. Autoplay reads the carousel's _current_ scroll position each tick, so a guest who swipes ahead is never yanked back. Motion asks permission and gives control: `prefers-reduced-motion` never starts it, hover/focus pauses it, and there is an explicit pause/play button (WCAG 2.2.2) beside the mono counter.
- **Two layout traps this uncovered, both worth remembering:** (1) `Gallery`'s supporting tiles lacked `sm:col-span-2`, so on the 4-column mosaic they took one column each and left the bottom-right quarter empty. (2) **`aspect-[…]` needs a plain `div`** — a `<button>` sizes from its content, and a fill image is absolutely positioned, so a button wrapped around one collapses to zero height and the photo never paints. Put the ratio on a div and lay the button over it as an `absolute inset-0` overlay.
- **Screenshot caveat:** headless captures of this page at `--force-device-scale-factor=2` render the photos blank (decode pressure with ~16 large images at 2×). It is an artifact, not a bug — verify at `=1`.
- **SEO:** `generateMetadata` (metaTitle/metaDescription with sensible fallbacks), canonical `/stays/[slug]`, Open Graph + Twitter using the hero photo, and **`LodgingBusiness` JSON-LD** — which publishes the locality, geo, price range, amenities and check-in/out, but **never the exact address** (not shown before booking) and **never a zero rating** for an unreviewed stay.

### The booking flow (Phase 7)

`src/app/book/[slug]/page.tsx` — the conversion path. **One screen, two fields.**

- **The shape is deliberate.** The guest already chose the stay, the dates and the party size on the stay page, so asking again is theatre. The trip rides along as a line they can open and change (`Calendar` + `GuestCounter`, collapsed when it arrived prefilled); the only things to type are **a name and a mobile number**. Everything else is composed into the WhatsApp template by the service. No payment step (v1.1 has no payment fields), no account step (there are no accounts).
- **Hybrid, as agreed.** The page shell is a Server Component reading the stay through `getStayDetail` (server-only helper → service; never a self-fetch), so an unknown slug 404s before anything is typed. The one write goes over **`POST /api/booking`** — the REST path, never a service import. `robots: noindex` — `/stays/[slug]` is the page that should rank.
- **The booking is persisted before the handoff.** `BookingConfirmation` renders the reference (the largest thing on screen — with no accounts it is the only way back to the trip), then _attempts_ WhatsApp with `window.open` and offers the same link as a button. A popup blocked after an `await` then costs a tap, not the booking.
- **Validation twice, on purpose.** `src/lib/booking-form.ts` is a **pure** module (Zod only) mirroring `createBookingSchema` — it exists because `schemas.ts` imports `BUCKETS` from `storage.ts` (`server-only`), so a Client Component can't touch it. The server stays the authority; a 422's per-field `issues` are mapped back onto the fields, so drift surfaces where the guest can fix it. Zod's raw text ("Too small: expected string…") is never shown — known fields get a sentence, and a 400 (e.g. "CoffeeCharm sleeps 6. You asked for 9.") is already human and shown verbatim.
- **No total is quoted before submitting, and `BookingSummary` no longer multiplies rate × nights.** `estimateTotal` prices night by night, so overrides count: a real booking for 2 nights at ₹6,500 came back **₹16,300, not ₹13,000**. The only total shown is the authoritative one `POST /api/booking` returns, on the confirmation.
- **Verified end to end against the running server**, not just typechecked: a real POST created `STZ-…`, `GET /api/booking/[reference]` confirmed the row (status `NEW`, `caretakerPhone` null until confirmed), the 400 and 422 shapes were driven, and the WhatsApp template was decoded and read. The verification rows were deleted afterwards — the table is back to the 5 seeded bookings.

### The My Trip page (Phase 8)

`src/app/trip/[reference]/page.tsx` — the guest's trip dashboard, reached by **booking reference, not login** (there are no accounts). `/trip` is the lookup entry point.

- **Reached by code, and the code is semi-secret.** Both routes are `robots: noindex, nofollow`. The `/trip` lookup (`TripLookupForm`, a small client island) validates the reference _shape_ (`STZ-…`) and routes to `/trip/[reference]`; it deliberately does not check existence, which would let anyone probe which codes are real. A miss on `/trip/[reference]` renders the **in-page `TripNotFound`** (with a retry form), not a hard 404, and never says _why_ it missed — the fix is the same either way.
- **Architecture as agreed.** A Server Component reads the booking through `getTrip` (`src/lib/trip.ts`, server-only → `getBookingByReference`), plus the stay's full detail and the site contacts via the same helpers — never a self-fetch. **The caretaker's phone is gated in the service** (null until the booking is CONFIRMED), so the page renders what it's handed and cannot leak it: `TripCaretaker` shows a calm locked state until then.
- **`src/lib/trip-status.ts` is a pure module** (no data access) mapping `BookingStatus` → a badge label/tone and a headline, plus `trackerStep()` for the four-milestone bar (Requested → Confirmed → Your stay → Completed). Status is the authority — dates only decide, within a CONFIRMED booking, whether the guest is still waiting, mid-stay, or back. The tracker **reuses `BookingSteps`**; COMPLETED passes `current` past the last step so all four read as done; CANCELLED shows a banner, not a bar.
- **Sections, all reusing the design system:** header (photo + status pill legible over any photo) · status tracker · review invite (only when COMPLETED — hands off to WhatsApp for now, the `POST /api/reviews` form slots in later) · booking details (`StatItem`) · directions (real post-booking address + a Google-Maps link that prefers coordinates, no embedded map) · caretaker · checklist (real check-in times threaded from the stay) · weather · Need help (contacts from `SiteSetting`, prefilled with the reference).
- **Weather is integration-ready, not integrated.** `TripWeather` renders a typed `TripWeatherForecast` when given one and a calm fallback (with the strip's silhouette, so nothing shifts later) when not. Wiring `GET /api/trip/[reference]/weather` is a data change — pass `forecast` — with no layout change. Same shape leaves room for email/push later without touching this page.
- **Verified against the running server** across every status: CONFIRMED (`STZ-8F3K2`, caretaker Ramu unlocked, real address, ₹13,000 estimate), NEW (`STZ-7B3X5`, caretaker locked), COMPLETED (`STZ-5T1W8`, review invite, all milestones ✓), an unknown reference (in-page not-found), and the `/trip` lookup — at desktop and mobile. Added an `error` tone to `Badge` for the cancelled state.

### The Experiences section (Phase 9)

`src/app/experiences/page.tsx` (listing) and `src/app/experiences/[slug]/page.tsx` (detail) — destination content: the things worth doing in Chikmagalur, and the doorway to booking a stay near one. Both Server Components; components live in `src/components/experiences/`.

- **Built honestly on the real model, which is thin.** `Experience` carries only `title, slug, story, excerpt, imageUrl, stays[]` — **no `category`, `duration`, `difficulty`, `season`, `location`, `highlights` or gallery columns.** So the page does **not** fabricate per-experience metadata (the failure mode the whole codebase avoids — cf. the weather placeholder, the withheld caretaker phone). It renders what exists and derives the rest transparently.
- **Themes are a derived facet, not stored data.** `src/lib/experience-themes.ts` is a **pure module** (no `server-only`, no data access) that classifies an experience into zero-or-more themes (Coffee & plantation, Slow mornings, Walks & views, Food & table, Evenings & stars, By the water, Rest & wellness, Work with a view) from keywords in its title + excerpt. It is a search-index facet and says so — the vocabulary table is the single source of truth, and `availableThemes()` hides any theme nothing matches, so **the filter row only ever shows themes with real experiences behind them** (no empty chips). When a real `Experience.category` column lands, swap `themesFor()` to read it and every consumer keeps working. The same `filterExperiences()` runs on the server's first paint and in the client island, so there is one classifier.
- **Architecture as agreed.** `src/lib/experiences.ts` (server-only, `cache()`-wrapped, try/catch → safe empty) is the read seam — `getExperiences` and `getExperienceDetail`, never a self-fetch. The detail's `cache()` is shared with `generateMetadata`. A missing/unpublished slug → `notFound()`.
- **Listing.** `ExperiencesHero` (invitation + one large _featured_ experience, chosen from a small preference list) over `ExperiencesExplorer` — a client island that owns **live search** (over title/excerpt) and **theme filters**, filtering the already-loaded set **in the browser** (the set is small; the REST route isn't needed) while keeping the search + themes in the **URL via the History API** so a filtered view is shareable and back/forward works — the same contract Explore holds. Reuses `SearchFilters`, `ExperienceCard`, `EmptyState`, `Reveal`, `Button`. Branded empty state with a reset.
- **Detail.** Immersive single-image hero (the model has one image — no faked multi-photo gallery), a `StatItem` overview strip that prints **only real facts** (region, how many stays offer it, their areas) plus one honestly-derived hint ("Best time", read off the theme), the `story` given room to breathe, an honest **"Good to know"** (general what-to-expect + what-to-bring for a hill outing — the same for every experience _because it genuinely is_, and it says so; becomes data-driven if a column is added), **"Where to do this"** — the real published stays that offer it, reusing `StayCard` unchanged (this is the whole reason an experience earns a URL), and a bark help panel (`ExperienceHelp`, contacts from `SiteSetting`, WhatsApp prefilled with the title).
- **SEO:** per-page metadata + canonical on both, `ItemList` JSON-LD on the listing and `TouristAttraction` on the detail, semantic `h1`/`h2`. Each route has a `loading.tsx` skeleton mirroring its layout.
- **Verified against the running server** at desktop, tablet and mobile: the listing (hero, featured, all 8 themes populated from the 15 seeded experiences, search, the branded empty state at `?q=` with no match), a detail page (`morning-coffee-walk` — overview derived "Early morning", real CoffeeCharm `StayCard` under "Where to do this"), and an unknown slug (renders the not-found body; the 200-in-dev status matches the existing stay page under the force-dynamic layout). Fixed one issue found in review: the `.stamp` utility (a gold pill) was wrong for the hero eyebrows over a photo — switched to `.eyebrow`.

### The Travel Guide section (Phase 10)

`src/app/travel-guide/page.tsx` (listing) and `src/app/travel-guide/[slug]/page.tsx` (detail) — the SEO engine: honest, local Chikmagalur guides that position Stayze as a trusted companion and feed readers toward a stay. Both Server Components; components live in `src/components/guide/`.

- **Rich, real data — unlike experiences.** `TravelGuide` carries a real `category` relation, `readTimeMinutes`, `author`, `publishedAt`, a Markdown `body`, and featured `stays[]`. So the listing's category filters run on **stored data**, not a derived facet — a chip appears only for a category with a loaded guide behind it (all 6 seeded categories: Itineraries, Hidden Waterfalls, Coffee Trails, Monsoon Travel, Best Cafes, Things To Do).
- **Architecture as agreed.** `src/lib/guides.ts` (server-only, `cache()`-wrapped, try/catch → safe empty) is the read seam — `getGuides`, `getGuideDetail` (shared with `generateMetadata`), `getGuideCategoryList`, and `getGuideExperiences`. Never a self-fetch. A missing/unpublished slug → `notFound()`.
- **The Markdown body renders server-side with no new dependency.** `src/lib/markdown.ts` is a **pure** block parser (headings, paragraphs, `-`/`1.` lists, `>` callouts, `![]()` images, `---` rules) and `GuideBody` turns each block into a branded React element, parsing inline `**bold**`/`*italic*`/`` `code` ``/`[link]()` into **real React nodes** — so there is **no `dangerouslySetInnerHTML`** and **zero client JS**. The body is trusted authored content from our own DB, not user input, which is why a hand-rolled parser (not a sanitizer-backed pipeline) is the right call; an unrecognised line falls through as a paragraph, never dropped.
- **Listing.** `GuideListHero` (invitation + the most-recent guide as a large lead story) over `GuideExplorer` — a client island owning **live search** (title/excerpt/category/author) and **category filters**, filtering the loaded set **in the browser** with state in the **URL via the History API** (shareable, back/forward-safe), and — because it also renders server-side for the initial HTML — a shared `?q=`/`?category=` link is already filtered and crawlable on first paint. Reuses `SearchFilters`, `GuideCard`, `EmptyState`, `Reveal`, `Button`.
- **Detail.** Large hero (`GuideDetailHero`, byline row: author · read time · published date, each shown only if present), the article body, honest **"Planning notes"** (`GuideTips` — general regional advice framed as exactly that, since guides carry no per-article tip fields), **"Experiences nearby"** — derived from the experiences offered at the guide's featured stays (`getGuideExperiences`; genuinely relevant, not a generic list; reuses `ExperienceCard`; omitted when empty), **"Stays for this trip"** — the guide's real featured stays reusing `StayCard`, and a bark `GuideHelp` panel (contacts from `SiteSetting`, WhatsApp naming the guide).
- **SEO — the point of the section.** Per-page metadata + canonical on both, `Blog` JSON-LD (with `blogPost` entries) on the listing and `Article` JSON-LD (byline, publish date, publisher) on the detail, semantic `h1`/`h2`/`h3` from the Markdown, OG `type: article` with `publishedTime`/`authors`. Fixed a double-brand title: some guide `metaTitle`s bake in "— Stayze" and the layout template also appends "· Stayze", so `generateMetadata` strips a trailing brand token and lets the template add exactly one. Each route has a `loading.tsx` skeleton.
- **Verified against the running server** at desktop, tablet and mobile: the listing (hero, featured lead, all 6 category chips, search, branded empty state at `?q=` with no match), a detail page (`hidden-waterfalls-chikmagalur` — Markdown headings/paragraphs/bold render, 4 derived nearby experiences, 3 real recommended `StayCard`s, the help panel), the title/`Article`/`Blog` structured data, and an unknown slug (not-found body).

## State

Scaffold, **Schema v1.1 migrated and live**, **seeded with development data**, **a working data layer**, **a complete REST API**, **the brand foundation**, **the application shell**, **the reusable component library**, and the customer-facing pages: **Home, Explore, Stay detail, the booking flow, the My Trip dashboard, the Experiences section, and the Travel Guide section** (Phases 4–10). The full customer content surface is now built.

The database holds 776 rows across all 21 tables and 75 objects across the five storage buckets. The service layer reads and writes it, and `src/app/api/` exposes it over REST. Both have been driven for real, not just typechecked: every endpoint was hit against the running server — 24 GET cases, the booking POST and its validation rules, the upload endpoint with its bucket allowlist, path-traversal guard, size and type caps, and the admin-key guard rejecting unauthenticated writes. Test rows and objects were cleaned up afterwards. CI is green on `main`.

What does not exist yet: the **static pages** (About, Become a Host, Contact, legal) and the **404/500** brand pages. No auth and no admin surface, by design (there is no `User` model). `FRONTEND.md` has the remaining build order. The founder-operability gap (no admin UI) is still the largest open item — see "Known gaps". A related content gap surfaced building Experiences: the `Experience` model has no structured facets (category, duration, difficulty, season, highlights), so that listing's filters run on **derived themes** rather than stored data — a real `Experience.category` (and friends) is the clean next step if the founder wants curated filtering, and `experience-themes.ts` is shaped so that swap touches one function. (Travel guides, by contrast, have a real `category` relation, so their filters are stored-data.)

Cancellation is **recorded, not enforced**. `Stay.cancellationPolicy`, `BookingRequest.cancelledAt` and `cancellationReason` exist so the decision can be written down. Nothing derives `status` from them, and nothing refunds anything — there is no payment. Setting `cancelledAt` does not cancel a booking; a human does, and then writes it down.
