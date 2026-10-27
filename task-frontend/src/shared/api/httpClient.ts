import { ApiError, toApiErrorCode } from '@/shared/api/apiError'
import { API_BASE_URL } from '@/shared/config/env'

type QueryValue = string | number | undefined | null

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  /** Attach the bearer token and treat 401 as an expired session. Defaults to true. */
  auth?: boolean
  signal?: AbortSignal
}

type HttpClientConfig = {
  getToken: () => string | null
  onUnauthorized: () => void
}

let config: HttpClientConfig = {
  getToken: () => null,
  onUnauthorized: () => {},
}

export function configureHttpClient(next: Partial<HttpClientConfig>): void {
  config = { ...config, ...next }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_BASE_URL}${path}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }
  const search = params.toString()
  return search ? `${url}?${search}` : url
}

type Envelope<T> =
  | { success: true; data: T }
  | {
      success: false
      error?: { code?: string; message?: string; details?: unknown }
    }

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function request<T>(
  path: string,
  { method = 'GET', body, query, auth = true, signal }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (auth) {
    const token = config.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Unable to reach the server. Check your connection and try again.',
    )
  }

  const payload = (await readJson(response)) as Envelope<T> | null

  if (response.ok && payload?.success === true) {
    return payload.data
  }

  if (response.status === 401 && auth) {
    config.onUnauthorized()
  }

  const error = payload && payload.success === false ? payload.error : undefined
  throw new ApiError(
    response.status,
    toApiErrorCode(error?.code),
    error?.message ?? (response.statusText || 'Request failed'),
    error?.details,
  )
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(path, { ...options, method: 'PATCH', body }),
}
