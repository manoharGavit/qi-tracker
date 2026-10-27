import { CalendarIcon, CheckIcon } from 'lucide-react'
import { SeverityBadge } from '@/features/inspections/components/SeverityBadge'
import { StatusBadge } from '@/features/inspections/components/StatusBadge'
import type { Inspection } from '@/features/inspections/types'
import { Button } from '@/shared/components/ui/button'
import { formatDate, formatDateTime } from '@/shared/lib/dates'

type InspectionCardProps = {
  inspection: Inspection
  onResolve: (inspection: Inspection) => void
}

export function InspectionCard({ inspection, onResolve }: InspectionCardProps) {
  const isOpen = inspection.status === 'Open'

  return (
    <article
      aria-labelledby={`inspection-${inspection.id}-title`}
      className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 [contain-intrinsic-size:auto_11rem] [content-visibility:auto]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={`inspection-${inspection.id}-title`}
            className="truncate text-base font-semibold"
          >
            {inspection.machineId}
          </h2>
          <p className="text-sm text-muted-foreground">{inspection.defectType}</p>
        </div>
        <SeverityBadge severity={inspection.severity} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="size-4" aria-hidden />
          <time dateTime={inspection.inspectionDate}>
            {formatDate(inspection.inspectionDate)}
          </time>
        </span>
        <StatusBadge status={inspection.status} />
      </div>

      {inspection.remarks ? (
        <p className="line-clamp-3 text-sm break-words">{inspection.remarks}</p>
      ) : null}

      {inspection.status === 'Resolved' && inspection.resolutionNote ? (
        <div className="rounded-lg bg-status-resolved/60 p-3 text-sm">
          <p className="font-medium text-status-resolved-foreground">
            Resolution
            {inspection.resolvedAt ? (
              <span className="font-normal text-muted-foreground">
                {' · '}
                {formatDateTime(inspection.resolvedAt)}
              </span>
            ) : null}
          </p>
          <p className="mt-1 break-words">{inspection.resolutionNote}</p>
        </div>
      ) : null}

      {isOpen ? (
        <Button
          variant="outline"
          className="w-full md:w-auto md:self-end"
          onClick={() => onResolve(inspection)}
        >
          <CheckIcon data-icon="inline-start" />
          Resolve
        </Button>
      ) : null}
    </article>
  )
}
