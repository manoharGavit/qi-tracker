import { Skeleton } from '@/shared/components/ui/skeleton'

type LoadingListProps = {
  count?: number
  label?: string
}

export function LoadingList({ count = 4, label = 'Loading' }: LoadingListProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-chip w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}
