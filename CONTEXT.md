# Context — development

Development context for the Stayze customer portal. Scope is deliberately narrow: **how the codebase is set up, and how to work in it.** It is written so that someone (or some agent) with no prior conversation can pick the project up cold.

Business context — brand, business model, operations, payout tiers, open items — lives in `CONTEXT.md` and `AGENTS.md` in the **parent workspace folder**, one level above this repo. It is intentionally **not** duplicated here. Read it there. Don't copy it in: two copies drift, and a stale copy is worse than none.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16, App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| ORM | Prisma 7 |
| Linting | ESLint (`eslint-config-next`) |
| Package manager | npm |
| Node | 20 or newer |

Next.js is a settled founder decision (Ashwin, 2026-07-03), recorded in the parent folder under `00 — Foundation / Stayze — Decision Log — Tech Direction Resolution (2026-07-03).md`. It supersedes the earlier "static HTML, no framework" ADR. App Router vs Pages was left open in that entry; this scaffold answers it — **App Router**.

## Layout

```
src/
  app/          App Router routes, layouts, global styles
  generated/    Prisma client — generated, gitignored
prisma/
  schema.prisma Data model
public/
  brand/        Logo, wordmark, favicon and badge SVGs
```

The `@/*` path alias maps to `src/*`.

`.agents/` and `.claude/` hold agent skills locally. Both are gitignored — see §4 below.

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
npm install @prisma/client
npm install dotenv --save-dev
npx prisma init
npx prisma db push
npx prisma generate
```

Note `@types/node`, not `@type/node` — the latter is a typo and does not exist on npm.

`@prisma/client` is the runtime the generated client needs; `dotenv` is required because `prisma.config.ts` opens with `import "dotenv/config"`. Both are declared explicitly rather than leaned on as transitive dependencies.

**Import the client from the generated path, not from `@prisma/client`:**

```ts
import { PrismaClient } from "@/generated/prisma/client";
```

The `prisma-client` generator emits to `src/generated/prisma` (see the `output` in `schema.prisma`), so `@prisma/client` is the runtime dependency but not the import path. This import resolves and typechecks today — verified.

**But `new PrismaClient()` does not compile yet, and this is the one thing standing between here and a working query.** Prisma 7 removed the bare constructor: `PrismaClientOptions` requires *either* a driver adapter *or* an Accelerate URL. There is no zero-argument form. For Supabase Postgres that means:

```bash
npm install @prisma/adapter-pg pg
```

```ts
// src/lib/db.ts — does not exist yet
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

Use the **pooled** `DATABASE_URL` here — `DIRECT_URL` is for migrations only. In dev, cache the instance on `globalThis` so Next's hot reload doesn't open a new connection pool on every edit.

`prisma init` produced `prisma/schema.prisma` and `prisma.config.ts`. The setup differs from stock Prisma in two ways that will confuse you if you don't know:

- **Connection config lives in `prisma.config.ts`, not the schema.** The `datasource db` block in `schema.prisma` deliberately carries no `url` / `directUrl`. Prisma 7 reads them from the config file instead, which is where `DIRECT_URL` is wired in for migrations.
- **The client is generated to `src/generated/prisma`**, not into `node_modules`. That path is gitignored, so **a fresh clone must run `npx prisma generate`** or imports will fail.

The schema currently holds one placeholder model (`User`, with `id` and `email`). It is not the real data model. The Content & Data Model spec in the parent workspace is what the real entities should be derived from.

### 4. Agent skills

```bash
npx skills add supabase/agent-skills
```

Installs the Supabase Postgres best-practices skill into `.agents/skills/`, with `.claude/skills/` holding a **relative symlink** to it so Claude Code picks it up.

**The skill files are deliberately not committed.** `.agents/` and `.claude/` are gitignored; only `skills-lock.json`, which pins the version by content hash, is tracked. Same relationship as `package-lock.json` and `node_modules` — the lockfile travels, the contents are reinstalled. Run the command above on a fresh clone to restore the skill.

(They *were* committed briefly, in commit `0d0e073`, then removed. The files remain in git history. They're public documentation from the Supabase repo — no secrets — so this was left alone rather than rewriting history.)

## Environment

Two variables, both from Supabase (Project Settings → Database → Connection string). `.env.example` is the template; `.env` is gitignored and must never be committed.

| Variable | Port | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | 6543 | Pooled connection (PgBouncer). App runtime. |
| `DIRECT_URL` | 5432 | Direct, unpooled. Migrations require this. |

The pooled/direct split is a Supabase requirement, not a preference: PgBouncer in transaction mode can't run the statements migrations need.

## Known gaps

Real, and worth handling before building on top of this:

- **No driver adapter, so the client cannot be instantiated.** The single blocker to querying the database. `npm install @prisma/adapter-pg pg`, then create `src/lib/db.ts` — see §3 above for the exact shape. Nothing imports the client yet, so nothing is currently broken.
- **The `User` model is a placeholder.** Derive the real schema from the Content & Data Model spec.
- **The brand is not applied.** The SVGs are in `public/brand/` but wired into nothing — the app still ships the default `src/app/favicon.ico`, and `globals.css` still carries the scaffold's Geist fonts and neutral colours rather than the brand palette and type stack. See the parent `CONTEXT.md` §1 for the palette and the Fraunces / Inter / JetBrains Mono stack. Note the mono-for-all-numerics rule is a hard rule there, not a suggestion.
- **No CI, no tests, no migration history.** `db push` is being used rather than `migrate dev`, so there are no migration files. Fine while the schema is in flux; switch before anything ships.

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
- `npm run typecheck` and `npm run lint` both pass before a commit.
- Never commit `.env*` (`.env.example` is the one exception, and it holds placeholders only).
- Regenerate the Prisma client after any schema change.

## State

Scaffold plus a database connection. One placeholder route, one placeholder model, no application code between them. No backend logic, no auth, no CI.
