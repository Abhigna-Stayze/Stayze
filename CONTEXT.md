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

One rule, and everything else follows from it: **the UI never talks to the database or to storage.**

```
client
      ↓
src/app/api/**/route.ts            ← REST. Validates, calls a service, returns JSON.
      ↓
src/services/*.service.ts          ← all database access lives here
      ↓
src/lib/prisma.ts
      ↓
PostgreSQL

client
      ↓
src/app/api/upload/route.ts
      ↓
src/lib/storage.ts                 ← the only door to Storage
      ↓
src/lib/supabase.ts
      ↓
Supabase Storage
```

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
- **Header** (`Header.tsx`) is a Server Component, `sticky top-0`, paper with a hairline base. Desktop `Navigation` and the `MobileNavigation` drawer swap at `lg`. Only `NavLink` is a Client Component — it reads the pathname for the active (clay) state; everything else stays server-rendered.
- **MobileNavigation** is a Radix Dialog (`src/components/ui/sheet.tsx`), which gives the focus trap, Escape-to-close, body scroll lock and focus return for free — verified in a browser. shadcn's registry is unreachable from this environment, so `button.tsx` and `sheet.tsx` were authored directly against `@radix-ui/react-dialog`; they are what `shadcn add` would have vendored.
- **FloatingHelpButton** is a Client Component for one reason: it **hides on `/book/*`** (no exit at the moment of conversion, per the design). Fixed bottom-right, opens WhatsApp from the API number.
- **Footer** gracefully drops any missing field. Route links (Explore, About, Become a Host…) are structural and live in `src/lib/nav.ts`; the footer's "Explore" column is built from real API tags. `PRIMARY_NAV` deliberately has **no** /login, /signup or /account — there is no `User` model.
- **Icons: Lucide.** Note lucide 1.x removed brand icons, so the Instagram link uses `Camera` (with an `aria-label`) rather than mixing in a second icon system.

## State

Scaffold, **Schema v1.1 migrated and live**, **seeded with development data**, **a working data layer**, **a complete REST API**, **the brand foundation for the UI**, and **the application shell**.

The database holds 776 rows across all 21 tables and 75 objects across the five storage buckets. The service layer reads and writes it, and `src/app/api/` exposes it over REST. Both have been driven for real, not just typechecked: every endpoint was hit against the running server — 24 GET cases, the booking POST and its validation rules, the upload endpoint with its bucket allowlist, path-traversal guard, size and type caps, and the admin-key guard rejecting unauthenticated writes. Test rows and objects were cleaned up afterwards. CI is green on `main`.

What does not exist yet: **any product pages**. The brand foundation and the shell (header, footer, floating help — all wired to `GET /api/site`) are in, but the only route is a placeholder home. No auth, no admin surface. The next step is Phase 3 — the stay card, then Home → Explore → Stay detail. `FRONTEND.md` has the build order.

Cancellation is **recorded, not enforced**. `Stay.cancellationPolicy`, `BookingRequest.cancelledAt` and `cancellationReason` exist so the decision can be written down. Nothing derives `status` from them, and nothing refunds anything — there is no payment. Setting `cancelledAt` does not cancel a booking; a human does, and then writes it down.
