import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CataloguePage } from './CataloguePage.tsx'
import { getProducts } from './api.ts'
import type { ProductsResponse,ProductListing } from './types.ts'

vi.mock('./api.ts', () => ({
  getProducts: vi.fn(),
}))

const getProductsMock = vi.mocked(getProducts)

const product : ProductListing = {
  id: 1,
  legoProductId: 2,
  condition: 'NEW' as const,
  originalPrice: '49.99',
  salePrice: '39.99',
  currentStock: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  legoProduct: {
    id: 2,
    setNumber: '12345',
    title: 'Space Explorer',
    description: null,
    theme: 'Space',
    ageRecommendation: '8+',
    pieceCount: 500,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  listingImages: [],
}

const productWithoutSale: ProductListing = {
  ...product,
  salePrice: null,
}

const response = (items: ProductsResponse['items']): ProductsResponse => ({
  items,
  pagination: { page: 1, pageSize: 20, totalItems: items.length, totalPages: items.length === 0 ? 0 : 1 },
})

describe('CataloguePage', () => {
  beforeEach(() => {
    getProductsMock.mockReset()
  })

  it('shows loading while the request is pending and calls getProducts on mount', () => {
    getProductsMock.mockReturnValue(new Promise(() => undefined))

    render(<CataloguePage />)

    expect(screen.getByText('Loading catalogue...')).toBeInTheDocument()
    expect(getProductsMock).toHaveBeenCalledOnce()
  })

  it('renders returned product data and the sale price', async () => {
    getProductsMock.mockResolvedValue(response([product]))

    render(<CataloguePage />)

    expect(await screen.findByText('Space Explorer')).toBeInTheDocument()
    expect(screen.getByText('Set 12345')).toBeInTheDocument()
    expect(screen.getByText('Price: 39.99')).toBeInTheDocument()
  })

  it('renders returned product data and the original price', async () => {

    getProductsMock.mockResolvedValue(response([productWithoutSale]))

    render(<CataloguePage />)

    expect(await screen.findByText('Space Explorer')).toBeInTheDocument()
    expect(screen.getByText('Set 12345')).toBeInTheDocument()
    expect(screen.getByText('Price: 49.99')).toBeInTheDocument()
  })

  it('renders the empty state when no products are returned', async () => {
    getProductsMock.mockResolvedValue(response([]))

    render(<CataloguePage />)

    expect(await screen.findByText('Catalogue is empty.')).toBeInTheDocument()
  })

  it('renders the error state when loading fails', async () => {
    getProductsMock.mockRejectedValue(new Error('Request failed'))

    render(<CataloguePage />)

    expect(await screen.findByText('Unable to load catalogue.')).toBeInTheDocument()
  })
})
