import { useQuery } from '@tanstack/react-query'
import { inspectionsApi } from '@/features/inspections/api/inspectionsApi'
import { SEVERITIES } from '@/features/inspections/constants'
import { inspectionKeys } from '@/features/inspections/lib/queryKeys'
import type { SummaryRow } from '@/features/inspections/types'

/** Guarantees one row per severity, in canonical order, even if the API omits some. */
function normalizeSummary(rows: SummaryRow[]): SummaryRow[] {
  const bySeverity = new Map(rows.map((row) => [row.severity, row]))
  return SEVERITIES.map(
    (severity) =>
      bySeverity.get(severity) ?? { severity, open: 0, resolved: 0, total: 0 },
  )
}

export function useInspectionSummary() {
  return useQuery({
    queryKey: inspectionKeys.summary(),
    queryFn: ({ signal }) => inspectionsApi.summary(signal),
    select: normalizeSummary,
  })
}
