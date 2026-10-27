import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  SEVERITIES,
  SORT_FIELDS,
  SORT_ORDERS,
  STATUSES,
} from '@/features/inspections/constants'
import { ISO_DATE_PATTERN } from '@/features/inspections/schemas'
import type { InspectionFilters } from '@/features/inspections/types'

export const DEFAULT_FILTERS: InspectionFilters = {
  severity: [],
  status: [],
  from: undefined,
  to: undefined,
  sortBy: DEFAULT_SORT_BY,
  order: DEFAULT_SORT_ORDER,
}

/** Keeps only known values, deduped, in canonical enum order (stable query keys). */
function canonicalize<T extends string>(
  values: Iterable<string>,
  allowed: readonly T[],
): T[] {
  const requested = new Set(values)
  return allowed.filter((value) => requested.has(value))
}

function parseList<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): T[] {
  if (!raw) return []
  return canonicalize(
    raw.split(',').map((part) => part.trim()),
    allowed,
  )
}

function parseOne<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.find((value) => value === raw) ?? fallback
}

function parseDate(raw: string | null): string | undefined {
  if (!raw || !ISO_DATE_PATTERN.test(raw)) return undefined
  return Number.isNaN(Date.parse(raw)) ? undefined : raw
}

export function parseInspectionFilters(
  params: URLSearchParams,
): InspectionFilters {
  return {
    severity: parseList(params.get('severity'), SEVERITIES),
    status: parseList(params.get('status'), STATUSES),
    from: parseDate(params.get('from')),
    to: parseDate(params.get('to')),
    sortBy: parseOne(params.get('sortBy'), SORT_FIELDS, DEFAULT_SORT_BY),
    order: parseOne(params.get('order'), SORT_ORDERS, DEFAULT_SORT_ORDER),
  }
}

/** Serialises filters to URL params, omitting empty values and defaults. */
export function serializeInspectionFilters(
  filters: InspectionFilters,
): URLSearchParams {
  const params = new URLSearchParams()
  const severity = canonicalize(filters.severity, SEVERITIES)
  const status = canonicalize(filters.status, STATUSES)
  if (severity.length > 0) params.set('severity', severity.join(','))
  if (status.length > 0) params.set('status', status.join(','))
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.sortBy !== DEFAULT_SORT_BY) params.set('sortBy', filters.sortBy)
  if (filters.order !== DEFAULT_SORT_ORDER) params.set('order', filters.order)
  return params
}

/** Number of active filter groups (sort is not a filter). */
export function countActiveFilters(filters: InspectionFilters): number {
  return (
    (filters.severity.length > 0 ? 1 : 0) +
    (filters.status.length > 0 ? 1 : 0) +
    (filters.from || filters.to ? 1 : 0)
  )
}
