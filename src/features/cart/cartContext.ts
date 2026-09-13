import { createContext } from 'react'
import type { Cart } from './types.ts'

export interface CartContextValue {
  cart: Cart | null
  status: 'unavailable' | 'loading' | 'loaded' | 'error'
  totalQuantity: number
  addItem: (productListingId: number, quantity: number) => Promise<Cart>
  updateItem: (productListingId: number, quantity: number) => Promise<Cart>
  removeItem: (productListingId: number) => Promise<Cart>
  clearCart: () => Promise<Cart>
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)
