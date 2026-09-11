import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './routes.tsx'

describe('application routes', () => {
  it('renders the home page at the root route', () => {
    render(<MemoryRouter initialEntries={['/']}><AppRoutes /></MemoryRouter>)
    expect(screen.getByRole('banner')).toHaveTextContent('Application header')
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Home page' }),
    )
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Application footer')
  })

  it('renders the not found page for an unknown route', () => {
    render(<MemoryRouter initialEntries={['/unknown']}><AppRoutes /></MemoryRouter>)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Page not found' }),
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
