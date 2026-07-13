# Stayze

Customer portal for Stayze — a curated collection of homestays in Chikmagalur.

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma 7 against Supabase Postgres, with media in Supabase Storage.

## Requirements

- Node.js 22 or newer (Prisma 7 requires it)
- npm
- A Supabase project

## Getting started

```bash
cp .env.example .env      # then fill in the values
npm install               # postinstall generates the Prisma client
npm run dev
```

The app runs at http://localhost:3000.

To bring up a database from scratch:

```bash
npx prisma migrate deploy   # create the 21 tables
npx prisma db seed          # development data — see "Seed data" below
```

## Environment

Copy `.env.example` and fill it in from the Supabase dashboard. `.env` is gitignored and must never be committed.

| Variable                               | Purpose                                                                |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`                         | Pooled connection, port 6543 (PgBouncer). App runtime.                 |
| `DIRECT_URL`                           | Direct, unpooled, port 5432. Migrations and the seed.                  |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL. Public by design — the browser builds image URLs with it. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key. Public by design.                                            |
| `SUPABASE_SERVICE_ROLE_KEY`            | **Secret.** Bypasses Row Level Security. Server-side only.             |

The pooled/direct split is a Supabase requirement, not a preference: PgBouncer in transaction mode cannot run the statements a migration needs.

> **Never prefix the service-role key with `NEXT_PUBLIC_`.** Next.js inlines every `NEXT_PUBLIC_*` variable into the JavaScript bundle it sends to the browser. That key bypasses RLS, so a `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` would hand every visitor full read/write access to the database.

The environment is validated at import by [src/lib/env.ts](src/lib/env.ts), which is `server-only` — a client component that imports it fails the build rather than leaking a key.

## Architecture

One rule: **the UI never talks to the database or to storage.**

```
page / component  →  server action / API route  →  src/services/  →  src/lib/prisma.ts  →  PostgreSQL
page / component  →  src/lib/storage.ts  →  src/lib/supabase.ts  →  Supabase Storage
```

All database access goes through the service layer in [src/services/](src/services/). Services return DTOs, not Prisma rows — Prisma's `Decimal` cannot be passed to a client component, and a `bucket` + `path` pair is not a URL. [src/services/mappers.ts](src/services/mappers.ts) does both conversions in one place.

## API

A REST API under [src/app/api/](src/app/api/), built with Route Handlers. **Server Actions are not used** — the same endpoints serve the website, a future mobile app, an admin dashboard and WhatsApp automation.

**Interactive docs: [`/api/docs`](http://localhost:3000/api/docs)** — Swagger UI · spec: `/api/openapi.json`

The spec is generated from the same Zod schemas the API validates with ([src/lib/openapi.ts](src/lib/openapi.ts)), so it cannot drift. Response shapes are pinned to the service DTOs by a compile-time check — change a DTO without changing its schema and `npm run typecheck` fails.

| Method | Endpoint                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------- |
| GET    | `/api/stays` · `?featured` `?tag` `?area` `?minPrice` `?maxPrice` `?guests` `?limit`            |
| GET    | `/api/stays/[slug]` · `/nearby` · `/reviews` · `/related`                                       |
| GET    | `/api/guides` · `/api/guides/[slug]`                                                            |
| GET    | `/api/reviews?stay=<slug>`                                                                      |
| GET    | `/api/site`                                                                                     |
| POST   | `/api/booking` → `{ reference, whatsappUrl, estimatedTotal, nights }` · rate limited 5/IP/10min |
| GET    | `/api/booking/[reference]`                                                                      |
| POST   | `/api/upload` — multipart. Uploads, and optionally attaches to a row · `x-admin-key`            |
| DELETE | `/api/media/[type]/[id]` — removes the row **and** the storage object · `x-admin-key`           |

Every response uses one envelope:

```jsonc
{ "success": true,  "data": … }
{ "success": false, "error": { "message": "…", "issues": [ … ] } }
```

Routes are thin: validate with Zod, call a service, return JSON. No route touches Prisma, and a raw Prisma error is never returned to a client — it would leak table and column names.

`POST /api/upload` requires the `ADMIN_API_KEY` shared secret. With that variable unset it works in development and is refused in production; it fails closed on purpose.

**Media:** Postgres holds `bucket` + `path`; Supabase Storage holds the bytes, and nothing keeps them in step by itself. [src/services/media.service.ts](src/services/media.service.ts) is the only thing that changes both. `POST /api/upload` can attach to a row in the same request (`target`, `targetId`) and rolls the upload back if the attach fails; `DELETE /api/media/[type]/[id]` removes the row and the object together.

**Rate limiting** on `POST /api/booking` (5/IP/10 min) and `/api/upload` (60) is in-process — a speed bump, not a wall, on serverless. See [src/lib/rate-limit.ts](src/lib/rate-limit.ts).

## Database

The schema is [prisma/schema.prisma](prisma/schema.prisma) — 21 models. Connection config lives in [prisma.config.ts](prisma.config.ts) rather than in the schema, which is why the `datasource` block carries no `url`.

```bash
npx prisma migrate dev --name <change>   # apply a schema change and write the migration
npx prisma generate                      # regenerate the client — required after any change
npx prisma studio                        # browse the data
```

**Use `migrate dev`, never `prisma db push`.** `db push` applies a schema with no migration file, leaving no history and nothing to replay. Migrations live in `prisma/migrations/` and are committed alongside the schema.

**`migrate dev` does not regenerate the client.** Prisma 7 decoupled the two — run `prisma generate` yourself after every schema change, or the generated types will quietly describe the old schema.

Import the client from [src/lib/prisma.ts](src/lib/prisma.ts) and never construct a `PrismaClient`: a second instance means a second connection pool. In practice a page should not import it at all — use a service.

## Storage

Media lives in Supabase Storage across five buckets: `stays`, `owners`, `guides`, `experiences` are **public**; **`reviews` is private**.

Guest review photos are reached through short-lived **signed URLs**, not public ones — a guest's holiday photo is not marketing media, and a public URL to one is permanent. `getPublicUrl()` throws for a private bucket rather than handing back a link that 400s. Signed URLs expire: never cache or store them.

**Postgres stores only a reference — `bucket` + `path` — never a URL and never binary.** The public URL is derived at read time. That keeps the project ref out of the database and makes a future move to a CDN a config change rather than a data migration.

Every storage operation goes through [src/lib/storage.ts](src/lib/storage.ts). No page or component talks to Supabase Storage directly.

## Seed data

```bash
npx prisma db seed
```

Development data only: three Chikmagalur stays with owners, rooms, experiences, nearby places, reviews, travel guides, bookings and 180 days of availability — plus the images, which are uploaded to Storage rather than faked. The locations are real; the properties, owners, guests and prices are invented.

**The seed wipes every table before inserting.** Safe to re-run, and dangerous to point at a database holding real bookings.

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

`postinstall` runs `prisma generate`, so the client is present after every `npm install`. It is generated into `src/generated/prisma`, which is gitignored rather than committed.

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs format-check, lint, typecheck and build on every push to `main` and every pull request.

## Project structure

```
src/
  app/          App Router routes, layouts and global styles
  lib/
    prisma.ts   Prisma client singleton
    supabase.ts Supabase clients (browser + privileged admin)
    storage.ts  The only door to Supabase Storage
    env.ts      Zod-validated server environment
  services/     The data layer — all database access goes through here
  generated/    Prisma client (generated, gitignored)
prisma/
  schema.prisma Data model
  migrations/   Migration history
  seed.ts       Development seed
public/
  brand/        Logo, wordmark, favicon and badge SVGs
```

The `@/*` path alias maps to `src/*`.

## Further reading

[CONTEXT.md](CONTEXT.md) — how the project is set up, why it is set up that way, known gaps, and what to do next. Read it before picking up work.
