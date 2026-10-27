import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { dateToIso, formatDate, parseIsoDate } from '@/shared/lib/dates'

export type DateRangePickerProps = {
  from?: string
  to?: string
  onSelectRange?: (range: { from?: string; to?: string }) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  numberOfMonths?: number
}

export function DateRangePicker({
  from,
  to,
  onSelectRange,
  disabled = false,
  placeholder = 'Pick a date range',
  className,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [defaultMonth] = React.useState(() => new Date())

  const selectedRange: DateRange | undefined = React.useMemo(() => {
    const fromDate = parseIsoDate(from)
    const toDate = parseIsoDate(to)
    if (!fromDate && !toDate) return undefined
    return { from: fromDate, to: toDate }
  }, [from, to])

  const label = React.useMemo(() => {
    if (from && to) {
      return `${formatDate(from)} – ${formatDate(to)}`
    }
    if (from) {
      return `From ${formatDate(from)}`
    }
    return placeholder
  }, [from, to, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-control w-full justify-start border-input bg-background px-3 text-left font-normal',
            !from && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon
            className="mr-2 size-4 shrink-0 text-muted-foreground"
            data-icon="inline-start"
          />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={selectedRange?.from ?? defaultMonth}
          selected={selectedRange}
          onSelect={(range) => {
            onSelectRange?.({
              from: range?.from ? dateToIso(range.from) : undefined,
              to: range?.to ? dateToIso(range.to) : undefined,
            })
          }}
          numberOfMonths={numberOfMonths}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
