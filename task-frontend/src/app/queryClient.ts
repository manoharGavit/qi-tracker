import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/shared/api/apiError'

const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: unknown): boolean {
  // Client errors (4xx) are deterministic; only retry network and server failures.
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false
  }
  return failureCount < MAX_RETRIES
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
})
