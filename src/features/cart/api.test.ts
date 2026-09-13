import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client.ts'
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from './api.ts'

vi.mock('../../lib/api/client.ts', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
const client = vi.mocked(apiClient)
const data = { id: 1, items: [] }

describe('cart API', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('gets the cart and returns response data', async () => { client.get.mockResolvedValue({ data }); await expect(getCart()).resolves.toBe(data); expect(client.get).toHaveBeenCalledWith('/cart') })
  it('adds an item', async () => { client.post.mockResolvedValue({ data }); await addCartItem(42, 2); expect(client.post).toHaveBeenCalledWith('/cart/items', { productListingId: 42, quantity: 2 }) })
  it('updates absolute quantity', async () => { client.patch.mockResolvedValue({ data }); await updateCartItem(42, 3); expect(client.patch).toHaveBeenCalledWith('/cart/items/42', { quantity: 3 }) })
  it('removes an item', async () => { client.delete.mockResolvedValue({ data }); await removeCartItem(42); expect(client.delete).toHaveBeenCalledWith('/cart/items/42') })
  it('clears the cart', async () => { client.delete.mockResolvedValue({ data }); await clearCart(); expect(client.delete).toHaveBeenCalledWith('/cart') })
})
