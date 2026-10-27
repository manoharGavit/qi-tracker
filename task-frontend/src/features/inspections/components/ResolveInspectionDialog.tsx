import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { SeverityBadge } from '@/features/inspections/components/SeverityBadge'
import { RESOLUTION_NOTE_MAX_LENGTH } from '@/features/inspections/constants'
import { useResolveInspection } from '@/features/inspections/hooks/useResolveInspection'
import {
  resolveInspectionSchema,
  type ResolveInspectionFormValues,
} from '@/features/inspections/schemas'
import type { Inspection } from '@/features/inspections/types'
import { isApiError } from '@/shared/api/apiError'
import { FormRootError } from '@/shared/components/form/FormRootError'
import { FormTextarea } from '@/shared/components/form/FormTextarea'
import { ResponsiveModal } from '@/shared/components/ResponsiveModal'
import { Button } from '@/shared/components/ui/button'
import { applyServerErrors } from '@/shared/lib/applyServerErrors'
import { formatDate } from '@/shared/lib/dates'

type ResolveInspectionDialogProps = {
  inspection: Inspection | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResolveInspectionDialog({
  inspection,
  open,
  onOpenChange,
}: ResolveInspectionDialogProps) {
  return (
    <ResponsiveModal
      open={open && inspection !== null}
      onOpenChange={onOpenChange}
      title="Resolve inspection"
      description="Describe the corrective action taken. This cannot be undone."
    >
      {inspection ? (
        <ResolveForm
          key={inspection.id}
          inspection={inspection}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </ResponsiveModal>
  )
}

const RESOLVE_FIELDS = ['resolutionNote'] as const

function ResolveForm({
  inspection,
  onClose,
}: {
  inspection: Inspection
  onClose: () => void
}) {
  const resolve = useResolveInspection()
  const form = useForm<ResolveInspectionFormValues>({
    resolver: zodResolver(resolveInspectionSchema),
    defaultValues: { resolutionNote: '' },
  })
  const { isSubmitting, errors } = form.formState

  const onSubmit = form.handleSubmit(async ({ resolutionNote }) => {
    try {
      await resolve.mutateAsync({ id: inspection.id, resolutionNote })
      toast.success(`${inspection.machineId} marked as resolved`)
      onClose()
    } catch (error) {
      if (isApiError(error) && error.code === 'CONFLICT') {
        toast.error('This inspection was already resolved.')
        onClose()
        return
      }
      applyServerErrors(error, form.setError, RESOLVE_FIELDS)
    }
  })

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3 text-sm">
        <div className="min-w-0">
          <p className="truncate font-medium">{inspection.machineId}</p>
          <p className="text-muted-foreground">
            {inspection.defectType} · {formatDate(inspection.inspectionDate)}
          </p>
        </div>
        <SeverityBadge severity={inspection.severity} />
      </div>

      <FormTextarea
        control={form.control}
        name="resolutionNote"
        label="Resolution note"
        placeholder="e.g. Re-threaded heddle on loom, re-inspected 20 m — defect cleared."
        maxChars={RESOLUTION_NOTE_MAX_LENGTH}
        rows={4}
        autoFocus
      />

      <FormRootError message={errors.root?.server?.message} />

      <div className="flex flex-col gap-2 md:flex-row-reverse">
        <Button type="submit" disabled={isSubmitting} className="md:flex-1">
          {isSubmitting ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : null}
          Mark as resolved
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="md:flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
