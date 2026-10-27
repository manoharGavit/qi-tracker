# React Router Auth Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a feature-first Vite React app with React Router v7 data mode, localStorage auth demo, and public/private routes.

**Architecture:** Central `app/router.tsx` owns the route tree. `features/auth` owns session persistence and AuthProvider. Route guards (`RequireAuth`, `GuestOnly`) read auth context. Feature pages are thin placeholders under shared layouts.

**Tech Stack:** React 19, TypeScript, Vite 8, react-router-dom v7

## Global Constraints

- Follow design: `docs/superpowers/specs/2026-10-27-react-router-auth-skeleton-design.md`
- Storage key exactly: `vfrs.auth.session`
- Path alias: `@/` → `src/`
- No real API, no role enforcement, no test suite (verify via `npm run build` + manual auth flows)
- No git commits unless the repo exists and the user asks
- Prefer focused files; strip default Vite demo UI

---

## File map

| Path | Responsibility |
|------|----------------|
| `vite.config.ts` | `@` alias |
| `tsconfig.app.json` | `paths` for `@/*` |
| `src/features/auth/types.ts` | AuthSession / User types |
| `src/features/auth/lib/session.ts` | localStorage read/write/clear |
| `src/features/auth/context/AuthContext.tsx` | AuthProvider + useAuth |
| `src/features/auth/components/LoginForm.tsx` | Demo login form |
| `src/features/auth/pages/LoginPage.tsx` | Login page shell |
| `src/features/home/pages/HomePage.tsx` | Public home |
| `src/features/dashboard/pages/DashboardPage.tsx` | Private placeholder |
| `src/features/settings/pages/SettingsPage.tsx` | Private placeholder |
| `src/features/profile/pages/ProfilePage.tsx` | Private placeholder |
| `src/shared/components/ui/Button.tsx` | Button |
| `src/shared/components/ui/Input.tsx` | Input |
| `src/shared/components/routing/RequireAuth.tsx` | Private guard |
| `src/shared/components/routing/GuestOnly.tsx` | Guest guard |
| `src/shared/lib/redirect.ts` | Safe redirect path helper |
| `src/app/layouts/PublicLayout.tsx` | Public chrome |
| `src/app/layouts/AppLayout.tsx` | Authenticated chrome |
| `src/app/router.tsx` | createBrowserRouter tree |
| `src/app/providers/AppProviders.tsx` | Auth + Router providers |
| `src/app/pages/NotFoundPage.tsx` | 404 |
| `src/main.tsx` | Mount AppProviders |
| `src/index.css` | Minimal base styles + variables |
| Delete/retire | `src/App.tsx`, `src/App.css` (demo) |

---

### Task 1: Tooling — alias + react-router-dom

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Install react-router-dom**

```bash
npm install react-router-dom
```

Expected: dependency listed in package.json

- [ ] **Step 2: Add Vite + TS path alias**

`vite.config.ts`:

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
})
```

`tsconfig.app.json` — add under `compilerOptions`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 3: Verify install**

```bash
npm ls react-router-dom
```

Expected: installed version without errors

---

### Task 2: Auth types + session + AuthProvider

**Files:**
- Create: `src/features/auth/types.ts`
- Create: `src/features/auth/lib/session.ts`
- Create: `src/features/auth/context/AuthContext.tsx`

**Produces:**
- `AuthSession`, `AuthUser`
- `readSession()`, `writeSession(session)`, `clearSession()`
- `AuthProvider`, `useAuth()` → `{ user, isAuthenticated, login, logout }`

- [ ] **Step 1: Types**

```ts
// src/features/auth/types.ts
export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginCredentials = {
  email: string
  password: string
}
```

- [ ] **Step 2: Session helpers**

```ts
// src/features/auth/lib/session.ts
import type { AuthSession } from '@/features/auth/types'

export const AUTH_SESSION_KEY = 'vfrs.auth.session'

export function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.token || !parsed?.user?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function writeSession(session: AuthSession): void {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
```

- [ ] **Step 3: AuthProvider**

```tsx
// src/features/auth/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { AuthSession, AuthUser, LoginCredentials } from '@/features/auth/types'
import {
  clearSession,
  readSession,
  writeSession,
} from '@/features/auth/lib/session'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function createDemoSession(email: string): AuthSession {
  const localPart = email.split('@')[0] || 'user'
  return {
    token: `demo.${btoa(email)}.${Date.now()}`,
    user: {
      id: crypto.randomUUID(),
      name: localPart,
      email,
      role: 'user',
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession())

  const login = ({ email, password }: LoginCredentials) => {
    if (!email.trim() || !password) {
      throw new Error('Email and password are required')
    }
    const next = createDemoSession(email.trim())
    writeSession(next)
    setSession(next)
  }

  const logout = () => {
    clearSession()
    setSession(null)
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
```

---

### Task 3: Shared UI, redirect helper, route guards

**Files:**
- Create: `src/shared/components/ui/Button.tsx`
- Create: `src/shared/components/ui/Input.tsx`
- Create: `src/shared/lib/redirect.ts`
- Create: `src/shared/components/routing/RequireAuth.tsx`
- Create: `src/shared/components/routing/GuestOnly.tsx`

**Consumes:** `useAuth`

**Produces:** `getSafeRedirectPath`, `RequireAuth`, `GuestOnly`, `Button`, `Input`

- [ ] **Step 1: redirect helper**

```ts
// src/shared/lib/redirect.ts
export function getSafeRedirectPath(
  candidate: string | null,
  fallback = '/dashboard',
): string {
  if (!candidate) return fallback
  if (!candidate.startsWith('/')) return fallback
  if (candidate.startsWith('//')) return fallback
  return candidate
}
```

- [ ] **Step 2: Button + Input**

Minimal accessible components using `className` props and native attributes (`type`, `onClick`, `value`, `onChange`, `disabled`, `required`, `id`, `name`, `autoComplete`).

- [ ] **Step 3: Guards**

`RequireAuth`: if `!isAuthenticated`, `<Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />`, else `<Outlet />`.

`GuestOnly`: if `isAuthenticated`, `<Navigate to="/dashboard" replace />`, else `<Outlet />`.

---

### Task 4: Layouts + feature pages + NotFound

**Files:**
- Create layouts, all feature pages, NotFound as in file map

**Consumes:** `useAuth`, `Button`, `Input`, `Link`, `Outlet`, `getSafeRedirectPath`

- [ ] **Step 1: PublicLayout** — brand “VFRS”, Login link when logged out, Dashboard link when logged in, `<Outlet />`
- [ ] **Step 2: AppLayout** — nav Dashboard/Settings/Profile, show user email, Logout button
- [ ] **Step 3: Pages** — Home, Login (+ LoginForm), Dashboard, Settings, Profile, NotFound placeholders
- [ ] **Step 4: LoginForm** — email/password required; on submit call `login`, then `navigate(getSafeRedirectPath(searchParams.get('redirect')))`

---

### Task 5: Router + providers + entry + styles

**Files:**
- Create: `src/app/router.tsx`
- Create: `src/app/providers/AppProviders.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.css`
- Delete: `src/App.tsx`, `src/App.css` (if unused)

**Route tree:**

```tsx
createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        element: <GuestOnly />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
```

`AppProviders`: `AuthProvider` wrapping `RouterProvider`.

`main.tsx`: render `<AppProviders />` instead of `<App />`.

- [ ] **Step 1: Implement router + providers + entry**
- [ ] **Step 2: Minimal CSS variables + layout/nav/form styles in index.css**
- [ ] **Step 3: Remove demo App files**

---

### Task 6: Verify

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: success, no TS errors

- [ ] **Step 2: Manual checklist** (dev server)
  - `/dashboard` logged out → `/login`
  - login any credentials → session in localStorage → `/dashboard`
  - refresh stays logged in
  - logout clears key → `/login`
  - `/login` while authenticated → `/dashboard`

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Feature-first folders | 2–5 |
| `@/` alias | 1 |
| localStorage session | 2 |
| Login form demo | 4 |
| Public/private layouts + guards | 3–5 |
| Placeholder features | 4 |
| Button/Input | 3 |
| Success criteria | 6 |
