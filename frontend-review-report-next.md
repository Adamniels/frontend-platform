# Frontend Review Report — Next Steps (Follow-up)

**Purpose:** Snapshot of what still needs attention after the stabilization and hybrid server-fetch work, so you can pick this up later without re-reading the whole history.  
**Scope:** [`frontend-platform`](.) only.  
**Supersedes for planning:** Treat this as the current “what to fix” list; the earlier [`frontend-review-report.md`](./frontend-review-report.md) is largely outdated for open work (many items there are already done).

---

## 1. Executive Summary

The frontend is in **solid shape for shipping**: production build passes, core data routes use **server-first** screens, dead code from the first review was removed, shared **load error** UI exists ([`JarvisInlineError`](./src/components/jarvis/JarvisInlineError.tsx)), accessibility improved for search and settings/profile sliders, **cookies are forwarded** for server-side API calls ([`forward-request-cookies.ts`](./src/lib/api/forward-request-cookies.ts) + [`client.ts`](./src/lib/api/client.ts)), and tests were expanded beyond pure smoke.

What remains is mostly **larger, intentional refactors**: shrink the **client footprint** (especially shell and experience-only routes), **converge on one design-system path** (`jarvis` vs [`components/ui`](./src/components/ui)), introduce a **`lib/data` (or equivalent) provider layer**, and continue **UX consistency**, **performance hygiene**, and **deeper tests**. None of that blocks day-to-day fixes if you tackle it incrementally.

---

## 2. Already Addressed (Reference — Do Not Re-triage)

These came from the first review or immediate follow-ups and are **done** in the current tree:

| Area | Notes |
|------|--------|
| Build / types | `DashboardSummary` includes optional `savedItems`; `next build` succeeds. |
| Dead code | Removed unused module API re-exports, unused `ui` components (except `LoadingState`), `token` / `use-access-token`, `delay` adapter, barrel `index` files where applicable. |
| Docs vs routes | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) matches `/`, `/dashboard`, `/jarvis`, server-first `*Screen` pattern. |
| Data loading (core modules) | Async server `*Screen` for dashboard, stats, workflow-runs, insights, input-needed, settings, profile; `loadError` string + `JarvisInlineError` on views. |
| API cookies on server | Incoming `Cookie` header forwarded to API `fetch` on the server; ISR-style `next.revalidate` skipped when session cookies are present (no-store for those requests). |
| A11y (partial) | [`SearchOverlay`](./src/components/layout/SearchOverlay.tsx) dialog naming + focus/Tab/Escape; profile/settings range labels; [`globals.css`](./src/app/globals.css) `prefers-reduced-motion`. |
| Tests | [`tests/smoke/adapters.test.ts`](./tests/smoke/adapters.test.ts), [`route-groups`](./tests/smoke/route-groups.test.tsx), [`load-states`](./tests/smoke/load-states.test.tsx), [`search-overlay`](./tests/layout/search-overlay.test.tsx), [`pending-input-nav`](./tests/layout/pending-input-nav.test.tsx), [`use-async-resource`](./tests/hooks/use-async-resource.test.tsx). |

---

## 3. What Still Needs Fixing

### 3.1 Large refactors (highest leverage for “easy to change later”)

| Item | Why it matters | Suggested direction |
|------|----------------|---------------------|
| **Single design-system path** | Today [`LoadingState`](./src/components/ui/LoadingState.tsx) still lives under `components/ui/` while product chrome is Jarvis + CSS Modules — two mental models. | Move loading to `jarvis/` (or formally bless one `ui` file + ban new `ui` via lint). Unify empty/error/loading with Jarvis primitives across modules. |
| **Smaller client footprint** | [`AppShell`](./src/components/layout/AppShell.tsx) and related layout remain large client surfaces; experience routes (`news`, `side-learning`, `saved-items`) still use server screens that only mount client experiences without server-fetched lists. | Split shell into subcomponents / optional server chrome; add server data for experience routes when APIs exist; lazy-load heavy client-only pages (`StartScreen`, `JarvisScreen`). |
| **Data provider layer** | `*Screen` files call module [`api/*`](./src/modules/dashboard/api/get-dashboard-summary.ts) / adapters directly — fine for now, but API shape changes will touch many screens. | Introduce [`src/lib/data`](./src/lib/data) (or similar): one loader per domain, error mapping, optional DTO → view-model mapping; screens import only `lib/data`. |

### 3.2 Standards and consistency (medium)

*Partially addressed (UX readability pass, 2026):* shared type tokens in [`globals.css`](./src/app/globals.css) (`--fs-label-*`, `--bar-h-*`, lifted `--color-text-dim`); new [`SegmentedControl`](./src/components/jarvis/SegmentedControl.tsx) for sharp HUD filters; [`JarvisButton` `size="sm"`](./src/components/jarvis/JarvisButton.tsx); Memory Center + shell micro-type scaled up; [`JarvisInlineError`](./src/components/jarvis/JarvisInlineError.module.css) uses `--color-danger`. Remaining gaps below.*

| Item | Path / area | Issue |
|------|-------------|--------|
| **Mixed module patterns** | `news`, `side-learning`, `saved-items` | `*Screen` is thin server wrapper around client `*Experience` only — no server-fetched list data yet (when backend exists, align with dashboard/insights). |
| **Inline styles** | [`TopBar`](./src/components/layout/TopBar.tsx), [`DashboardClient`](./src/modules/dashboard/DashboardClient.tsx), [`InsightsView`](./src/modules/insights/InsightsView.tsx), others | Still heavy `style={{}}` for dynamic visuals; harder to theme and batch-optimize. |
| **Empty / error UI** | Various `*View` files | Mix of `JarvisInlineError`, plain `<p>`, and card empty states — not one pattern everywhere. |
| **Clickable `JarvisCard` as div** | [`JarvisCard`](./src/components/jarvis/JarvisCard.tsx) + consumers | Keyboard support exists; still prefer `<button>` / `<Link>` where semantics are navigation or primary actions. |

### 3.3 UX / product polish (medium–low)

- Harmonize **empty-state** copy and layout (card vs paragraph) across modules.
- Reduce **placeholder copy** in dashboard/news/start where product is no longer a prototype.
- **Route meta vs mental model:** [`route-meta.ts`](./src/lib/shell/route-meta.ts) vs nav labels — confirm naming (“Start” vs home) with product.

### 3.4 Performance (medium)

| Item | Where | Note |
|------|-------|------|
| **Shell hydration cost** | `src/components/layout/*` | Still client-heavy by design; splitting + lazy islands reduces main-thread work. |
| **Timers** | [`TopBar`](./src/components/layout/TopBar.tsx) (1s tick), [`BootOverlay`](./src/components/layout/BootOverlay.tsx) | Consider pausing when tab hidden / reduced motion for clock. |
| **Revalidation** | Adapters use `next: { revalidate: 30 }` when **no** cookies | Correct for public reads; document that authenticated paths use no-store (see `client.ts`). |

### 3.5 Accessibility (remaining)

- **JarvisCard** “button” role on cards: audit usages so critical actions are real buttons/links.
- **Broader dialog audit:** notifications panel, unlock overlay — focus trap consistency with [`SearchOverlay`](./src/components/layout/SearchOverlay.tsx) pattern where applicable.

### 3.6 Tests (remaining)

| Gap | Suggested action |
|-----|------------------|
| **Lock / unlock** | Integration or component test for [`AccessGateProvider`](./src/components/layout/AccessGateProvider.tsx) + [`UnlockOverlay`](./src/components/layout/UnlockOverlay.tsx) flows (mock adapters). |
| **Search** | Extend beyond name + Escape (e.g. Tab cycle, result select) if you rely on keyboard-first UX. |
| **E2E** | No Playwright (or similar) in repo — add for critical journeys when stable environments exist. |
| **`lib/data` contract tests** | When data layer exists, test loaders with mocked `fetch` / adapters once per domain. |

---

## 4. Risks and Constraints (When You Return)

1. **Server `fetch` + cookies:** Keep [`getIncomingRequestCookieHeader`](./src/lib/api/forward-request-cookies.ts) in mind whenever adding caching or new API hosts; do not cache authenticated responses by URL alone.
2. **Dynamic routes:** Data routes that depend on cookies are **dynamic** (`ƒ` in build output) — expected; do not try to force them fully static without a different auth model.
3. **`emitUnauthorizedAccess` on 401** from server: still safe (guards `window` in [`access-events.ts`](./src/lib/auth/access-events.ts)); verify product expectation for “lock UI” when API returns 401 during RSC.

---

## 5. Prioritized Plan When You Pick This Up

### Quick wins (1–2 PRs)

- Migrate **`LoadingState`** → `JarvisLoadingState` (or equivalent) and drop dependency on `components/ui/` if you want a single tree.
- Add **`src/lib/data`** with 1–2 domains (e.g. dashboard + insights) and point only those screens at it as a pattern proof.
- **TopBar** visibility pause for the clock interval.

### Important (several PRs)

- **Experience routes:** server-fetched props into `NewsExperience` / `SideLearningExperience` / `SavedItemsExperience` when APIs are ready.
- **Shell split:** `AppShell` into notifications / search / main column components.
- **Unified empty/error** components under `jarvis/` and replace one-off markup module by module.

### Larger (epic)

- **Rationalize all client-only pages** (start, jarvis) with lazy chunks and extracted server subtrees.
- **ESLint** restricted imports during migration (`ui` vs `jarvis`, screens → adapters only via `lib/data`).
- **E2E** suite for login/access + one content + one settings flow.

---

## 6. Open Questions (Unchanged From Strategic Discussion)

- Should **`components/ui`** exist at all after `LoadingState` moves, or is **`jarvis` + `lib`** the only extension surface?
- **View models:** Introduce explicit DTO types + mapping at the adapter or `lib/data` boundary?
- **Client cache:** If you add TanStack Query (or similar), should it live only under `lib/hooks` and call the same loaders as the server?

---

## 7. How to Use This Doc

1. Treat **§3** as the backlog; **§5** as the order of attack.  
2. When an item is done, remove or strike it here (or replace this file with a dated revision).  
3. Keep **§2** as “already shipped” so you do not re-open closed threads.

---

*Generated as a follow-up to the original frontend review; codebase snapshot reflects post–server-first + cookie-forwarding state.*
