# Setup notes

How this project was set up, and the decisions behind it. For the business itself — brand, model, operations, open items — read [CONTEXT.md](../CONTEXT.md) and [AGENTS.md](../AGENTS.md) at the repo root.

## What this is

The Stayze customer portal frontend. Next.js 16 (App Router), TypeScript, Tailwind CSS v4, ESLint.

Building on Next.js is a settled founder decision (Ashwin, 2026-07-03) recorded in `00 — Foundation / Stayze — Decision Log — Tech Direction Resolution (2026-07-03).md`. It supersedes the earlier "static HTML, no framework" ADR. App Router was one of the open plan questions in that entry; this scaffold answers it — App Router.

## Repository layout

The app lives in `web/` as its own git repository, nested inside the `Stayze/` folder on disk.

The parent folder holds business material — pitch decks, page design exports (`.pptx`, `.pdf`), architecture images, and the Drive-mirrored knowledge folders. Those stay out of the repo, so the code history stays clean and no large binaries get pushed.

Two exceptions were copied in deliberately:

- `AGENTS.md` and `CONTEXT.md` — the business baseline, so anyone (or any agent) working in the repo has the full picture without leaving it. They are **copies**; the originals in the parent folder remain the source of truth. If one changes, sync the other — they will otherwise drift apart silently.
- `public/brand/*.svg` — the logo, wordmark, favicon and badge assets, since the app will actually need them.

The GitHub repo is `Abhigna-Stayze/Stayze` — private, default branch `main`.

## Setup steps

1. Scaffolded with `create-next-app`: TypeScript, Tailwind, ESLint, App Router, `src/` directory, `@/*` import alias, npm. Git init was skipped so the repo could be initialized deliberately.
2. Removed the generated boilerplate:
   - The `CLAUDE.md` and `AGENTS.md` that `create-next-app` emits (unrelated to the Stayze `AGENTS.md` later copied in).
   - The demo splash page and the Next.js / Vercel marketing SVGs in `public/`.
3. Replaced the starter home page with a plain Stayze placeholder.
4. Set real metadata in `src/app/layout.tsx` — a title template (`%s · Stayze`) instead of "Create Next App".
5. Renamed the package from `web` to `stayze` and added a `typecheck` script.
6. Wrote the README.
7. Initialized git, committed, and pushed.
8. Copied in the business docs and brand SVGs described above.

## Two fixes to the scaffold's defaults

Worth knowing, because both are easy to reintroduce:

- **Font.** The scaffold loads the Geist font family via `next/font`, then immediately overrides `body` with `font-family: Arial, Helvetica, sans-serif` in `globals.css` — so the loaded font never actually applied. It now points at `var(--font-sans)`.
- **Package name.** Defaulted to `web` (after the directory), which is not what this project is called.

## Commit identity

Commits in this repo are authored as `Abhigna <302452169+Abhigna-Stayze@users.noreply.github.com>`.

This is set **repo-locally**, not globally. The reason: the global git identity on this machine is `AbhignaGowda <abhignagowda07@gmail.com>`, but the GitHub CLI is authenticated as the `Abhigna-Stayze` account. Committing with the global identity would have produced commits that GitHub could not link to the account they were pushed under — they'd show as an unlinked author. The `users.noreply.github.com` address is the one tied to `Abhigna-Stayze`, so commits attribute correctly without exposing a personal email address.

If you clone this repo elsewhere, set the same local identity, or the global one will silently take over:

```bash
git config user.name "Abhigna"
git config user.email "302452169+Abhigna-Stayze@users.noreply.github.com"
```

## Conventions

- Path alias `@/*` maps to `src/*`.
- Routes, layouts and global styles live under `src/app/`.
- `npm run typecheck` and `npm run lint` should both pass before committing. They did at initial commit.

## State

Scaffold only. No features, no routes beyond the home page, no backend, no environment variables, no CI. Nothing has been built on top of this yet.

The brand SVGs are present in `public/brand/` but not yet wired into anything — the app still uses the default `src/app/favicon.ico`, and the "Plantation ledger" palette and type stack (Fraunces / Inter / JetBrains Mono, per CONTEXT.md §1) are **not** yet reflected in `globals.css`, which still carries the scaffold's Geist fonts and neutral colours. That is the obvious next piece of work.
