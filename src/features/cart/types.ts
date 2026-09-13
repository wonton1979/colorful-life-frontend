import type { LegoProduct, ListingCondition, ListingImage } from '../catalogue/types.ts'

export interface CartProductListing {
  id: number
  legoProductId: number
  condition: ListingCondition
  originalPrice: string
  salePrice: string | null
  currentStock: number
  reservedStock: number
  active: boolean
  legoProduct: LegoProduct
  listingImages: ListingImage[]
  availableStock: number
  effectivePrice: string
}

export interface CartItem {
  id: number
  cartId: number
  productListingId: number
  quantity: number
  createdAt: string
  updatedAt: string
  productListing: CartProductListing
}

export interface Cart {
  id: number
  userId: number
  createdAt: string
  updatedAt: string
  items: CartItem[]
}
