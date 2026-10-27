import { useSyncExternalStore, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, authKeys } from '@/features/auth/api/authApi'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/context/authContext'
import { sessionStore } from '@/features/auth/lib/sessionStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.get,
    sessionStore.get,
  )
  const isAuthenticated = Boolean(session?.token)

  // Validates a persisted token on load; a 401 clears the session via httpClient.
  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => authApi.me(signal),
    enabled: isAuthenticated,
    staleTime: Infinity,
    retry: false,
  })

  const value: AuthContextValue = {
    user: isAuthenticated ? (meQuery.data ?? session?.user ?? null) : null,
    isAuthenticated,
    login: async (credentials) => {
      const next = await authApi.login(credentials)
      queryClient.setQueryData(authKeys.me, next.user)
      sessionStore.set(next)
    },
    logout: () => {
      sessionStore.clear()
      queryClient.clear()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
