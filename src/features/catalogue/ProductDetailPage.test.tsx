import axios from 'axios'
import { fireEvent, render, screen} from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProductById } from './api.ts'
import { ProductDetailPage } from './ProductDetailPage.tsx'
import type { ProductListing } from './types.ts'
import { AuthProvider } from '../auth/AuthContext.tsx'
import { CartProvider } from '../cart/CartContext.tsx'

vi.mock('./api.ts', () => ({ getProductById: vi.fn() }))
const getProductByIdMock = vi.mocked(getProductById)

const product: ProductListing = {
  id: 42, legoProductId: 7, condition: 'NEW', originalPrice: '49.99', salePrice: '39.99', currentStock: 3,
  createdAt: '', updatedAt: '',
  legoProduct: { id: 7, setNumber: '12345', title: 'Space Explorer', description: 'Explore space.', theme: 'Space',
    ageRecommendation: '8+', pieceCount: 500, createdAt: '', updatedAt: '' },
  listingImages: [],
}

function renderAt(path: string) {
  return render(<AuthProvider><CartProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/catalogue/:id" element={<ProductDetailPage />} /></Routes></MemoryRouter></CartProvider></AuthProvider>)
}

function ChangeRoute({ to }: { to: string }) {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate(to)}>Change route</button>
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

describe('ProductDetailPage', () => {
  beforeEach(() => getProductByIdMock.mockReset())

  it('shows loading while a valid product request is pending', () => {
    const request = deferred<ProductListing>()
    getProductByIdMock.mockReturnValue(request.promise)
    renderAt('/catalogue/42')

    expect(screen.getByText('Loading product...')).toBeInTheDocument()
    request.resolve(product)
  })

  it('requests the numeric route id and renders product data', async () => {
    getProductByIdMock.mockResolvedValue(product)
    renderAt('/catalogue/42')

    expect(await screen.findByRole('heading', { name: 'Space Explorer' })).toBeInTheDocument()
    expect(getProductByIdMock).toHaveBeenCalledWith(42)
    expect(screen.getByText('Set 12345')).toBeInTheDocument()
    expect(screen.getByText('Theme: Space')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Description' })).toBeInTheDocument()
    expect(screen.getByText('Explore space.')).toBeInTheDocument()
    expect(screen.getByText('Age recommendation')).toBeInTheDocument()
    expect(screen.getByText('8+')).toBeInTheDocument()
    expect(screen.getByText('Piece count')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Condition')).toBeInTheDocument()
    expect(screen.getByText('NEW')).toBeInTheDocument()
    expect(screen.getByText('Current stock')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Original price: 49.99')).toBeInTheDocument()
    expect(screen.getByText('Sale price: 39.99')).toBeInTheDocument()
  })

  it('falls back to the original price and safe description', async () => {
    getProductByIdMock.mockResolvedValue({ ...product, salePrice: null, legoProduct: { ...product.legoProduct, description: null } })
    renderAt('/catalogue/42')

    expect(await screen.findByText('Price: 49.99')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('No description available.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'No product image available' })).toHaveAttribute('src', '/images/no-product-image.svg')
  })

  it('provides a back-to-catalogue link and semantic product metadata', async () => {
    getProductByIdMock.mockResolvedValue(product)
    renderAt('/catalogue/42')

    await screen.findByRole('heading', { name: 'Space Explorer' })
    expect(screen.getByRole('link', { name: 'Back to catalogue' })).toHaveAttribute('href', '/catalogue')
    expect(screen.getByText('Age recommendation').tagName).toBe('DT')
    expect(screen.getByText('Current stock').tagName).toBe('DT')
  })

  it('renders listing images in backend order with alt text fallbacks', async () => {
    getProductByIdMock.mockResolvedValue({
      ...product,
      listingImages: [
        { id: 1, listingId: 42, url: '/first.jpg', publicId: 'first', altText: 'First view', sortOrder: 2, createdAt: '' },
        { id: 2, listingId: 42, url: '/second.jpg', publicId: 'second', altText: null, sortOrder: 1, createdAt: '' },
      ],
    })
    renderAt('/catalogue/42')

    const images = await screen.findAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', '/first.jpg')
    expect(images[0]).toHaveAccessibleName('First view')
    expect(images[1]).toHaveAttribute('src', '/second.jpg')
    expect(images[1]).toHaveAccessibleName('Space Explorer')
  })

  it.each(['abc', '0', '-5'])('rejects invalid route id %s', (id) => {
    renderAt(`/catalogue/${id}`)
    expect(screen.getByText('Product not found.')).toBeInTheDocument()
    expect(getProductByIdMock).not.toHaveBeenCalled()
  })

  it('shows not found and clears the previous product when the route becomes invalid', async () => {
    getProductByIdMock.mockResolvedValue(product)
    render(
      <AuthProvider><CartProvider><MemoryRouter initialEntries={['/catalogue/42']}>
        <Routes>
          <Route path="/catalogue/:id" element={<><ProductDetailPage /><ChangeRoute to="/catalogue/abc" /></>} />
        </Routes>
      </MemoryRouter></CartProvider></AuthProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'Space Explorer' })).toBeInTheDocument()
    expect(getProductByIdMock).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Change route' }))

    expect(screen.getByText('Product not found.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Space Explorer' })).not.toBeInTheDocument()
    expect(getProductByIdMock).toHaveBeenCalledOnce()
  })

  it('renders not found for a backend 404', async () => {
    const error = { response: { status: 404 } }
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    getProductByIdMock.mockRejectedValueOnce(error)
    renderAt('/catalogue/42')

    expect(await screen.findByText('Product not found.')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('renders a generic error for other failures', async () => {
    getProductByIdMock.mockRejectedValueOnce(new Error('Request failed'))
    renderAt('/catalogue/42')

    expect(await screen.findByText('Unable to load product.')).toBeInTheDocument()
  })

  it('does not allow an older route response to replace the newer product', async () => {

    const requestA = deferred<ProductListing>()
    const requestB = deferred<ProductListing>()
    getProductByIdMock.mockReturnValueOnce(requestA.promise).mockReturnValueOnce(requestB.promise)
    render(
        <AuthProvider><CartProvider><MemoryRouter initialEntries={['/catalogue/1']}>
          <Routes>
            <Route path="/catalogue/:id" element={<><ProductDetailPage />
            <ChangeRoute to="/catalogue/2" /></>} />
          </Routes>
        </MemoryRouter></CartProvider></AuthProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Change route' }))

    requestB.resolve({ ...product, id: 2, legoProduct: { ...product.legoProduct, title: 'Product B' } })

    expect(await screen.findByRole('heading', { name: 'Product B' })).toBeInTheDocument()

    requestA.resolve({ ...product, id: 1, legoProduct: { ...product.legoProduct, title: 'Product A' } })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(
        screen.queryByRole('heading', { name: 'Product A' }),
    ).not.toBeInTheDocument()

    expect(
        screen.getByRole('heading', { name: 'Product B' }),
    ).toBeInTheDocument()
  })
})
