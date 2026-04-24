# frontend-platform

Next.js (App Router) product shell and dashboard UI for the platform. Styling uses **CSS Modules** and global design tokens in `src/app/globals.css` — **no Tailwind** in this repo.

## Scripts

```bash
npm run dev       # local dev server
npm run build     # production build
npm run lint      # ESLint
npm run test      # Vitest watch
npm run test:run  # Vitest CI
```

## Layout

- App shell and navigation: `src/components/layout`
- Feature modules: `src/modules/*` (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md))
- API surface: `src/lib/api` and `src/lib/api/adapters` (wired to backend endpoints)

## Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` when wiring real HTTP calls.
