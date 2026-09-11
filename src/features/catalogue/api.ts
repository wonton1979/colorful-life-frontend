import type { GetProductsParams, ProductsResponse } from './types.ts'
import { apiClient } from '../../lib/api/client.ts'

export async function getProducts(
  params?: GetProductsParams,
): Promise<ProductsResponse> {
  const response = await apiClient.get<ProductsResponse>('/products', {
    params,
  })

  return response.data
}
