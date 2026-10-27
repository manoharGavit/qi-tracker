import * as React from 'react'
import { CalendarIcon, XIcon } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  dateToIso,
  formatDate,
  parseIsoDate,
} from '@/shared/lib/dates'

export type DatePickerProps = {
  id?: string
  name?: string
  value?: string // YYYY-MM-DD
  onChange?: (dateIso: string) => void
  disabled?: boolean
  placeholder?: string
  clearable?: boolean
  min?: string // YYYY-MM-DD
  max?: string // YYYY-MM-DD
  className?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-describedby'?: string
  'aria-label'?: string
  inputRef?: React.Ref<HTMLInputElement>
}

export function DatePicker({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = 'Pick a date',
  clearable = false,
  min,
  max,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  inputRef,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [today] = React.useState(() => new Date())
  const internalButtonRef = React.useRef<HTMLButtonElement>(null)

  const selectedDate = React.useMemo(() => parseIsoDate(value), [value])
  const minDate = React.useMemo(() => parseIsoDate(min), [min])
  const maxDate = React.useMemo(() => parseIsoDate(max), [max])

  const initialMonth = React.useMemo(() => {
    if (selectedDate) return selectedDate
    if (maxDate && maxDate < today) return maxDate
    if (minDate && minDate > today) return minDate
    return today
  }, [selectedDate, minDate, maxDate, today])

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()
      const check = new Date(year, month, day).getTime()

      if (minDate) {
        const minTime = new Date(
          minDate.getFullYear(),
          minDate.getMonth(),
          minDate.getDate(),
        ).getTime()
        if (check < minTime) return true
      }

      if (maxDate) {
        const maxTime = new Date(
          maxDate.getFullYear(),
          maxDate.getMonth(),
          maxDate.getDate(),
        ).getTime()
        if (check > maxTime) return true
      }

      return false
    },
    [minDate, maxDate],
  )

  return (
    <div className="relative w-full">
      {/* Hidden input preserves standard form interaction, label binding, and testing queries */}
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value ?? ''}
        readOnly
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => internalButtonRef.current?.focus()}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={internalButtonRef}
            id={id ? `${id}-button` : undefined}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedby}
            aria-label={ariaLabel}
            className={cn(
              'h-control w-full justify-start border-input bg-background px-3 text-left font-normal',
              !value && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon
              className="mr-2 size-4 shrink-0 text-muted-foreground"
              data-icon="inline-start"
            />
            <span className="flex-1 truncate">
              {value ? formatDate(value) : placeholder}
            </span>
            {clearable && value && !disabled ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear date"
                className="ml-auto inline-flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange?.('')
                  }
                }}
              >
                <XIcon className="size-3.5" />
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={initialMonth}
            onSelect={(date) => {
              if (date) {
                onChange?.(dateToIso(date))
              } else if (clearable) {
                onChange?.('')
              }
              setOpen(false)
            }}
            disabled={isDateDisabled}
            autoFocus
          />
          {clearable && value ? (
            <div className="flex items-center justify-end border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  onChange?.('')
                  setOpen(false)
                }}
              >
                Clear date
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
