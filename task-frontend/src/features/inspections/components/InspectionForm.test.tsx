import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InspectionForm } from '@/features/inspections/components/InspectionForm'
import { ApiError } from '@/shared/api/apiError'
import { todayIsoDate } from '@/shared/lib/dates'

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  option: string,
) {
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('InspectionForm', () => {
  it('defaults the inspection date to today', () => {
    render(<InspectionForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Inspection date')).toHaveValue(todayIsoDate())
  })

  it('shows required-field errors and does not submit when empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<InspectionForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Log inspection' }))

    expect(await screen.findByText('Machine ID is required')).toBeInTheDocument()
    expect(screen.getByText('Select a defect type')).toBeInTheDocument()
    expect(screen.getByText('Select a severity')).toBeInTheDocument()
    expect(screen.getByLabelText('Machine ID')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects whitespace-only and over-long machine IDs', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<InspectionForm onSubmit={onSubmit} />)
    const machineId = screen.getByLabelText('Machine ID')

    await user.type(machineId, '   ')
    await user.click(screen.getByRole('button', { name: 'Log inspection' }))
    expect(await screen.findByText('Machine ID is required')).toBeInTheDocument()

    await user.clear(machineId)
    await user.type(machineId, 'L'.repeat(51))
    expect(
      await screen.findByText('Machine ID must be at most 50 characters'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed values and omits empty remarks', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<InspectionForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Machine ID'), '  LOOM-12  ')
    await choose(user, 'Defect type', 'Shade Variation')
    await choose(user, 'Severity', 'Critical')
    await user.click(screen.getByRole('button', { name: 'Log inspection' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      inspectionDate: todayIsoDate(),
      machineId: 'LOOM-12',
      defectType: 'Shade Variation',
      severity: 'Critical',
      remarks: undefined,
    })
  })

  it('maps 422 validation details from the API onto fields', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(422, 'VALIDATION_FAILED', 'Validation failed', [
        { path: ['machineId'], message: 'Machine ID is not registered' },
      ]),
    )
    render(<InspectionForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Machine ID'), 'LOOM-99')
    await choose(user, 'Defect type', 'Other')
    await choose(user, 'Severity', 'Minor')
    await user.click(screen.getByRole('button', { name: 'Log inspection' }))

    expect(
      await screen.findByText('Machine ID is not registered'),
    ).toBeInTheDocument()
  })

  it('shows a form-level error for non-validation failures', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(500, 'INTERNAL_ERROR', 'Server exploded'))
    render(<InspectionForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Machine ID'), 'LOOM-1')
    await choose(user, 'Defect type', 'Hole/Tear')
    await choose(user, 'Severity', 'Major')
    await user.click(screen.getByRole('button', { name: 'Log inspection' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server exploded')
  })
})
