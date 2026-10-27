import type { AuthSession } from '@/features/auth/types'

export const AUTH_SESSION_KEY = 'qi-tracker.auth.v1'

type Listener = () => void

const listeners = new Set<Listener>()

function readFromStorage(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession> | null
    if (!parsed?.token || !parsed.user?.email) return null
    return parsed as AuthSession
  } catch {
    return null
  }
}

let current: AuthSession | null = readFromStorage()

function emit(): void {
  for (const listener of listeners) listener()
}

/** In-memory cached session backed by localStorage; subscribe via useSyncExternalStore. */
export const sessionStore = {
  get(): AuthSession | null {
    return current
  },
  getToken(): string | null {
    return current?.token ?? null
  },
  set(session: AuthSession): void {
    current = session
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
    emit()
  },
  clear(): void {
    if (current === null) return
    current = null
    localStorage.removeItem(AUTH_SESSION_KEY)
    emit()
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
