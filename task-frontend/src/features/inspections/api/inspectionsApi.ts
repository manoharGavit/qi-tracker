import type {
  CreateInspectionInput,
  Inspection,
  InspectionFilters,
  PaginatedData,
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
    page: filters.page ? String(filters.page) : undefined,
    limit: filters.limit ? String(filters.limit) : undefined,
  }
}

export const inspectionsApi = {
  list: async (
    filters: InspectionFilters,
    signal?: AbortSignal,
  ): Promise<PaginatedData<Inspection>> => {
    const data = await http.get<PaginatedData<Inspection> | Inspection[]>(
      '/api/inspections',
      {
        query: toListQuery(filters),
        signal,
      },
    )

    if (Array.isArray(data)) {
      return {
        items: data,
        pagination: {
          page: filters.page ?? 1,
          limit: filters.limit ?? data.length,
          total: data.length,
          totalPages: Math.max(
            1,
            Math.ceil(data.length / (filters.limit ?? Math.max(1, data.length))),
          ),
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    }

    return data
  },
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
