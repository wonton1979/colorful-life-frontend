import type { AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client.ts'
import { getProducts } from './api.ts'
import type { ProductsResponse } from './types.ts'

vi.mock('../../lib/api/client.ts', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const getMock = vi.mocked(apiClient.get)

const productsResponse: ProductsResponse = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
}

describe('getProducts', () => {
  beforeEach(() => {
    getMock.mockReset()
    getMock.mockResolvedValue({ data: productsResponse } as AxiosResponse<ProductsResponse>)
  })

  it('calls the products endpoint', async () => {
    await getProducts()

    expect(getMock).toHaveBeenCalledWith('/products', { params: undefined })
  })

  it('passes supplied query values through as Axios params', async () => {
    const params = {
      q: 'space',
      theme: 'City',
      minPrice: 10,
      maxPrice: 100,
      page: 2,
      pageSize: 20,
    }

    await getProducts(params)

    expect(getMock).toHaveBeenCalledWith('/products', { params })
  })

  it('returns the response data', async () => {
    await expect(getProducts()).resolves.toBe(productsResponse)
  })
})
