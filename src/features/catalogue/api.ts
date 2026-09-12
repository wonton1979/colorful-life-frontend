import type { GetProductsParams, ProductListing, ProductsResponse } from './types.ts'
import { apiClient } from '../../lib/api/client.ts'

export async function getProducts(
  params?: GetProductsParams,
): Promise<ProductsResponse> {
  const response = await apiClient.get<ProductsResponse>('/products', {
    params,
  })

  return response.data
}

export async function getProductById(id: number): Promise<ProductListing> {
  const response = await apiClient.get<ProductListing>(`/products/${id}`)

  return response.data
}
