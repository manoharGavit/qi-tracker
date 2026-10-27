import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { inspectionsApi } from '@/features/inspections/api/inspectionsApi'
import { ResolveInspectionDialog } from '@/features/inspections/components/ResolveInspectionDialog'
import type { Inspection } from '@/features/inspections/types'
import { ApiError } from '@/shared/api/apiError'
import { installMatchMedia } from '@/test/matchMedia'
import { renderWithProviders } from '@/test/renderWithProviders'

vi.mock('@/features/inspections/api/inspectionsApi', () => ({
  inspectionsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    resolve: vi.fn(),
    summary: vi.fn(),
  },
}))

const inspection: Inspection = {
  id: 'insp-1',
  inspectionDate: '2026-10-20',
  machineId: 'LOOM-7',
  defectType: 'Weave Defect',
  severity: 'Major',
  remarks: null,
  status: 'Open',
  resolutionNote: null,
  resolvedAt: null,
  createdBy: 1,
  createdAt: '2026-10-20T08:00:00.000Z',
  updatedAt: '2026-10-20T08:00:00.000Z',
}

function renderDialog() {
  const onOpenChange = vi.fn()
  renderWithProviders(
    <ResolveInspectionDialog
      inspection={inspection}
      open
      onOpenChange={onOpenChange}
    />,
  )
  return { onOpenChange }
}

describe.each([
  ['desktop dialog', true],
  ['mobile drawer', false],
])('ResolveInspectionDialog (%s)', (_label, isDesktop) => {
  beforeEach(() => {
    installMatchMedia(isDesktop)
    vi.mocked(inspectionsApi.resolve).mockReset()
  })

  it('requires a resolution note before calling the API', async () => {
    const user = userEvent.setup()
    renderDialog()

    expect(
      await screen.findByRole('heading', { name: 'Resolve inspection' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark as resolved' }))
    expect(
      await screen.findByText('Add a resolution note (at least 3 characters)'),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Resolution note'), '   ')
    await user.click(screen.getByRole('button', { name: 'Mark as resolved' }))
    expect(
      screen.getByText('Add a resolution note (at least 3 characters)'),
    ).toBeInTheDocument()

    expect(inspectionsApi.resolve).not.toHaveBeenCalled()
  })

  it('submits the trimmed note and closes on success', async () => {
    const user = userEvent.setup()
    vi.mocked(inspectionsApi.resolve).mockResolvedValue({
      ...inspection,
      status: 'Resolved',
      resolutionNote: 'Re-threaded loom',
      resolvedAt: '2026-10-21T09:00:00.000Z',
    })
    const { onOpenChange } = renderDialog()

    await user.type(
      await screen.findByLabelText('Resolution note'),
      '  Re-threaded loom  ',
    )
    await user.click(screen.getByRole('button', { name: 'Mark as resolved' }))

    await waitFor(() =>
      expect(inspectionsApi.resolve).toHaveBeenCalledWith('insp-1', {
        resolutionNote: 'Re-threaded loom',
      }),
    )
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('surfaces a server validation error on the note field', async () => {
    const user = userEvent.setup()
    vi.mocked(inspectionsApi.resolve).mockRejectedValue(
      new ApiError(422, 'VALIDATION_FAILED', 'Validation failed', [
        { path: ['resolutionNote'], message: 'Note is too vague' },
      ]),
    )
    const { onOpenChange } = renderDialog()

    await user.type(await screen.findByLabelText('Resolution note'), 'Fixed')
    await user.click(screen.getByRole('button', { name: 'Mark as resolved' }))

    expect(await screen.findByText('Note is too vague')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
