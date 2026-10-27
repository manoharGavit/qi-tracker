import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'

describe('AppProviders', () => {
  it('sends an unauthenticated visitor from / to login, remembering the target', async () => {
    render(<AppProviders />)

    expect(
      await screen.findByText('Sign in', { selector: '[data-slot=card-title]' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/supervisor@arvind\.com/)).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
    expect(new URLSearchParams(window.location.search).get('redirect')).toBe(
      '/inspections',
    )
  })
})
