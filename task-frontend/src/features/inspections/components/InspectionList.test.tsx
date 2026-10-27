import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InspectionList } from '@/features/inspections/components/InspectionList'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { Inspection } from '@/features/inspections/types'

const mockInspections: Inspection[] = [
  {
    id: 'ins-1',
    inspectionDate: '2026-10-25',
    machineId: 'LOOM-01',
    defectType: 'Weave Defect',
    severity: 'Critical',
    remarks: 'Thread breakage',
    status: 'Open',
    resolutionNote: null,
    resolvedAt: null,
    createdBy: 'user-1',
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'ins-2',
    inspectionDate: '2026-10-26',
    machineId: 'LOOM-02',
    defectType: 'Shade Variation',
    severity: 'Major',
    remarks: null,
    status: 'Resolved',
    resolutionNote: 'Adjusted tension',
    resolvedAt: '2026-10-26T12:00:00Z',
    createdBy: 'user-1',
    createdAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-26T12:00:00Z',
  },
]

describe('InspectionList', () => {
  it('renders virtualized list containing inspection cards', () => {
    renderWithProviders(<InspectionList inspections={mockInspections} />)

    expect(screen.getByText('LOOM-01')).toBeInTheDocument()
    expect(screen.getByText('LOOM-02')).toBeInTheDocument()
    expect(screen.getByText('Thread breakage')).toBeInTheDocument()
    expect(screen.getByText('Adjusted tension')).toBeInTheDocument()
  })

  it('opens resolve dialog when clicking resolve on an open defect', () => {
    renderWithProviders(<InspectionList inspections={mockInspections} />)

    const resolveBtn = screen.getByRole('button', { name: /resolve/i })
    fireEvent.click(resolveBtn)

    expect(
      screen.getByRole('heading', { name: /resolve inspection/i }),
    ).toBeInTheDocument()
  })
})
