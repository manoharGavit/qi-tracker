import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  parseInspectionFilters,
  serializeInspectionFilters,
} from '@/features/inspections/lib/filterParams'
import type { InspectionFilters } from '@/features/inspections/types'

/** Filter + sort state lives in the URL so views are shareable and survive reloads. */
export function useInspectionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => parseInspectionFilters(searchParams),
    [searchParams],
  )

  const setFilters = useCallback(
    (patch: Partial<InspectionFilters>) => {
      setSearchParams(
        (current) => {
          const parsed = parseInspectionFilters(current)
          const shouldResetPage =
            patch.page === undefined &&
            ('severity' in patch ||
              'status' in patch ||
              'from' in patch ||
              'to' in patch ||
              'sortBy' in patch ||
              'order' in patch ||
              'limit' in patch)

          return serializeInspectionFilters({
            ...parsed,
            ...(shouldResetPage ? { page: 1 } : {}),
            ...patch,
          })
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setFilters({
      severity: DEFAULT_FILTERS.severity,
      status: DEFAULT_FILTERS.status,
      from: undefined,
      to: undefined,
      page: 1,
    })
  }, [setFilters])

  const setPage = useCallback(
    (page: number) => {
      setFilters({ page })
    },
    [setFilters],
  )

  const setPageSize = useCallback(
    (limit: number) => {
      setFilters({ limit, page: 1 })
    },
    [setFilters],
  )

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  )

  return {
    filters,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    activeFilterCount,
  }
}
