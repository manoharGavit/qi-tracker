export const DEFECT_TYPES = [
  'Weave Defect',
  'Shade Variation',
  'Hole/Tear',
  'Count Deviation',
  'Other',
] as const
export type DefectType = (typeof DEFECT_TYPES)[number]

/** Ordered most to least severe; this order drives filters, summary rows and badges. */
export const SEVERITIES = ['Critical', 'Major', 'Minor'] as const
export type Severity = (typeof SEVERITIES)[number]

export const STATUSES = ['Open', 'Resolved'] as const
export type InspectionStatus = (typeof STATUSES)[number]

export const SORT_FIELDS = ['inspectionDate', 'severity', 'createdAt'] as const
export type SortField = (typeof SORT_FIELDS)[number]

export const SORT_ORDERS = ['asc', 'desc'] as const
export type SortOrder = (typeof SORT_ORDERS)[number]

export const DEFAULT_SORT_BY: SortField = 'inspectionDate'
export const DEFAULT_SORT_ORDER: SortOrder = 'desc'

export const MACHINE_ID_MAX_LENGTH = 50
export const REMARKS_MAX_LENGTH = 1000
export const RESOLUTION_NOTE_MIN_LENGTH = 3
export const RESOLUTION_NOTE_MAX_LENGTH = 500

export const DEFECT_TYPE_OPTIONS = DEFECT_TYPES.map((value) => ({
  value,
  label: value,
}))

export const SEVERITY_OPTIONS = SEVERITIES.map((value) => ({
  value,
  label: value,
}))

export type SortOption = {
  value: `${SortField}:${SortOrder}`
  label: string
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'inspectionDate:desc', label: 'Inspection date: newest' },
  { value: 'inspectionDate:asc', label: 'Inspection date: oldest' },
  { value: 'severity:desc', label: 'Severity: critical first' },
  { value: 'severity:asc', label: 'Severity: minor first' },
  { value: 'createdAt:desc', label: 'Recently logged' },
  { value: 'createdAt:asc', label: 'Logged earliest' },
]
