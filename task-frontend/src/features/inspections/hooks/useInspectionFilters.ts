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
  const filters = parseInspectionFilters(searchParams)

  const setFilters = (patch: Partial<InspectionFilters>) => {
    setSearchParams(
      (current) =>
        serializeInspectionFilters({
          ...parseInspectionFilters(current),
          ...patch,
        }),
      { replace: true },
    )
  }

  const clearFilters = () => {
    setFilters({
      severity: DEFAULT_FILTERS.severity,
      status: DEFAULT_FILTERS.status,
      from: undefined,
      to: undefined,
    })
  }

  return {
    filters,
    setFilters,
    clearFilters,
    activeFilterCount: countActiveFilters(filters),
  }
}
