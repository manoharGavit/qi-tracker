import { Skeleton } from '@/shared/components/ui/skeleton'

type PageLoaderProps = {
  label?: string
  variant?: 'default' | 'card'
}

export function PageLoader({
  label = 'Loading page',
  variant = 'default',
}: PageLoaderProps) {
  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-6 shadow-xs animate-in fade-in-50 duration-200"
      >
        <span className="sr-only">{label}</span>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="mt-2 h-9 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full flex-1 flex-col gap-4 py-2 animate-in fade-in-50 duration-200"
    >
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40 md:h-8 md:w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  )
}
