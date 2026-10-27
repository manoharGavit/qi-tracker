import type {
  DefectType,
  InspectionStatus,
  Severity,
  SortField,
  SortOrder,
} from '@/features/inspections/constants'

export type Inspection = {
  id: string
  inspectionDate: string
  machineId: string
  defectType: DefectType
  severity: Severity
  remarks: string | null
  status: InspectionStatus
  resolutionNote: string | null
  resolvedAt: string | null
  createdBy: string | number
  createdAt: string
  updatedAt: string
}

export type InspectionFilters = {
  severity: Severity[]
  status: InspectionStatus[]
  from?: string
  to?: string
  sortBy: SortField
  order: SortOrder
}

export type SummaryRow = {
  severity: Severity
  open: number
  resolved: number
  total: number
}

export type CreateInspectionInput = {
  inspectionDate: string
  machineId: string
  defectType: DefectType
  severity: Severity
  remarks?: string
}

export type ResolveInspectionInput = {
  resolutionNote: string
}
