import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InspectionPagination } from '@/features/inspections/components/InspectionPagination'

describe('InspectionPagination', () => {
  it('renders nothing when total is 0', () => {
    const { container } = render(
      <InspectionPagination
        page={1}
        totalPages={0}
        total={0}
        limit={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders showing count and page buttons', () => {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

    render(
      <InspectionPagination
        page={1}
        totalPages={3}
        total={50}
        limit={20}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    )

    expect(screen.getByText('1–20')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()

    const page1Btn = screen.getByRole('button', { name: '1' })
    expect(page1Btn).toHaveAttribute('aria-current', 'page')

    const page2Btn = screen.getByRole('button', { name: '2' })
    fireEvent.click(page2Btn)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page and next button on last page', () => {
    const onPageChange = vi.fn()

    const { rerender } = render(
      <InspectionPagination
        page={1}
        totalPages={2}
        total={30}
        limit={20}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    )

    const prevBtn = screen.getByRole('button', { name: /previous/i })
    expect(prevBtn).toBeDisabled()

    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).not.toBeDisabled()
    fireEvent.click(nextBtn)
    expect(onPageChange).toHaveBeenCalledWith(2)

    rerender(
      <InspectionPagination
        page={2}
        totalPages={2}
        total={30}
        limit={20}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('renders ellipsis for large page counts', () => {
    render(
      <InspectionPagination
        page={5}
        totalPages={10}
        total={200}
        limit={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    )

    expect(screen.getAllByText('More pages').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page')
  })
})
