import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  })

  it('uses env.apiBaseUrl as its base URL', async () => {
    const { apiClient } = await import('./client.ts')
    expect(apiClient.defaults.baseURL).toBe('https://api.example.com')
  })

})
