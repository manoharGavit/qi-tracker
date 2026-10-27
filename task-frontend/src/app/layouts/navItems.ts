import { ChartColumnIcon, ListChecksIcon, PlusIcon, type LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Rendered as the raised primary action in the mobile tab bar. */
  primary?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/inspections', label: 'Inspections', icon: ListChecksIcon },
  { to: '/inspections/new', label: 'New', icon: PlusIcon, primary: true },
  { to: '/summary', label: 'Summary', icon: ChartColumnIcon },
]
