import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '@/features/inspections/constants'

export type InspectionPaginationProps = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/** Generates a list of page numbers and ellipsis tokens for display */
function getPageRange(current: number, totalPages: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // Near the start
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
  }

  // Near the end
  if (current >= totalPages - 3) {
    return [
      1,
      'ellipsis-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  // Middle
  return [
    1,
    'ellipsis-start',
    current - 1,
    current,
    current + 1,
    'ellipsis-end',
    totalPages,
  ]
}

export function InspectionPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onPageSizeChange,
}: InspectionPaginationProps) {
  if (total === 0) return null

  const fromIndex = (page - 1) * limit + 1
  const toIndex = Math.min(page * limit, total)
  const pageRange = getPageRange(page, totalPages)

  return (
    <div
      aria-label="Inspections pagination"
      className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-4 sm:flex-row"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{fromIndex}–{toIndex}</span> of{' '}
          <span className="font-medium text-foreground">{total}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-xs">per page:</span>
          <Select
            value={String(limit)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger size="sm" className="h-7 w-[4.5rem] px-2 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              />
            </PaginationItem>

            {pageRange.map((item) => {
              if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                return (
                  <PaginationItem key={item}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={item === page}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
