# frontend-platform architecture

## Boundaries

- **Routes** live under `src/app`. Route files stay thin: render a module `*Screen` server component or compose layout only.
- **Feature modules** live under `src/modules/<name>`. A module owns its UI (`*View` and/or client `*Experience` components), async data orchestration (`*Screen`), and thin `api/*` wrappers that call into `src/lib/api`.
- **App shell** is client-heavy: `src/components/layout/AppShell.tsx` provides sidebar, top bar, boot overlay, command-palette search (`Cmd/Ctrl+K`), and `src/components/layout/PendingInputContext.tsx` for the **Input needed** badge count. The shell must not import feature modules.
- **JARVIS-style primitives** live under `src/components/jarvis/` (glass cards, buttons, tags, icons, aurora, chat bar, progress). These are presentation-only and must not import feature modules.
- **Legacy shared UI** may remain under `src/components/ui/` for older patterns; new work should prefer `jarvis` + CSS Modules.
- **HTTP and contracts** live in `src/lib/api` (`apiRequest`, errors) and `src/lib/api/adapters` (per-domain calls, including placeholders). UI and modules must not call `fetch` directly for product APIs—go through adapters (wrapping `apiRequest` when the backend exists).
- **Theme helpers**: `src/lib/theme/accent.ts` and `src/lib/theme/brightness.ts` persist shell accent (`--accent`) and brightness (`--shell-brightness`) to `localStorage` and the document root.
- **Auth hooks** live in `src/lib/auth`. Replace placeholders when identity is integrated.

## Routes (Phase A paths)

| Path | Module |
|------|--------|
| `/` | `dashboard` |
| `/stats` | `stats` |
| `/news` | `news` |
| `/side-learning` | `side-learning` |
| `/saved-items` | `saved-items` |
| `/insights` | `insights` |
| `/workflow-runs` | `workflow-runs` |
| `/input-needed` | `input-needed` |
| `/profile` | `profile` |
| `/settings` | `settings` |

Search is a **shell overlay** (not a dedicated route). Top bar titles map from pathname via `src/lib/shell/route-meta.ts`.

## Import rules

1. `src/components/jarvis`, `src/components/ui`, and `src/components/layout` must not depend on `src/modules/*`.
2. Feature modules must not import other feature modules. Share via `src/components` or `src/lib` only.
3. Cross-cutting helpers go in `src/lib/utils` and `src/types`.

## Styling

- **No Tailwind.** Use CSS Modules (`.module.css`) next to components and global design tokens in `src/app/globals.css` (`:root` CSS variables, including `--accent` and dark JARVIS chrome).

## Adding a new module

1. Create `src/modules/<feature>/` with `api/`, views/screens, and `index.ts` exports.
2. Add a route under `src/app/<feature>/page.tsx` that renders `<Feature>Screen />` (or a client experience if no server data yet).
3. Add navigation in `src/components/layout/nav-items.ts`.
4. Add a typed adapter under `src/lib/api/adapters/<feature>.ts` (real `apiRequest` calls later).
5. Add a smoke test under `tests/smoke/` (use `afterEach(cleanup)` when rendering client trees).

## Environment

- `NEXT_PUBLIC_API_BASE_URL` — optional until the backend exists; `apiRequest` prefixes paths with this value.
