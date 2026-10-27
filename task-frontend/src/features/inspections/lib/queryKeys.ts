import type { InspectionFilters } from '@/features/inspections/types'

export const inspectionKeys = {
  all: ['inspections'] as const,
  lists: () => [...inspectionKeys.all, 'list'] as const,
  list: (filters: InspectionFilters) =>
    [...inspectionKeys.lists(), filters] as const,
  detail: (id: string) => [...inspectionKeys.all, 'detail', id] as const,
  summary: () => [...inspectionKeys.all, 'summary'] as const,
}
