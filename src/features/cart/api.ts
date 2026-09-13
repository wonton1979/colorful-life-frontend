import { apiClient } from '../../lib/api/client.ts'
import type { Cart } from './types.ts'

export async function getCart(): Promise<Cart> {
  return (await apiClient.get<Cart>('/cart')).data
}

export async function addCartItem(productListingId: number, quantity: number): Promise<Cart> {
  return (await apiClient.post<Cart>('/cart/items', { productListingId, quantity })).data
}

export async function updateCartItem(productListingId: number, quantity: number): Promise<Cart> {
  return (await apiClient.patch<Cart>(`/cart/items/${productListingId}`, { quantity })).data
}

export async function removeCartItem(productListingId: number): Promise<Cart> {
  return (await apiClient.delete<Cart>(`/cart/items/${productListingId}`)).data
}

export async function clearCart(): Promise<Cart> {
  return (await apiClient.delete<Cart>('/cart')).data
}
