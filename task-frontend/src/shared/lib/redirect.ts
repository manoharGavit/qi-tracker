export const DEFAULT_AUTHED_PATH = '/inspections'

export function getSafeRedirectPath(
  candidate: string | null,
  fallback = DEFAULT_AUTHED_PATH,
): string {
  if (!candidate) return fallback
  if (!candidate.startsWith('/')) return fallback
  if (candidate.startsWith('//')) return fallback
  if (candidate.startsWith('/login')) return fallback
  return candidate
}
