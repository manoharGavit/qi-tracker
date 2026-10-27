import { SummaryGrid } from '@/features/inspections/components/SummaryGrid'
import { useInspectionSummary } from '@/features/inspections/hooks/useInspectionSummary'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function SummaryPage() {
  const query = useInspectionSummary()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Summary"
        description="Open vs resolved defects by severity."
      />
      {query.isPending ? (
        <div role="status" className="flex flex-col gap-4">
          <span className="sr-only">Loading summary</span>
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          title="Could not load summary"
          onRetry={() => void query.refetch()}
        />
      ) : (
        <SummaryGrid rows={query.data} />
      )}
    </div>
  )
}
