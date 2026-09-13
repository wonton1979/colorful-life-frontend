import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from './CartContext.tsx'
import { useCart } from './useCart.ts'
import { useAuth } from '../auth/useAuth.ts'
import { addCartItem, getCart } from './api.ts'
import type { AuthState } from '../auth/types.ts'

vi.mock('../auth/useAuth.ts', () => ({ useAuth: vi.fn() }))
vi.mock('./api.ts', () => ({ getCart: vi.fn(), addCartItem: vi.fn(), updateCartItem: vi.fn(), removeCartItem: vi.fn(), clearCart: vi.fn() }))
const authMock = vi.mocked(useAuth)
const getCartMock = vi.mocked(getCart)
const addMock = vi.mocked(addCartItem)
const cart = { id: 1, userId: 2, createdAt: '', updatedAt: '', items: [{ id: 1, cartId: 1, productListingId: 42, quantity: 2, createdAt: '', updatedAt: '', productListing: {} as never }, { id: 2, cartId: 1, productListingId: 43, quantity: 1, createdAt: '', updatedAt: '', productListing: {} as never }] }
function Harness() { const value = useCart(); return <><output>{value.status}</output><output>{value.totalQuantity}</output><button onClick={() => void value.addItem(42, 1).catch(() => undefined)}>add</button></> }
function renderCart(state: AuthState) { authMock.mockReturnValue({ state, login: vi.fn(), signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: vi.fn() }); return render(<CartProvider><Harness /></CartProvider>) }

describe('CartProvider', () => {
  beforeEach(() => { vi.clearAllMocks(); getCartMock.mockResolvedValue(cart); addMock.mockResolvedValue({ ...cart, items: [] }) })
  it.each([{ status: 'unauthenticated' }, { status: 'restoring' }])('does not fetch for $status', (state) => { renderCart(state as never); expect(getCartMock).not.toHaveBeenCalled() })
  it.each([{ status: 'authenticated', token: 't', user: {} }, { status: 'authenticated-unverified', token: 't' }])('loads for usable auth state', async (state) => { renderCart(state as never); expect(await screen.findByText('3')).toBeInTheDocument(); expect(getCartMock).toHaveBeenCalledOnce() })
  it('replaces the snapshot after a successful add and preserves it after failure', async () => { renderCart({ status: 'authenticated', token: 't', user: {} } as never); await screen.findByText('3'); fireEvent.click(screen.getByRole('button', { name: 'add' })); await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument()); addMock.mockRejectedValueOnce(new Error('failed')); fireEvent.click(screen.getByRole('button', { name: 'add' })); await waitFor(() => expect(addMock).toHaveBeenCalledTimes(2)); expect(screen.getByText('0')).toBeInTheDocument() })
  it('strictly requires a provider', () => { expect(() => render(<Harness />)).toThrow('useCart must be used within CartProvider') })
})
