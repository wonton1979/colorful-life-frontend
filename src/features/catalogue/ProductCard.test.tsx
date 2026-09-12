import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ProductListing } from './types.ts'
import { ProductCard } from './ProductCard.tsx'

const listing: ProductListing = {
  id: 103, legoProductId: 27, condition: 'NEW', originalPrice: '49.99', salePrice: '39.99', currentStock: 3,
  createdAt: '', updatedAt: '',
  legoProduct: { id: 27, setNumber: '75192', title: 'Millennium Falcon', description: null, theme: 'Star Wars', ageRecommendation: '16+', pieceCount: 7541, createdAt: '', updatedAt: '' },
  listingImages: [
    { id: 1, listingId: 103, url: '/first.jpg', publicId: 'first', altText: 'Falcon front', sortOrder: 2, createdAt: '' },
    { id: 2, listingId: 103, url: '/second.jpg', publicId: 'second', altText: 'Falcon side', sortOrder: 1, createdAt: '' },
  ],
}

function renderCard(value = listing) {
  return render(<MemoryRouter><ul><ProductCard listing={value} /></ul></MemoryRouter>)
}

describe('ProductCard', () => {
  it('renders the listing content and sale prices', () => {
    renderCard()

    expect(screen.getByRole('heading', { name: 'Millennium Falcon' })).toBeInTheDocument()
    expect(screen.getByText('Set 75192')).toBeInTheDocument()
    expect(screen.getByText('Theme: Star Wars')).toBeInTheDocument()
    expect(screen.getByText('Condition: NEW')).toBeInTheDocument()
    expect(screen.getByText('Original price: 49.99')).toBeInTheDocument()
    expect(screen.getByText('Sale price: 39.99')).toBeInTheDocument()
  })

  it('uses the first image, its alt text, and the listing id for both links', () => {
    renderCard()

    const image = screen.getByRole('img', { name: 'Falcon front' })
    expect(image).toHaveAttribute('src', '/first.jpg')
    expect(screen.queryByRole('img', { name: 'Falcon side' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)
    screen.getAllByRole('link').forEach((link) => expect(link).toHaveAttribute('href', '/catalogue/103'))
  })

  it('falls back to the title for null alt text', () => {
    renderCard({ ...listing, listingImages: [{ ...listing.listingImages[0], altText: null }] })

    expect(screen.getByRole('img', { name: 'Millennium Falcon' })).toBeInTheDocument()
  })

  it('renders the static placeholder when there are no images', () => {
    renderCard({ ...listing, listingImages: [] })

    expect(screen.getByRole('img', { name: 'No product image available' })).toHaveAttribute('src', '/images/no-product-image.svg')
  })

  it('renders the original price normally when there is no sale price', () => {
    renderCard({ ...listing, salePrice: null })

    expect(screen.getByText('Price: 49.99')).toBeInTheDocument()
    expect(screen.queryByText(/Sale price/)).not.toBeInTheDocument()
  })
})
