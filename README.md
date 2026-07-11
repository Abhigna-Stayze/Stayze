# Stayze

Customer portal for Stayze. Next.js (App Router), TypeScript, Tailwind CSS, Prisma against a Supabase Postgres database.

## Requirements

- Node.js 22 or newer (required by Prisma 7)
- npm
- A Supabase project (Postgres)

## Getting started

```bash
npm install               # postinstall generates the Prisma client
cp .env.example .env      # then fill in the two connection strings
npm run dev
```

The app runs at http://localhost:3000.

The Prisma client is generated into `src/generated/prisma`, which is gitignored rather than committed — `postinstall` regenerates it on every `npm install`.

## Environment

Two variables, both from Supabase (Project Settings → Database → Connection string). See [.env.example](.env.example).

| Variable       | Port | Purpose                                                    |
| -------------- | ---- | ---------------------------------------------------------- |
| `DATABASE_URL` | 6543 | Pooled connection (PgBouncer). Used by the app at runtime. |
| `DIRECT_URL`   | 5432 | Direct, unpooled connection. Migrations require this.      |

`.env` is gitignored. Never commit it.

## Database

Prisma is the ORM; the schema is [prisma/schema.prisma](prisma/schema.prisma). Connection config lives in [prisma.config.ts](prisma.config.ts) rather than in the schema itself, which is why the `datasource` block carries no `url`.

```bash
npx prisma migrate dev --name <change>   # apply a schema change + write the migration
npx prisma generate                      # regenerate the client (migrate dev does this too)
npx prisma studio                        # browse the data
```

**Use `migrate dev`. Do not use `prisma db push`.** `db push` applies a schema with no migration file, leaving no history and nothing to replay. It was used during initial setup, so it appears in old commits — that is not the pattern to follow. Migrations live in `prisma/migrations/` and are committed with the schema.

The first migration has not been created yet — see the Migrations section of [CONTEXT.md](CONTEXT.md) for the two commands that get there.

### Querying

Import the client from [src/lib/db.ts](src/lib/db.ts) — never construct a `PrismaClient` directly:

```ts
import { prisma } from "@/lib/db";

const users = await prisma.user.count();
```

That module wires the client to the pooled connection through `@prisma/adapter-pg` (Prisma 7 requires a driver adapter) and reuses a single instance across hot reloads in development.

## Scripts

| Script                 | Description                       |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the development server      |
| `npm run build`        | Create a production build         |
| `npm run start`        | Serve the production build        |
| `npm run lint`         | Run ESLint                        |
| `npm run typecheck`    | Type-check without emitting files |
| `npm run format`       | Format with Prettier              |
| `npm run format:check` | Check formatting without writing  |

`postinstall` runs `prisma generate` automatically, so the client is always present after `npm install`.

CI (`.github/workflows/ci.yml`) runs format-check, lint, typecheck and build on every push to `main` and every pull request.

## Project structure

```
src/
  app/          App Router routes, layouts and global styles
  lib/db.ts     Prisma client instance — import from here
  generated/    Prisma client (generated, gitignored)
prisma/
  schema.prisma Data model
public/
  brand/        Logo, wordmark, favicon and badge SVGs
```

The `@/*` path alias maps to `src/*`.

## Agent skills

The Supabase Postgres best-practices skill is a local development aid and is **not committed** — `.agents/`, `.claude/` and `skills-lock.json` are all gitignored. Set it up on a new machine with:

```bash
npx skills add supabase/agent-skills
```

## Context

[CONTEXT.md](CONTEXT.md) — how the project is set up, the commit identity this repo expects, known gaps, and what to do next. Read it before picking up work.

Business context (brand, model, operations, open items) lives in the parent workspace folder, not in this repo.
