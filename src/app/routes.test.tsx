import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './routes.tsx'
import { AuthProvider } from '../features/auth/AuthContext.tsx'

function renderRoutes(initialEntries: string[]) {
  return render(<AuthProvider><MemoryRouter initialEntries={initialEntries}><AppRoutes /></MemoryRouter></AuthProvider>)
}

vi.mock('../features/catalogue/api.ts', () => ({
  getProducts: vi.fn().mockResolvedValue({
    items: [],
    pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
  }),
}))

describe('application routes', () => {
  it('renders the home page at the root route', () => {
    renderRoutes(['/'])
    expect(within(screen.getByRole('banner')).getByRole('img', { name: 'Build & Bloom by Colorful Life' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Home page' }),
    )
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Colorful Life Ltd')
  })

  it('renders the not found page for an unknown route', () => {
    renderRoutes(['/unknown'])
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Page not found' }),
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the catalogue page inside the application shell', async () => {
    renderRoutes(['/catalogue'])

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(
      await screen.findByText('Catalogue is empty.'),
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
