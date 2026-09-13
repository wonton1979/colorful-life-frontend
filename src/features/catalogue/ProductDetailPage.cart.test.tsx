import axios from 'axios'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductDetailPage } from './ProductDetailPage.tsx'
import { getProductById } from './api.ts'
import { useAuth } from '../auth/useAuth.ts'
import { useCart } from '../cart/useCart.ts'

vi.mock('./api.ts', () => ({ getProductById: vi.fn() }))
vi.mock('../auth/useAuth.ts', () => ({ useAuth: vi.fn() }))
vi.mock('../cart/useCart.ts', () => ({ useCart: vi.fn() }))
const product = { id: 42, legoProductId: 7, condition: 'NEW' as const, originalPrice: '49.99', salePrice: null, currentStock: 10, createdAt: '', updatedAt: '', legoProduct: { id: 7, setNumber: '12345', title: 'Space Explorer', description: null, theme: 'Space', ageRecommendation: '8+', pieceCount: 500, createdAt: '', updatedAt: '' }, listingImages: [] }
const addMock = vi.mocked(useCart)
const getProductMock = vi.mocked(getProductById)
function renderPage() { return render(<MemoryRouter initialEntries={['/catalogue/42']}><Routes><Route path="/catalogue/:id" element={<ProductDetailPage />} /></Routes></MemoryRouter>) }

describe('ProductDetailPage cart feedback', () => {
  beforeEach(() => { getProductMock.mockResolvedValue(product); vi.mocked(useAuth).mockReturnValue({ state: { status: 'authenticated', token: 'token', user: { id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' } }, login: vi.fn(), signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: vi.fn() }); addMock.mockReturnValue({ cart: null, status: 'loaded', totalQuantity: 0, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn() }) })
  it('shows success feedback after adding', async () => { const add = vi.fn().mockResolvedValue({}); addMock.mockReturnValue({ ...addMock(), addItem: add }); renderPage(); await screen.findByRole('heading', { name: 'Space Explorer' }); fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' })); expect(await screen.findByRole('status')).toHaveTextContent('Added to cart.'); expect(add).toHaveBeenCalledWith(42, 1) })
  it('shows the specific maximum-quantity message for 409', async () => { const add = vi.fn().mockRejectedValue({ response: { status: 409 } }); vi.spyOn(axios, 'isAxiosError').mockReturnValue(true); addMock.mockReturnValue({ ...addMock(), addItem: add }); renderPage(); await screen.findByRole('heading', { name: 'Space Explorer' }); fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' })); expect(await screen.findByRole('alert')).toHaveTextContent('You already have the maximum available quantity in your cart.') })
  it('shows a separate generic error for other failures', async () => { const add = vi.fn().mockRejectedValue(new Error('network')); addMock.mockReturnValue({ ...addMock(), addItem: add }); renderPage(); await screen.findByRole('heading', { name: 'Space Explorer' }); fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' })); await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to add this item to your cart.')); expect(screen.queryByText(/maximum available/)).not.toBeInTheDocument() })
})
