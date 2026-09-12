import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

const response = (items: ProductsResponse['items'], page = 1, totalPages = items.length === 0 ? 0 : 1): ProductsResponse => ({
  items,
  pagination: { page, pageSize: 20, totalItems: items.length, totalPages },
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

describe('CataloguePage', () => {
  beforeEach(() => {
    getProductsMock.mockReset()
  })

  it('shows loading while the request is pending and calls getProducts on mount', async () => {
    getProductsMock.mockReturnValue(new Promise(() => undefined))

    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(screen.getByText('Loading catalogue...')).toBeInTheDocument()
    await waitFor(() => expect(getProductsMock).toHaveBeenCalledWith({ page: 1, pageSize: 20 }))
  })

  it('renders returned product data and the sale price', async () => {
    getProductsMock.mockResolvedValue(response([product]))

    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(await screen.findByText('Space Explorer')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Space Explorer' })).toHaveAttribute('href', '/catalogue/1')
    expect(screen.getByText('Set 12345')).toBeInTheDocument()
    expect(screen.getByText('Price: 39.99')).toBeInTheDocument()
  })

  it('renders returned product data and the original price', async () => {

    getProductsMock.mockResolvedValue(response([productWithoutSale]))

    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(await screen.findByText('Space Explorer')).toBeInTheDocument()
    expect(screen.getByText('Set 12345')).toBeInTheDocument()
    expect(screen.getByText('Price: 49.99')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'No product image available' })).toHaveAttribute('src', '/images/no-product-image.svg')
  })

  it('renders the first listing image as a linked catalogue thumbnail', async () => {
    getProductsMock.mockResolvedValue(response([{
      ...product,
      listingImages: [
        { id: 1, listingId: 1, url: '/first.jpg', publicId: 'first', altText: 'First image', sortOrder: 2, createdAt: '' },
        { id: 2, listingId: 1, url: '/second.jpg', publicId: 'second', altText: 'Second image', sortOrder: 1, createdAt: '' },
      ],
    }]))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    const thumbnail = await screen.findByRole('img', { name: 'First image' })
    expect(thumbnail).toHaveAttribute('src', '/first.jpg')
    expect(screen.queryByRole('img', { name: 'Second image' })).not.toBeInTheDocument()
    expect(thumbnail.closest('a')).toHaveAttribute('href', '/catalogue/1')
  })

  it('uses the product title when the first thumbnail has no alt text', async () => {
    getProductsMock.mockResolvedValue(response([{
      ...product,
      listingImages: [{ id: 1, listingId: 1, url: '/first.jpg', publicId: 'first', altText: null, sortOrder: 1, createdAt: '' }],
    }]))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(await screen.findByRole('img', { name: 'Space Explorer' })).toHaveAttribute('src', '/first.jpg')
  })

  it('renders the empty state when no products are returned', async () => {
    getProductsMock.mockResolvedValue(response([]))

    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(await screen.findByText('Catalogue is empty.')).toBeInTheDocument()
  })

  it('renders the error state when loading fails', async () => {
    getProductsMock.mockRejectedValue(new Error('Request failed'))

    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    expect(await screen.findByText('Unable to load catalogue.')).toBeInTheDocument()
  })

  it('submits trimmed filters, converts prices, and omits blank values', async () => {
    getProductsMock.mockResolvedValue(response([]))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)
    await waitFor(() => expect(getProductsMock).toHaveBeenCalledOnce())

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: '  space  ' } })
    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: '  Space  ' } })
    fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '10.50' } })
    fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: ' 20 ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(getProductsMock).toHaveBeenLastCalledWith({
      q: 'space', theme: 'Space', minPrice: 10.5, maxPrice: 20, page: 1, pageSize: 20,
    }))
  })

  it('does not let an older response replace a newer query result', async () => {
    const initialRequest = deferred<ProductsResponse>()
    const newerRequest = deferred<ProductsResponse>()
    getProductsMock
      .mockReturnValueOnce(initialRequest.promise)
      .mockReturnValueOnce(newerRequest.promise)

    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'new' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    newerRequest.resolve(response([product]))
    expect(await screen.findByText('Space Explorer')).toBeInTheDocument()
    initialRequest.resolve(response([productWithoutSale]))

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(screen.getByText('Price: 39.99')).toBeInTheDocument()
  })

  it('resets pagination to page 1 when applying a filter from page 2', async () => {
    getProductsMock
      .mockResolvedValueOnce(response([product], 2, 2))
      .mockResolvedValueOnce(response([product], 1, 2))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)
    await screen.findByText('Page 2 of 2')

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'space' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(getProductsMock).toHaveBeenLastCalledWith({
      q: 'space', page: 1, pageSize: 20,
    }))
  })

  it.each([
    ['not-a-number', '', 'Prices must be valid, non-negative numbers.'],
    ['-1', '', 'Prices must be valid, non-negative numbers.'],
    ['20', '10', 'Minimum price cannot be greater than maximum price.'],
  ])('rejects invalid prices', async (minPrice, maxPrice, message) => {
    getProductsMock.mockResolvedValue(response([]))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)
    await waitFor(() => expect(getProductsMock).toHaveBeenCalledOnce())
    getProductsMock.mockClear()

    fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: minPrice } })
    fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: maxPrice } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(getProductsMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(message)
  })

  it('disables Previous on the first page and Next on the final page', async () => {
    getProductsMock.mockResolvedValue(response([product], 1, 1))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)

    await screen.findByText('Page 1 of 1')

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(getProductsMock).toHaveBeenCalledOnce()

    getProductsMock.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(getProductsMock).not.toHaveBeenCalled()
  })

  it('requests the next page while preserving the applied filters', async () => {
    getProductsMock
      .mockResolvedValueOnce(response([product], 1, 2))
      .mockResolvedValueOnce(response([product], 1, 2))
      .mockResolvedValueOnce(response([product], 2, 2))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)
    await waitFor(() => expect(getProductsMock).toHaveBeenCalledOnce())

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: ' space ' } })
    fireEvent.change(screen.getByLabelText('Theme'), { target: { value: ' Star Wars ' } })
    fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(getProductsMock).toHaveBeenLastCalledWith({
      q: 'space', theme: 'Star Wars', minPrice: 10, maxPrice: 20, page: 1, pageSize: 20,
    }))

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'unsaved' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(getProductsMock).toHaveBeenLastCalledWith({
      q: 'space', theme: 'Star Wars', minPrice: 10, maxPrice: 20, page: 2, pageSize: 20,
    }))
    await screen.findByText('Page 2 of 2')
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('requests the previous page and does not cross the backend boundaries', async () => {
    getProductsMock
      .mockResolvedValueOnce(response([product], 2, 2))
      .mockResolvedValueOnce(response([product], 1, 2))
    render(<MemoryRouter><CataloguePage /></MemoryRouter>)
    await screen.findByText('Page 2 of 2')

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    await waitFor(() => expect(getProductsMock).toHaveBeenLastCalledWith({ page: 1, pageSize: 20 }))
    await screen.findByText('Page 1 of 2')
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    getProductsMock.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(getProductsMock).not.toHaveBeenCalled()
  })
})
