import { useId, useState } from 'react'
import { SlidersHorizontalIcon } from 'lucide-react'
import {
  SEVERITIES,
  STATUSES,
  type InspectionStatus,
  type Severity,
} from '@/features/inspections/constants'
import { countActiveFilters } from '@/features/inspections/lib/filterParams'
import type { InspectionFilters as Filters } from '@/features/inspections/types'
import { ResponsiveModal } from '@/shared/components/ResponsiveModal'
import { Button } from '@/shared/components/ui/button'
import { DatePicker } from '@/shared/components/ui/date-picker'
import { Label } from '@/shared/components/ui/label'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group'

type FilterPatch = Pick<Filters, 'severity' | 'status' | 'from' | 'to'>

type InspectionFiltersProps = {
  filters: Filters
  onApply: (patch: FilterPatch) => void
}

export function InspectionFilters({ filters, onApply }: InspectionFiltersProps) {
  const [open, setOpen] = useState(false)
  const activeCount = countActiveFilters(filters)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={
          activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'
        }
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        Filters
        {activeCount > 0 ? (
          <span className="flex size-chip items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
            {activeCount}
          </span>
        ) : null}
      </Button>
      <ResponsiveModal
        open={open}
        onOpenChange={setOpen}
        title="Filter inspections"
        description="Narrow the list by severity, status and inspection date."
      >
        <FiltersPanel
          initial={filters}
          onApply={(patch) => {
            onApply(patch)
            setOpen(false)
          }}
        />
      </ResponsiveModal>
    </>
  )
}

const TOGGLE_ON =
  'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'

function pickKnown<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return allowed.filter((value) => values.includes(value))
}

/** Mounted only while the modal is open, so the draft resets to the applied filters each time. */
function FiltersPanel({
  initial,
  onApply,
}: {
  initial: Filters
  onApply: (patch: FilterPatch) => void
}) {
  const id = useId()
  const [severity, setSeverity] = useState<Severity[]>(initial.severity)
  const [status, setStatus] = useState<InspectionStatus[]>(initial.status)
  const [from, setFrom] = useState(initial.from ?? '')
  const [to, setTo] = useState(initial.to ?? '')
  const rangeInvalid = Boolean(from && to && from > to)

  const apply = () => {
    if (rangeInvalid) return
    onApply({ severity, status, from: from || undefined, to: to || undefined })
  }

  const clearAll = () => {
    onApply({ severity: [], status: [], from: undefined, to: undefined })
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Severity</legend>
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={severity}
          onValueChange={(values) => setSeverity(pickKnown(values, SEVERITIES))}
          className="grid w-full grid-cols-3"
        >
          {SEVERITIES.map((value) => (
            <ToggleGroupItem key={value} value={value} className={TOGGLE_ON}>
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Status</legend>
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={2}
          value={status}
          onValueChange={(values) => setStatus(pickKnown(values, STATUSES))}
          className="grid w-full grid-cols-2"
        >
          {STATUSES.map((value) => (
            <ToggleGroupItem key={value} value={value} className={TOGGLE_ON}>
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Inspection date</legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-from`} className="text-muted-foreground">
              From
            </Label>
            <DatePicker
              id={`${id}-from`}
              value={from}
              max={to || undefined}
              onChange={(value) => setFrom(value)}
              aria-invalid={rangeInvalid}
              placeholder="Pick start date"
              clearable
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-to`} className="text-muted-foreground">
              To
            </Label>
            <DatePicker
              id={`${id}-to`}
              value={to}
              min={from || undefined}
              onChange={(value) => setTo(value)}
              aria-invalid={rangeInvalid}
              placeholder="Pick end date"
              clearable
            />
          </div>
        </div>
        {rangeInvalid ? (
          <p role="alert" className="text-sm text-destructive">
            “From” date must be on or before “To” date.
          </p>
        ) : null}
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={clearAll}>
          Clear all
        </Button>
        <Button type="button" onClick={apply} disabled={rangeInvalid}>
          Show results
        </Button>
      </div>
    </div>
  )
}
