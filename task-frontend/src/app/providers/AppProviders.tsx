import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { toast } from 'sonner'
import { queryClient } from '@/app/queryClient'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { sessionStore } from '@/features/auth/lib/sessionStore'
import { configureHttpClient } from '@/shared/api/httpClient'
import { Toaster } from '@/shared/components/ui/sonner'

configureHttpClient({
  getToken: sessionStore.getToken,
  onUnauthorized: () => {
    if (!sessionStore.get()) return
    // Clearing the session makes RequireAuth redirect to /login?redirect=<current>.
    sessionStore.clear()
    queryClient.clear()
    toast.error('Your session has expired. Please sign in again.')
  },
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  )
}
