import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useInspectionFilters } from '@/features/inspections/hooks/useInspectionFilters'
import {
  DEFAULT_FILTERS,
  parseInspectionFilters,
  serializeInspectionFilters,
} from '@/features/inspections/lib/filterParams'

function renderFilters(initialUrl: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  )
  return renderHook(
    () => ({ ...useInspectionFilters(), location: useLocation() }),
    { wrapper },
  )
}

describe('parseInspectionFilters', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseInspectionFilters(new URLSearchParams())).toEqual(
      DEFAULT_FILTERS,
    )
  })

  it('parses comma-separated enums, dates and sort', () => {
    const filters = parseInspectionFilters(
      new URLSearchParams(
        'severity=Major,Critical&status=Open&from=2026-01-01&to=2026-01-31&sortBy=severity&order=asc',
      ),
    )
    expect(filters).toEqual({
      severity: ['Critical', 'Major'],
      status: ['Open'],
      from: '2026-01-01',
      to: '2026-01-31',
      sortBy: 'severity',
      order: 'asc',
      page: 1,
      limit: 20,
    })
  })

  it('parses custom page and limit query params', () => {
    const filters = parseInspectionFilters(
      new URLSearchParams('page=3&limit=50'),
    )
    expect(filters.page).toBe(3)
    expect(filters.limit).toBe(50)
  })

  it('drops unknown values, duplicates and malformed dates', () => {
    const filters = parseInspectionFilters(
      new URLSearchParams(
        'severity=Minor,Bogus,Minor&status=Closed&from=01/02/2026&to=2026-13-45&sortBy=machineId&order=sideways&page=-2&limit=0',
      ),
    )
    expect(filters).toEqual({
      ...DEFAULT_FILTERS,
      severity: ['Minor'],
    })
  })
})

describe('serializeInspectionFilters', () => {
  it('omits empty values and default sort', () => {
    expect(serializeInspectionFilters(DEFAULT_FILTERS).toString()).toBe('')
  })

  it('round-trips through parse in canonical order', () => {
    const params = serializeInspectionFilters({
      severity: ['Minor', 'Critical'],
      status: ['Resolved', 'Open'],
      from: '2026-02-01',
      to: undefined,
      sortBy: 'createdAt',
      order: 'asc',
    })
    expect(params.get('severity')).toBe('Critical,Minor')
    expect(params.get('status')).toBe('Open,Resolved')
    expect(params.has('to')).toBe(false)
    expect(parseInspectionFilters(params)).toEqual({
      severity: ['Critical', 'Minor'],
      status: ['Open', 'Resolved'],
      from: '2026-02-01',
      to: undefined,
      sortBy: 'createdAt',
      order: 'asc',
      page: 1,
      limit: 20,
    })
  })

  it('serializes page and limit when different from defaults', () => {
    const params = serializeInspectionFilters({
      ...DEFAULT_FILTERS,
      page: 4,
      limit: 50,
    })
    expect(params.get('page')).toBe('4')
    expect(params.get('limit')).toBe('50')
  })
})

describe('useInspectionFilters', () => {
  it('reads filters from the URL and counts active groups', () => {
    const { result } = renderFilters(
      '/inspections?severity=Critical&status=Open&from=2026-01-01',
    )
    expect(result.current.filters.severity).toEqual(['Critical'])
    expect(result.current.filters.status).toEqual(['Open'])
    expect(result.current.activeFilterCount).toBe(3)
  })

  it('writes patches back to the URL, preserving other params', () => {
    const { result } = renderFilters('/inspections?status=Open')

    act(() => {
      result.current.setFilters({ severity: ['Major'], sortBy: 'severity' })
    })

    const params = new URLSearchParams(result.current.location.search)
    expect(params.get('status')).toBe('Open')
    expect(params.get('severity')).toBe('Major')
    expect(params.get('sortBy')).toBe('severity')
    expect(result.current.filters.sortBy).toBe('severity')
  })

  it('clearFilters removes filters but keeps the chosen sort', () => {
    const { result } = renderFilters(
      '/inspections?severity=Minor&status=Resolved&to=2026-03-01&sortBy=createdAt&order=asc&page=3',
    )

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.location.search).toBe('?sortBy=createdAt&order=asc')
    expect(result.current.activeFilterCount).toBe(0)
    expect(result.current.filters.page).toBe(1)
  })

  it('updates page and limit, and resets page when changing filters', () => {
    const { result } = renderFilters('/inspections?page=3&limit=50')
    expect(result.current.filters.page).toBe(3)
    expect(result.current.filters.limit).toBe(50)

    act(() => {
      result.current.setPage(4)
    })
    expect(new URLSearchParams(result.current.location.search).get('page')).toBe('4')

    act(() => {
      result.current.setFilters({ status: ['Open'] })
    })
    // Page resets to 1 when changing filters, so page param is omitted from URL
    expect(new URLSearchParams(result.current.location.search).get('page')).toBeNull()
    expect(result.current.filters.page).toBe(1)
    expect(result.current.filters.status).toEqual(['Open'])
  })
})
