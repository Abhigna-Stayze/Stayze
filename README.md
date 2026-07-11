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
```

The `@/*` path alias maps to `src/*`.

## Context

[CONTEXT.md](CONTEXT.md) covers how the project is set up, the commit identity this repo expects, and the current state.

Business context — brand, model, operations, open items — lives in the parent workspace folder, not in this repo.
