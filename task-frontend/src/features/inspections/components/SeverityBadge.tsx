import type { Severity } from '@/features/inspections/constants'
import { severityClassName } from '@/features/inspections/lib/severityStyles'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity
  className?: string
}) {
  return (
    <Badge className={cn(severityClassName(severity), className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {severity}
    </Badge>
  )
}
