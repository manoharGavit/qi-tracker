import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import { getErrorMessage, getFieldErrors } from '@/shared/api/apiError'

/**
 * Maps a failed request onto a react-hook-form instance: 422 details go to their
 * fields, anything else becomes a form-level `root.server` error.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly FieldPath<T>[],
): void {
  const fieldErrors = getFieldErrors(error)
  let mapped = false
  for (const field of fields) {
    const message = fieldErrors[field]
    if (message) {
      setError(field, { type: 'server', message }, { shouldFocus: !mapped })
      mapped = true
    }
  }
  if (!mapped) {
    setError('root.server', { type: 'server', message: getErrorMessage(error) })
  }
}
