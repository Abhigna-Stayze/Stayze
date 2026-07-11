# Stayze

Customer portal for Stayze. Next.js (App Router), TypeScript, Tailwind CSS, Prisma against a Supabase Postgres database.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project (Postgres)

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the two connection strings
npx prisma generate       # generates the client into src/generated/prisma
npm run dev
```

The app runs at http://localhost:3000.

`npx prisma generate` is required after a fresh clone: the generated client is written to `src/generated/prisma`, which is gitignored rather than committed.

## Environment

Two variables, both from Supabase (Project Settings → Database → Connection string). See [.env.example](.env.example).

| Variable       | Port | Purpose                                                    |
| -------------- | ---- | ---------------------------------------------------------- |
| `DATABASE_URL` | 6543 | Pooled connection (PgBouncer). Used by the app at runtime.  |
| `DIRECT_URL`   | 5432 | Direct, unpooled connection. Migrations require this.       |

`.env` is gitignored. Never commit it.

## Database

Prisma is the ORM; the schema is [prisma/schema.prisma](prisma/schema.prisma). Connection config lives in [prisma.config.ts](prisma.config.ts) rather than in the schema itself, which is why the `datasource` block carries no `url`.

```bash
npx prisma db push     # push schema changes to the database (no migration files)
npx prisma generate    # regenerate the client after editing the schema
npx prisma studio      # browse the data
```

`db push` is fine while the schema is in flux. Switch to `npx prisma migrate dev` once the schema needs a versioned history.

## Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the development server      |
| `npm run build`     | Create a production build         |
| `npm run start`     | Serve the production build        |
| `npm run lint`      | Run ESLint                        |
| `npm run typecheck` | Type-check without emitting files |

## Project structure

```
src/
  app/          App Router routes, layouts and global styles
  generated/    Prisma client (generated, gitignored)
prisma/
  schema.prisma Data model
public/
  brand/        Logo, wordmark, favicon and badge SVGs
```

`.agents/` and `.claude/` hold agent skills locally and are gitignored.

The `@/*` path alias maps to `src/*`.

## Agent skills

The Supabase Postgres best-practices skill is used locally but **not committed**. `.agents/` and `.claude/` are gitignored; only [skills-lock.json](skills-lock.json) is tracked, which pins the version by content hash.

Restore the skill on a fresh clone with:

```bash
npx skills add supabase/agent-skills
```

Same relationship as `package-lock.json` and `node_modules`: the lockfile is committed, the contents are not.

## Context

[CONTEXT.md](CONTEXT.md) — how the project is set up, the commit identity this repo expects, known gaps, and what to do next. Read it before picking up work.

Business context (brand, model, operations, open items) lives in the parent workspace folder, not in this repo.
