import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Header } from './Header.tsx'

describe('Header', () => {
  it('renders the approved logo and the catalogue shop link', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)

    expect(screen.getByRole('img', { name: 'Build & Bloom by Colorful Life' })).toHaveAttribute('src', '/images/branding/build-and-bloom-logo.png')
    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/catalogue')
  })

  it('provides accessible presentation controls without fabricated cart state', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)

    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Themes' })).toBeInTheDocument()
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument()
  })

  it('provides an accessible mobile menu with the primary navigation', () => {
    render(<MemoryRouter><Header /></MemoryRouter>)

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Mobile primary navigation' })).not.toBeInTheDocument()

    fireEvent.click(menuButton)

    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile primary navigation' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(within(mobileNavigation).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/catalogue')
    expect(within(mobileNavigation).getByRole('button', { name: 'Themes' })).toBeInTheDocument()
  })
})
