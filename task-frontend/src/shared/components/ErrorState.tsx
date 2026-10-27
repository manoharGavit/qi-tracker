import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react'
import { getErrorMessage } from '@/shared/api/apiError'
import { Button } from '@/shared/components/ui/button'

type ErrorStateProps = {
  error: unknown
  title?: string
  onRetry?: () => void
}

export function ErrorState({
  error,
  title = 'Could not load data',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center"
    >
      <TriangleAlertIcon className="size-6 text-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCwIcon data-icon="inline-start" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
