# frontend-platform architecture

## Boundaries

- **Routes** live under `src/app`. Route files stay thin: render a module `*Screen` server component or compose layout only.
- **Feature modules** live under `src/modules/<name>`. A module owns its UI (`*View`), async data orchestration (`*Screen`), and thin `api/*` wrappers that call into `src/lib/api`.
- **Shared UI** lives in `src/components/ui` (design primitives) and `src/components/layout` (shell, navigation). These must not import feature modules.
- **HTTP and contracts** live in `src/lib/api` (`apiRequest`, errors) and `src/lib/api/adapters` (per-domain calls, including placeholders). UI and modules must not call `fetch` directly for product APIs—go through adapters (wrapping `apiRequest` when the backend exists).
- **Auth hooks** live in `src/lib/auth`. Replace placeholders when identity is integrated.

## Import rules

1. `src/components/ui` and `src/components/layout` must not depend on `src/modules/*`.
2. Feature modules must not import other feature modules. Share via `src/components` or `src/lib` only.
3. Cross-cutting helpers go in `src/lib/utils` and `src/types`.

## Styling

- **No Tailwind.** Use CSS Modules (`.module.css`) next to components and global design tokens in `src/app/globals.css` (`:root` CSS variables).

## Adding a new module

1. Create `src/modules/<feature>/` with `api/`, `<Feature>View.tsx`, `<Feature>Screen.tsx`, and `index.ts` exports.
2. Add a route under `src/app/<feature>/page.tsx` that renders `<Feature>Screen />`.
3. Add navigation in `src/components/layout/nav-items.ts`.
4. Add a typed adapter under `src/lib/api/adapters/<feature>.ts` (real `apiRequest` calls later).
5. Add a smoke test for the view under `tests/smoke/`.

## Environment

- `NEXT_PUBLIC_API_BASE_URL` — optional until the backend exists; `apiRequest` prefixes paths with this value.
