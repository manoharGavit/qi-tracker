import type { Severity } from '@/features/inspections/constants'
import { assertNever } from '@/shared/lib/assertNever'

export function severityClassName(severity: Severity): string {
  switch (severity) {
    case 'Critical':
      return 'bg-severity-critical text-severity-critical-foreground'
    case 'Major':
      return 'bg-severity-major text-severity-major-foreground'
    case 'Minor':
      return 'bg-severity-minor text-severity-minor-foreground'
    default:
      return assertNever(severity)
  }
}

/** Accent used for the summary progress bar. */
export function severityAccentClassName(severity: Severity): string {
  switch (severity) {
    case 'Critical':
      return 'bg-severity-critical-foreground'
    case 'Major':
      return 'bg-severity-major-foreground'
    case 'Minor':
      return 'bg-severity-minor-foreground'
    default:
      return assertNever(severity)
  }
}
