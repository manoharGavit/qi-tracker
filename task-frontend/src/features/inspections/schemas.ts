import { z } from 'zod'
import {
  DEFECT_TYPES,
  MACHINE_ID_MAX_LENGTH,
  REMARKS_MAX_LENGTH,
  RESOLUTION_NOTE_MAX_LENGTH,
  RESOLUTION_NOTE_MIN_LENGTH,
  SEVERITIES,
} from '@/features/inspections/constants'

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const createInspectionSchema = z.object({
  inspectionDate: z
    .string()
    .regex(ISO_DATE_PATTERN, 'Pick the inspection date'),
  machineId: z
    .string()
    .trim()
    .min(1, 'Machine ID is required')
    .max(
      MACHINE_ID_MAX_LENGTH,
      `Machine ID must be at most ${MACHINE_ID_MAX_LENGTH} characters`,
    ),
  defectType: z.enum(DEFECT_TYPES, { error: 'Select a defect type' }),
  severity: z.enum(SEVERITIES, { error: 'Select a severity' }),
  remarks: z
    .string()
    .trim()
    .max(
      REMARKS_MAX_LENGTH,
      `Remarks must be at most ${REMARKS_MAX_LENGTH} characters`,
    ),
})

export type CreateInspectionFormInput = z.input<typeof createInspectionSchema>
export type CreateInspectionFormValues = z.output<typeof createInspectionSchema>

export const resolveInspectionSchema = z.object({
  resolutionNote: z
    .string()
    .trim()
    .min(
      RESOLUTION_NOTE_MIN_LENGTH,
      `Add a resolution note (at least ${RESOLUTION_NOTE_MIN_LENGTH} characters)`,
    )
    .max(
      RESOLUTION_NOTE_MAX_LENGTH,
      `Resolution note must be at most ${RESOLUTION_NOTE_MAX_LENGTH} characters`,
    ),
})

export type ResolveInspectionFormValues = z.infer<
  typeof resolveInspectionSchema
>
