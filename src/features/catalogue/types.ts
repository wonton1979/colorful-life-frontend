export type ListingCondition = 'NEW' | 'USED_LIKE_NEW'

export interface ListingImage {
  id: number
  listingId: number
  url: string
  publicId: string
  altText: string | null
  sortOrder: number
  createdAt: string
}

export interface LegoProduct {
  id: number
  setNumber: string
  title: string
  description: string | null
  theme: string
  ageRecommendation: string
  pieceCount: number
  createdAt: string
  updatedAt: string
}

export interface ProductListing {
  id: number
  legoProductId: number
  condition: ListingCondition
  originalPrice: string
  salePrice: string | null
  currentStock: number
  createdAt: string
  updatedAt: string
  legoProduct: LegoProduct
  listingImages: ListingImage[]
}

export interface ProductsPagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ProductsResponse {
  items: ProductListing[]
  pagination: ProductsPagination
}

export interface GetProductsParams {
  q?: string
  theme?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
}
