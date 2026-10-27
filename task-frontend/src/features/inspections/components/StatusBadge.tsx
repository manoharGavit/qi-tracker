import { CircleCheckIcon, CircleDotIcon } from 'lucide-react'
import type { InspectionStatus } from '@/features/inspections/constants'
import { Badge } from '@/shared/components/ui/badge'
import { assertNever } from '@/shared/lib/assertNever'

export function StatusBadge({ status }: { status: InspectionStatus }) {
  switch (status) {
    case 'Open':
      return (
        <Badge className="bg-status-open text-status-open-foreground">
          <CircleDotIcon aria-hidden />
          Open
        </Badge>
      )
    case 'Resolved':
      return (
        <Badge className="bg-status-resolved text-status-resolved-foreground">
          <CircleCheckIcon aria-hidden />
          Resolved
        </Badge>
      )
    default:
      return assertNever(status)
  }
}
