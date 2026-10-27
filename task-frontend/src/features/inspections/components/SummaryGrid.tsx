import { ChevronRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SeverityBadge } from '@/features/inspections/components/SeverityBadge'
import {
  DEFAULT_FILTERS,
  serializeInspectionFilters,
} from '@/features/inspections/lib/filterParams'
import { severityAccentClassName } from '@/features/inspections/lib/severityStyles'
import type { SummaryRow } from '@/features/inspections/types'
import { cn } from '@/shared/lib/utils'

function listHref(row: SummaryRow): string {
  const params = serializeInspectionFilters({
    ...DEFAULT_FILTERS,
    severity: [row.severity],
    status: row.open > 0 ? ['Open'] : [],
  })
  return `/inspections?${params.toString()}`
}

export function SummaryGrid({ rows }: { rows: SummaryRow[] }) {
  const totals = rows.reduce(
    (acc, row) => ({
      open: acc.open + row.open,
      resolved: acc.resolved + row.resolved,
      total: acc.total + row.total,
    }),
    { open: 0, resolved: 0, total: 0 },
  )

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="All inspections"
        className="grid grid-cols-3 divide-x rounded-xl bg-card py-4 ring-1 ring-foreground/10"
      >
        <Stat label="Total" value={totals.total} />
        <Stat label="Open" value={totals.open} />
        <Stat label="Resolved" value={totals.resolved} />
      </section>

      <ul className="grid gap-3 md:grid-cols-3">
        {rows.map((row) => {
          const resolvedPct =
            row.total > 0 ? Math.round((row.resolved / row.total) * 100) : 0
          return (
            <li key={row.severity}>
              <Link
                to={listHref(row)}
                className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={row.severity} />
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    View
                    <ChevronRightIcon className="size-4" aria-hidden />
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-2">
                  <Metric label="Open" value={row.open} />
                  <Metric label="Resolved" value={row.resolved} />
                  <Metric label="Total" value={row.total} />
                </dl>
                <div className="flex flex-col gap-1.5">
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${row.severity} resolved`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={resolvedPct}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width]',
                        severityAccentClassName(row.severity),
                      )}
                      style={{ width: `${resolvedPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {resolvedPct}% resolved
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
