# Context — development

Development context for the Stayze customer portal. The scope of this file is deliberately narrow: **how the codebase is set up, and how to work in it.**

Business context — brand, business model, operations, payout tiers, open items — lives in `CONTEXT.md` and `AGENTS.md` in the parent workspace folder, one level above this repo. It is intentionally **not** duplicated here. Read it there. Don't copy it in: two copies drift, and a stale copy is worse than none.

## What this is

The Stayze customer portal frontend.

| | |
| --- | --- |
| Framework | Next.js 16, App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Linting | ESLint (`eslint-config-next`) |
| Package manager | npm |
| Node | 20 or newer |

Next.js is a settled founder decision (Ashwin, 2026-07-03), recorded in the parent folder under `00 — Foundation / Stayze — Decision Log — Tech Direction Resolution (2026-07-03).md`. It supersedes the earlier "static HTML, no framework" ADR. App Router vs Pages was left open in that entry; this scaffold answers it — **App Router**.

## Layout

```
src/
  app/          App Router routes, layouts, global styles
public/
  brand/        Logo, wordmark, favicon and badge SVGs
```

The `@/*` path alias maps to `src/*`.

The repo is scoped to `web/`, nested inside the `Stayze/` workspace folder on disk. The parent folder holds decks, design exports, images and the Drive-mirrored knowledge base — none of that is under version control here, and it should stay that way. Keeps the code history clean and the binaries out.

## How this was initialized

1. `create-next-app` — TypeScript, Tailwind, ESLint, App Router, `src/` directory, `@/*` alias, npm. Git init skipped, so the repo could be initialized deliberately.
2. Stripped the scaffold's boilerplate: the `CLAUDE.md` / `AGENTS.md` it emits, the demo splash page, and the Next.js / Vercel marketing SVGs in `public/`.
3. Home page replaced with a plain Stayze placeholder.
4. Real metadata in `src/app/layout.tsx` — title template `%s · Stayze`, not "Create Next App".
5. Package renamed from `web` to `stayze`; added a `typecheck` script.
6. Brand SVGs copied into `public/brand/` from the design folder.

### Two scaffold defaults that were wrong

Both are easy to reintroduce, so they're worth knowing:

- **Font.** `create-next-app` loads Geist via `next/font`, then overrides `body` with `font-family: Arial, Helvetica, sans-serif` in `globals.css` — so the font it just loaded never applied. Now points at `var(--font-sans)`.
- **Package name.** Defaulted to `web`, after the directory. Not what the project is called.

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
- Never commit `.env*`. Secrets stay out of the repo.

## State

Scaffold. One placeholder route, no backend, no CI.

The brand SVGs are in `public/brand/` but aren't wired into anything yet — the app still ships the default `src/app/favicon.ico`, and `globals.css` still carries the scaffold's Geist fonts and neutral colours rather than the brand palette and type stack. Applying the brand is the obvious next piece of work.
