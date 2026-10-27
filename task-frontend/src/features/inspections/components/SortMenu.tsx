import { ArrowUpDownIcon } from 'lucide-react'
import {
  SORT_FIELDS,
  SORT_OPTIONS,
  SORT_ORDERS,
  type SortField,
  type SortOrder,
} from '@/features/inspections/constants'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

type SortMenuProps = {
  sortBy: SortField
  order: SortOrder
  onChange: (sort: { sortBy: SortField; order: SortOrder }) => void
}

function parseSortValue(
  value: string,
): { sortBy: SortField; order: SortOrder } | null {
  const [field, direction] = value.split(':')
  const sortBy = SORT_FIELDS.find((candidate) => candidate === field)
  const order = SORT_ORDERS.find((candidate) => candidate === direction)
  return sortBy && order ? { sortBy, order } : null
}

export function SortMenu({ sortBy, order, onChange }: SortMenuProps) {
  const value = `${sortBy}:${order}`
  const current = SORT_OPTIONS.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="max-w-full min-w-0 shrink">
          <ArrowUpDownIcon data-icon="inline-start" />
          <span className="sr-only">Sort: </span>
          <span className="truncate">{current?.label ?? 'Sort'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const parsed = parseSortValue(next)
            if (parsed) onChange(parsed)
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
