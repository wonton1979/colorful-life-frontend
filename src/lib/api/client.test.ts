import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { clearAuthToken, setAuthToken } from '../../features/auth/tokenStorage.ts'

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  })

  it('uses env.apiBaseUrl as its base URL', async () => {
    const { apiClient } = await import('./client.ts')
    expect(apiClient.defaults.baseURL).toBe('https://api.example.com')
  })

  it('adds a bearer token to authenticated requests', async () => {
    const { apiClient } = await import('./client.ts')
    setAuthToken('stored-token')
    const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }> }).handlers.at(-1)?.fulfilled
    const config = handler?.({ headers: new AxiosHeaders() } as InternalAxiosRequestConfig)
    expect(config?.headers.get('Authorization')).toBe('Bearer stored-token')
  })

  it('leaves public requests without an authorization header when no token exists', async () => {
    const { apiClient } = await import('./client.ts')
    clearAuthToken()
    const handler = (apiClient.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }> }).handlers.at(-1)?.fulfilled
    const config = handler?.({ headers: new AxiosHeaders() } as InternalAxiosRequestConfig)
    expect(config?.headers.get('Authorization')).toBeUndefined()
  })

})
