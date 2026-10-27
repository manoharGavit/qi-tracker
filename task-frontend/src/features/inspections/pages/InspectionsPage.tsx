import { ClipboardListIcon, PlusIcon, SearchXIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InspectionFilters } from '@/features/inspections/components/InspectionFilters'
import { InspectionList } from '@/features/inspections/components/InspectionList'
import { SortMenu } from '@/features/inspections/components/SortMenu'
import { useInspectionFilters } from '@/features/inspections/hooks/useInspectionFilters'
import { useInspections } from '@/features/inspections/hooks/useInspections'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingList } from '@/shared/components/LoadingList'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/ui/button'

export function InspectionsPage() {
  const { filters, setFilters, clearFilters, activeFilterCount } =
    useInspectionFilters()
  const query = useInspections(filters)
  const inspections = query.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inspections"
        description={
          query.isSuccess
            ? `${inspections.length} ${inspections.length === 1 ? 'record' : 'records'}${activeFilterCount > 0 ? ' matching filters' : ''}`
            : 'Fabric defects logged on the floor'
        }
        actions={
          <Button asChild className="hidden md:inline-flex">
            <Link to="/inspections/new">
              <PlusIcon data-icon="inline-start" />
              New inspection
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <InspectionFilters filters={filters} onApply={setFilters} />
        <div className="ml-auto min-w-0">
          <SortMenu
            sortBy={filters.sortBy}
            order={filters.order}
            onChange={setFilters}
          />
        </div>
      </div>

      <div
        aria-busy={query.isFetching}
        className={query.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}
      >
        {query.isPending ? (
          <LoadingList label="Loading inspections" />
        ) : query.isError ? (
          <ErrorState
            error={query.error}
            title="Could not load inspections"
            onRetry={() => void query.refetch()}
          />
        ) : inspections.length === 0 ? (
          activeFilterCount > 0 ? (
            <EmptyState
              icon={SearchXIcon}
              title="No inspections match these filters"
              description="Try widening the date range or clearing filters."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ClipboardListIcon}
              title="No inspections yet"
              description="Log the first defect found on the floor."
              action={
                <Button asChild>
                  <Link to="/inspections/new">
                    <PlusIcon data-icon="inline-start" />
                    New inspection
                  </Link>
                </Button>
              }
            />
          )
        ) : (
          <InspectionList inspections={inspections} />
        )}
      </div>
    </div>
  )
}
