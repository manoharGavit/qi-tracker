import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  DEFECT_TYPE_OPTIONS,
  MACHINE_ID_MAX_LENGTH,
  REMARKS_MAX_LENGTH,
  SEVERITY_OPTIONS,
} from '@/features/inspections/constants'
import {
  createInspectionSchema,
  type CreateInspectionFormInput,
  type CreateInspectionFormValues,
} from '@/features/inspections/schemas'
import type { CreateInspectionInput } from '@/features/inspections/types'
import { FormDatePicker } from '@/shared/components/form/FormDatePicker'
import { FormInput } from '@/shared/components/form/FormInput'
import { FormRootError } from '@/shared/components/form/FormRootError'
import { FormSelect } from '@/shared/components/form/FormSelect'
import { FormTextarea } from '@/shared/components/form/FormTextarea'
import { Button } from '@/shared/components/ui/button'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'
import { todayIsoDate } from '@/shared/lib/dates'

const INSPECTION_FIELDS = [
  'inspectionDate',
  'machineId',
  'defectType',
  'severity',
  'remarks',
] as const

type InspectionFormProps = {
  /** Should reject with an ApiError on failure; 422 details are mapped onto fields. */
  onSubmit: (input: CreateInspectionInput) => Promise<unknown>
  submitLabel?: string
}

function toCreateInput(
  values: CreateInspectionFormValues,
): CreateInspectionInput {
  return {
    inspectionDate: values.inspectionDate,
    machineId: values.machineId,
    defectType: values.defectType,
    severity: values.severity,
    remarks: values.remarks ? values.remarks : undefined,
  }
}

export function InspectionForm({
  onSubmit,
  submitLabel = 'Log inspection',
}: InspectionFormProps) {
  const today = todayIsoDate()
  const form = useForm<
    CreateInspectionFormInput,
    unknown,
    CreateInspectionFormValues
  >({
    resolver: zodResolver(createInspectionSchema),
    defaultValues: {
      inspectionDate: today,
      machineId: '',
      remarks: '',
    },
  })
  const { isSubmitting, errors } = form.formState

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(toCreateInput(values))
    } catch (error) {
      applyServerErrors(error, form.setError, INSPECTION_FIELDS)
    }
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <FormDatePicker
          control={form.control}
          name="inspectionDate"
          label="Inspection date"
          max={today}
        />
        <FormInput
          control={form.control}
          name="machineId"
          label="Machine ID"
          placeholder="e.g. LOOM-12"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          description={`Up to ${MACHINE_ID_MAX_LENGTH} characters`}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FormSelect
          control={form.control}
          name="defectType"
          label="Defect type"
          placeholder="Select defect type"
          options={DEFECT_TYPE_OPTIONS}
        />
        <FormSelect
          control={form.control}
          name="severity"
          label="Severity"
          placeholder="Select severity"
          options={SEVERITY_OPTIONS}
        />
      </div>
      <FormTextarea
        control={form.control}
        name="remarks"
        label={
          <>
            Remarks <span className="font-normal text-muted-foreground">(optional)</span>
          </>
        }
        placeholder="Where on the roll, extent, anything the next shift should know"
        maxChars={REMARKS_MAX_LENGTH}
        rows={4}
      />
      <FormRootError message={errors.root?.server?.message} />
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : null}
        {submitLabel}
      </Button>
    </form>
  )
}
