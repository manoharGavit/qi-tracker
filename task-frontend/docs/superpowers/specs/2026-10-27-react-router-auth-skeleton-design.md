# React Router Auth Skeleton — Design

Date: 2026-10-27  
Project: `vfrs` (existing Vite + React 19 + TypeScript app)  
Status: Approved for planning

## Goal

Turn the default Vite React template into a production-shaped SPA skeleton with:

- Feature-first folder structure
- React Router v7 data mode (`createBrowserRouter`)
- Public vs private routes
- Auth simulated with localStorage and a demo login form

## Decisions

| Topic | Choice |
|-------|--------|
| Folder style | Feature-first (`features/*`, shared UI/lib, `app/` for router/providers/layouts) |
| Router | React Router v7 data mode |
| Auth | Demo login form; session object in localStorage |
| Depth | Starter product shell (not minimal, not full production scaffold) |
| Architecture approach | Feature modules + central router |

## Folder structure

```text
src/
  app/
    providers/              # AppProviders (AuthProvider + RouterProvider)
    router.tsx              # createBrowserRouter route tree
    layouts/
      PublicLayout.tsx      # public chrome + <Outlet />
      AppLayout.tsx         # authenticated chrome + <Outlet />
  features/
    auth/
      components/           # LoginForm
      context/              # AuthProvider, useAuth
      pages/                # LoginPage
      lib/                  # localStorage session read/write/clear
      types.ts
    home/pages/             # public landing
    dashboard/pages/
    settings/pages/
    profile/pages/
  shared/
    components/ui/          # Button, Input
    components/routing/     # RequireAuth, GuestOnly
    lib/                    # small helpers as needed
    types/
  assets/
  main.tsx
  index.css
```

Path alias: `@/` → `src/` (Vite `resolve.alias` + TypeScript `paths`).

Default Vite demo UI (`App.tsx` / demo CSS) is removed or reduced to an entry that mounts providers + router.

## Auth model

**Storage key:** `vfrs.auth.session`

**Session shape:**

```ts
type AuthSession = {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: 'user' | 'admin'
  }
}
```

**Behavior:**

- Boot: `AuthProvider` reads session from localStorage once and hydrates React state.
- Login: any non-empty email + password is accepted. Create a fake token, derive `name` from the email local-part, default `role: 'user'`, persist session, navigate to `/dashboard` (or safe `redirect` query).
- Logout: clear session from state and localStorage, navigate to `/login`.
- API surface: `{ user, isAuthenticated, login, logout }`.

Role is stored for future use only; this pass does not enforce role-based routes.

## Routing

Data-mode route tree in `src/app/router.tsx`:

| Path | Access | UI |
|------|--------|-----|
| `/` | Public | Home (PublicLayout) |
| `/login` | Guest only | LoginPage under PublicLayout |
| `/dashboard` | Private | Dashboard placeholder (AppLayout) |
| `/settings` | Private | Settings placeholder (AppLayout) |
| `/profile` | Private | Profile placeholder (AppLayout) |
| `*` | — | Simple Not Found |

**Guards:**

- `RequireAuth`: if not authenticated, redirect to `/login?redirect=<current pathname + search>`.
- `GuestOnly`: if authenticated, redirect to `/dashboard`.
- Post-login `redirect` must be an in-app path only (starts with `/`, not `//`) to avoid open redirects.

Private routes nest under a layout route that renders `RequireAuth` → `AppLayout` → child routes.  
Public routes nest under `PublicLayout`.

## UI shell

- **PublicLayout:** brand/name, link to Login (when logged out), `<Outlet />`.
- **AppLayout:** nav links (Dashboard, Settings, Profile), Logout, `<Outlet />`.
- **Shared UI:** `Button`, `Input` — used by LoginForm; keep styling minimal and consistent via CSS variables in `index.css`.
- Feature pages are placeholders (title + short copy), not product UI.

## Dependencies to add

- `react-router-dom` (v7) — web SPA entry for data mode APIs (`createBrowserRouter`, `RouterProvider`, `Outlet`, `Navigate`, `Link`, `useNavigate`, `useSearchParams`).

No form library, UI kit, or state library in this pass.

## Out of scope

- Real backend / API auth
- Role-based route enforcement
- Tests, CI, E2E
- Global error boundary / API client / env config modules (deferred from full scaffold)
- Visual design system beyond minimal usable chrome

## Success criteria

1. Visiting `/dashboard` while logged out redirects to `/login`.
2. Submitting login with any email/password writes `vfrs.auth.session` and lands on `/dashboard` (or safe redirect).
3. Full page refresh keeps the user authenticated from localStorage.
4. Logout clears storage and sends the user to `/login`.
5. Visiting `/login` while authenticated redirects to `/dashboard`.
6. Folder layout matches the feature-first structure above and `@/` imports work.

## Implementation notes

- Prefer thin pages that compose feature components.
- Keep auth persistence logic in `features/auth/lib`, not in components.
- Guards are React route elements (not loaders) so they can read `AuthProvider` context; loaders remain available for later data fetching.
- Do not invent extra features beyond this spec.
