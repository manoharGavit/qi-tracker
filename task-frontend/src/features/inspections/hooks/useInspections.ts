import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { inspectionsApi } from '@/features/inspections/api/inspectionsApi'
import { inspectionKeys } from '@/features/inspections/lib/queryKeys'
import type { InspectionFilters } from '@/features/inspections/types'

export function useInspections(filters: InspectionFilters) {
  return useQuery({
    queryKey: inspectionKeys.list(filters),
    queryFn: ({ signal }) => inspectionsApi.list(filters, signal),
    placeholderData: keepPreviousData,
  })
}
