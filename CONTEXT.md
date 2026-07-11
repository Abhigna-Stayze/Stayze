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
  schema.prisma Data model
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

The first migration has **not been created yet**. `prisma/schema.prisma` now holds the real Schema v1.1 (21 models — `Stay`, `Owner`, `BookingRequest`, `Review`, `TravelGuide`, …) and passes `prisma validate`, but the database still carries the placeholder `User` table that `db push` created during setup. Because that table has no migration behind it, the first `migrate dev` will report **schema drift** and demand a reset. Do it deliberately instead:

```bash
npx prisma migrate reset --force --skip-seed   # drops the placeholder User table
npx prisma migrate dev --name init             # writes prisma/migrations/ and applies it
```

Safe today — the database holds one empty placeholder table and no rows. **`migrate reset` is destructive and development-only.** Never run it once real bookings exist.

Commit `prisma/migrations/` alongside `schema.prisma`. From that point, every schema change is `migrate dev`.

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

### 5. Tooling

- **`postinstall` runs `prisma generate`.** Not optional: the generated client is gitignored, so without this any fresh clone, CI run or Vercel build fails at typecheck.
- **Zod-validated env** in `src/lib/env.ts`. Import `env` from there, not `process.env`.
- **Prettier**, with `prettier-plugin-tailwindcss` to sort class names and `eslint-config-prettier` to stop ESLint fighting it. `npm run format` writes, `npm run format:check` verifies.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs format-check, lint, typecheck and build on every push to `main` and every PR. It supplies placeholder connection strings — the build never opens a connection, but `env.ts` validates the shape at import.

**CI pins Node 24, and the version matters twice over.** Prisma 7 requires Node ≥ 22 (`@prisma/streams-local` declares it), so Node 20 is out. And the npm major has to match the one that wrote `package-lock.json`: npm 10 and npm 11 resolve optional native dependencies differently, so `npm ci` on Node 20 rejects an npm 11 lockfile with `Missing: @emnapi/runtime from lock file`. Node 24 ships npm 11. If you regenerate the lockfile on a different npm major, expect CI to fail until the two agree. `engines` in `package.json` declares the floor.

## Environment

Two variables, both from Supabase (Project Settings → Database → Connection string). **Nothing matching `.env*` is committed — not even an example file.** Get the values from Ashwin.

Validated at import by `src/lib/env.ts`, so a missing or malformed URL fails immediately with a readable error.

| Variable       | Port | Purpose                                     |
| -------------- | ---- | ------------------------------------------- |
| `DATABASE_URL` | 6543 | Pooled connection (PgBouncer). App runtime. |
| `DIRECT_URL`   | 5432 | Direct, unpooled. Migrations require this.  |

The pooled/direct split is a Supabase requirement, not a preference: PgBouncer in transaction mode can't run the statements migrations need.

## Known gaps

Real, and worth handling before building on top of this:

- **The first migration has not been run.** See "Migrations" above — the database is still on the placeholder `User` table while `schema.prisma` holds Schema v1.1. Do this before anything else.
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

## State

Scaffold, a **working** database connection, and Schema v1.1 written but **not yet migrated**.

`src/lib/db.ts` queries the live Supabase Postgres instance — verified with a read, a write and a delete. `prisma/schema.prisma` holds the real 21-model Schema v1.1 and passes `prisma validate`, but the database still has the placeholder `User` table from setup; the first migration is the immediate next step (see "Migrations").

What does not exist yet: any application code that touches the client, auth, an admin surface, and any real content. One placeholder route, and nothing between it and the schema.
