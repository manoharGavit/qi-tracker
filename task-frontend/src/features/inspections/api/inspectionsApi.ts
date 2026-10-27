import type {
  CreateInspectionInput,
  Inspection,
  InspectionFilters,
  ResolveInspectionInput,
  SummaryRow,
} from '@/features/inspections/types'
import { http } from '@/shared/api/httpClient'

export function toListQuery(filters: InspectionFilters) {
  return {
    severity: filters.severity.join(','),
    status: filters.status.join(','),
    from: filters.from,
    to: filters.to,
    sortBy: filters.sortBy,
    order: filters.order,
  }
}

export const inspectionsApi = {
  list: (filters: InspectionFilters, signal?: AbortSignal) =>
    http.get<Inspection[]>('/api/inspections', {
      query: toListQuery(filters),
      signal,
    }),
  get: (id: string, signal?: AbortSignal) =>
    http.get<Inspection>(`/api/inspections/${encodeURIComponent(id)}`, {
      signal,
    }),
  create: (input: CreateInspectionInput) =>
    http.post<Inspection>('/api/inspections', input),
  resolve: (id: string, input: ResolveInspectionInput) =>
    http.patch<Inspection>(
      `/api/inspections/${encodeURIComponent(id)}/resolve`,
      input,
    ),
  summary: (signal?: AbortSignal) =>
    http.get<SummaryRow[]>('/api/inspections/summary', { signal }),
}
