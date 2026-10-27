const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Today's local calendar date as YYYY-MM-DD (what native date inputs use). */
export function todayIsoDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Converts a Date to YYYY-MM-DD without UTC timezone drift. */
export function dateToIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Parses a YYYY-MM-DD string into a local Date without UTC shift. */
export function parseIsoDate(isoDate?: string | null): Date | undefined {
  if (!isoDate) return undefined
  const match = ISO_DATE.exec(isoDate)
  if (!match) return undefined
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

/** Formats a calendar date (YYYY-MM-DD) without shifting it through UTC. */
export function formatDate(isoDate: string): string {
  const match = ISO_DATE.exec(isoDate)
  if (!match) return isoDate
  const [, year, month, day] = match
  return dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)))
}

export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  return Number.isNaN(date.getTime()) ? isoDateTime : dateTimeFormatter.format(date)
}
