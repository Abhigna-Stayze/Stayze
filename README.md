# Stayze

Customer portal for Stayze, built with Next.js (App Router), TypeScript and Tailwind CSS.

## Requirements

- Node.js 20 or newer
- npm

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

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
public/
  brand/        Logo, wordmark, favicon and badge SVGs
docs/
  SETUP.md      How this project was set up, and why
```

The `@/*` path alias maps to `src/*`.

## Context

- [CONTEXT.md](CONTEXT.md) — the business baseline: brand, model, operations, decisions, open items. Read it first.
- [AGENTS.md](AGENTS.md) — working rules for anyone (or any agent) touching this project.
- [docs/SETUP.md](docs/SETUP.md) — setup decisions, commit identity, current state.

`CONTEXT.md` and `AGENTS.md` are copies of the files in the parent workspace folder, which remains their source of truth. Keep them in sync.
