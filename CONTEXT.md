# Context — development

Development context for the Stayze customer portal. Scope is deliberately narrow: **how the codebase is set up, and how to work in it.** It is written so that someone (or some agent) with no prior conversation can pick the project up cold.

Business context — brand, business model, operations, payout tiers, open items — lives in `CONTEXT.md` and `AGENTS.md` in the **parent workspace folder**, one level above this repo. It is intentionally **not** duplicated here. Read it there. Don't copy it in: two copies drift, and a stale copy is worse than none.

## Rules — read before touching the database or the client

Three things that a fresh reader gets wrong by default. The repo's early history will actively mislead you on the first one.

1. **Schema changes go through `npx prisma migrate dev`. Never `npx prisma db push`.**
   `db push` applies a schema with no migration file, leaving no history and no way to replay a change. It was used during initial setup, so you will see it in old commands and old commits — that is not the pattern to copy. Migrations are versioned and committed under `prisma/migrations/`.

2. **Import the client from `@/lib/db`. Never construct one.**

   ```ts
   import { prisma } from "@/lib/db";
   ```

   `new PrismaClient()` does not compile: Prisma 7 requires a driver adapter argument. `src/lib/db.ts` supplies it and caches the instance across hot reloads.

3. **Generated types come from `@/generated/prisma/client`, not `@prisma/client`.**
   `@prisma/client` is the runtime dependency, but the generator writes to `src/generated/prisma`, so that is the import path.

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

Next.js is a settled founder decision (Ashwin, 2026-07-03), recorded in the parent folder under `00 — Foundation / Stayze — Decision Log — Tech Direction Resolution (2026-07-03).md`. It supersedes the earlier "static HTML, no framework" ADR. App Router vs Pages was left open in that entry; this scaffold answers it — **App Router**.

## Layout

```
src/
  app/          App Router routes, layouts, global styles
  lib/db.ts     Prisma client instance — import from here
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

**Prisma 7 has no zero-argument `PrismaClient` constructor.** `PrismaClientOptions` requires _either_ a driver adapter _or_ an Accelerate URL — `new PrismaClient()` will not compile. For Supabase Postgres the adapter is `@prisma/adapter-pg` (with `pg` and `@types/pg`), and the wiring lives in **`src/lib/db.ts`**:

```ts
import { prisma } from "@/lib/db";

const users = await prisma.user.count();
```

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

All from Supabase. **Nothing matching `.env*` is committed — not even an example file.** Get the values from Ashwin.

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

## Storage

Five public buckets, created in the Supabase dashboard: **`stays`**, **`owners`**, **`reviews`**, **`guides`**, **`experiences`**.

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

- **Nothing deletes storage objects.** Deleting a row cascades to its child rows, but never to the file in the bucket. Delete the object and the row together, or the buckets accumulate orphaned files. The seed re-uploads with `upsert`, so re-running it does not orphan anything — but application code will.
- **The `reviews` bucket is public, and probably should not be.** Guests upload personal photos there. The other four hold marketing media and are fine public. Consider moving `reviews` to a private bucket with signed URLs before real guests upload anything.
- **The seed is destructive and points at the only database.** `prisma/seed.ts` wipes all 21 tables before inserting. There is no separate dev database, so once real bookings exist, running it would delete them.
- **Schema v1.1 cuts scope the Developer Handoff lists as in-MVP.** Confirm with Ashwin before building around it, because §22 of that document makes it the contract:
  - **There is no `User` model — no auth, no accounts.** So `/login`, `/signup`, `/account`, `/account/saved` (wishlist collections) and `/admin` have no data model behind them, yet §19 lists all of them as MVP. The trip timeline sidesteps this: a guest returns via the `BookingRequest.reference` code rather than logging in. Wishlist collections and the admin back-office (§9, "not skippable") cannot be built on v1.1 as written.
  - **No standalone `Experience` model.** `StayExperience` is scoped to a single stay, so `/experiences` and `/experiences/[slug]` (§6.5) are unsupported.
  - **No payment fields.** v1.1 settles open decision #1 as **Option B, WhatsApp request-to-book**. That matches §8's heading but contradicts §8's own recommendation ("Build A") and §19 ("Full booking flow (Option A)"). The handoff doc should be amended so it stops saying both.
  - **`Review` has no link to `BookingRequest`**, so a reviewer cannot be verified as having stayed. Possibly deliberate, since `ReviewSource` allows imported Airbnb/Google reviews.
  - **`Stay.ratingAvg` and `Stay.reviewCount` are denormalised.** Nothing maintains them; they must be recomputed whenever a review is published.
- **Row Level Security is bypassed.** Prisma connects through the pooler as the `postgres` role, which ignores Supabase RLS policies entirely. It matters the moment auth exists: if Supabase Auth is added on the assumption that RLS protects rows, **it will not**. Either enforce every access rule in application code, or connect as a restricted role and design RLS deliberately. An architecture decision, not a bug — but it must be a conscious one.
- **The brand is not applied.** The SVGs are in `public/brand/` but wired into nothing — the app still ships the default `src/app/favicon.ico`, and `globals.css` still carries the scaffold's Geist fonts and neutral colours rather than the brand palette and type stack. See the parent `CONTEXT.md` §1 for the palette and the Fraunces / Inter / JetBrains Mono stack. Note the mono-for-all-numerics rule is a hard rule there, not a suggestion.
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
- Never commit `.env*` — no exceptions, not even an example file.
- Spec documents (`.docx`, `.pdf`, `.pptx`) stay in the parent workspace, never in this repo.
- Regenerate the Prisma client after any schema change (`migrate dev` does this for you).
- **Update this file in the same commit as the change it describes.** A stale `CONTEXT.md` is the one failure mode that makes every other convention here useless. If a step is now done, say it is done; if a command no longer works, fix the command.
- **Commits carry no AI attribution.** No `Co-Authored-By` trailers, no "Generated with" badges, no mention of Claude in a commit message. Authored as the commit identity above, and nothing else. `.claude/settings.json` sets `includeCoAuthoredBy: false` to enforce this locally; that file is gitignored, so re-create it on a fresh clone.

## State

Scaffold, a **working** database connection, **Schema v1.1 migrated and live**, and **the database fully seeded with development data**.

`prisma/migrations/20260711174828_init/` is applied and all 21 tables are populated: 3 stays, 24 stay images, 15 reviews, 5 bookings, 540 availability rows — 776 rows in total, plus 75 objects across the five storage buckets. Verified end to end: a `bucket` + `path` row resolves through the Supabase SDK to a public URL that returns HTTP 200 with the exact dimensions and byte size recorded in Postgres. CI is green on `main`.

What does not exist yet: **any application code at all**. There is one placeholder route and no page that reads a single row. Auth, the admin surface and real content are all still absent. The database is now ahead of the app — the next step is building the pages the Full Page Designs describe, starting with Home (featured stays) and Stay Detail, both of which now have real data behind them.
