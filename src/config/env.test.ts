import { describe, expect, it, vi } from 'vitest'

describe('environment configuration', () => {
  it('fails clearly when the API base URL is missing', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', '')

    await expect(import('./env.ts')).rejects.toThrow(
      'Missing required environment variable: VITE_API_BASE_URL',
    )
  })

  it('exports the trimmed API base URL', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', ' https://api.example.com ')

    const { env } = await import('./env.ts')

    expect(env.apiBaseUrl).toBe('https://api.example.com')
  })
})
