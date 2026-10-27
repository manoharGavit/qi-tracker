import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { DatePicker } from '@/shared/components/ui/date-picker'

function ControlledDatePicker({
  initialValue = '2026-10-15',
  clearable = true,
}: {
  initialValue?: string
  clearable?: boolean
}) {
  const [date, setDate] = useState(initialValue)
  return (
    <DatePicker
      id="test-date"
      value={date}
      onChange={setDate}
      clearable={clearable}
      placeholder="Select date"
    />
  )
}

describe('DatePicker', () => {
  it('renders formatted date when value is provided', () => {
    render(<DatePicker value="2026-10-15" />)
    expect(screen.getByText('15 Oct 2026')).toBeInTheDocument()
  })

  it('renders placeholder when value is empty', () => {
    render(<DatePicker value="" placeholder="Pick inspection date" />)
    expect(screen.getByText('Pick inspection date')).toBeInTheDocument()
  })

  it('opens shadcn calendar popover and allows date selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DatePicker
        id="date-input"
        value="2026-10-15"
        onChange={onChange}
      />,
    )

    // Open calendar popover
    const trigger = screen.getByRole('button', { name: /15 Oct 2026/i })
    await user.click(trigger)

    // Calendar is opened
    expect(screen.getByText('October 2026')).toBeInTheDocument()

    // Select the 20th
    const day20 = screen.getByRole('button', { name: /October 20th/i })
    await user.click(day20)

    expect(onChange).toHaveBeenCalledWith('2026-10-20')
  })

  it('clears date when clearable and clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledDatePicker initialValue="2026-10-15" clearable />)

    expect(screen.getByText('15 Oct 2026')).toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: 'Clear date' })
    await user.click(clearBtn)

    expect(screen.getByText('Select date')).toBeInTheDocument()
  })
})
