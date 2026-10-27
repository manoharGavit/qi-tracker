import { ClipboardCheckIcon } from 'lucide-react'

export const APP_NAME = 'QI Tracker'

export function BrandMark() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-control-sm items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ClipboardCheckIcon className="size-4" aria-hidden />
      </span>
      {APP_NAME}
    </span>
  )
}
