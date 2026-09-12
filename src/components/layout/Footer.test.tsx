import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer.tsx'

describe('Footer', () => {
  it('renders the brand, legal identity, and existing shop destination', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)

    expect(screen.getAllByRole('img', { name: 'Build & Bloom by Colorful Life' })[0]).toHaveAttribute('src', '/images/branding/build-and-bloom-footer-dog.png')
    expect(screen.getAllByText('© 2026 Colorful Life Ltd. All rights reserved.')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'All Sets' })[0]).toHaveAttribute('href', '/catalogue')
  })

  it('does not claim unsupported payment or social integrations', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)

    expect(screen.queryByText(/Visa|Mastercard|PayPal|Instagram|Facebook|TikTok/)).not.toBeInTheDocument()
  })

  it('provides collapsed mobile footer sections that disclose their content', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)

    const shopButton = screen.getByRole('button', { name: 'Shop' })
    expect(shopButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'All Sets' })).toBeInTheDocument()

    fireEvent.click(shopButton)

    expect(shopButton).toHaveAttribute('aria-expanded', 'true')
    const shopRegion = screen.getByRole('region', { name: 'Shop' })
    expect(within(shopRegion).getByRole('link', { name: 'All Sets' })).toHaveAttribute('href', '/catalogue')
    expect(within(shopRegion).queryByText('New Arrivals')).not.toBeNull()
  })
})
