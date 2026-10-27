import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
} from '@/features/auth/types'
import { http } from '@/shared/api/httpClient'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    http.post<AuthSession>('/api/auth/login', credentials, { auth: false }),
  me: (signal?: AbortSignal) => http.get<AuthUser>('/api/auth/me', { signal }),
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}
