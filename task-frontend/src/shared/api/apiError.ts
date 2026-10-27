export const API_ERROR_CODES = [
  'VALIDATION_FAILED',
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL_ERROR',
  'NETWORK_ERROR',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details: unknown

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function toApiErrorCode(value: unknown): ApiErrorCode {
  return API_ERROR_CODES.find((code) => code === value) ?? 'INTERNAL_ERROR'
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

type DetailEntry = { path?: unknown; field?: unknown; message?: unknown }

function toFieldName(entry: DetailEntry): string | null {
  if (typeof entry.field === 'string') return entry.field
  if (typeof entry.path === 'string') return entry.path.split('.').pop() ?? null
  if (Array.isArray(entry.path) && entry.path.length > 0) {
    return String(entry.path[entry.path.length - 1])
  }
  return null
}

/**
 * Normalises 422 `details` into `{ field: message }`. Accepts both a Zod-style
 * issue array (`[{ path, message }]`) and a flattened record (`{ field: string | string[] }`).
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || error.code !== 'VALIDATION_FAILED') return {}
  const { details } = error
  const result: Record<string, string> = {}

  if (Array.isArray(details)) {
    for (const entry of details as DetailEntry[]) {
      if (!entry || typeof entry !== 'object') continue
      const field = toFieldName(entry)
      if (field && typeof entry.message === 'string' && !result[field]) {
        result[field] = entry.message
      }
    }
    return result
  }

  if (details && typeof details === 'object') {
    const record =
      'fieldErrors' in details &&
      details.fieldErrors &&
      typeof details.fieldErrors === 'object'
        ? details.fieldErrors
        : details
    for (const [field, value] of Object.entries(record)) {
      const message = Array.isArray(value) ? value[0] : value
      if (typeof message === 'string') result[field] = message
    }
  }

  return result
}
