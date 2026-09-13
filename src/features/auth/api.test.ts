import type { AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client.ts'
import { getProfile, login, resendVerification, signup, verifyEmail } from './api.ts'

vi.mock('../../lib/api/client.ts', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }))

const getMock = vi.mocked(apiClient.get)
const postMock = vi.mocked(apiClient.post)

describe('auth api', () => {
  beforeEach(() => { getMock.mockReset(); postMock.mockReset() })

  it('calls signup with credentials', async () => {
    postMock.mockResolvedValue({ data: { token: 'token' } } as AxiosResponse)
    await signup({ email: 'a@example.com', password: 'Password1!' })
    expect(postMock).toHaveBeenCalledWith('/auth/signup', { email: 'a@example.com', password: 'Password1!' })
  })

  it('calls login with credentials', async () => {
    postMock.mockResolvedValue({ data: { token: 'token' } } as AxiosResponse)
    await login({ email: 'a@example.com', password: 'Password1!' })
    expect(postMock).toHaveBeenCalledWith('/auth/login', { email: 'a@example.com', password: 'Password1!' })
  })

  it('calls profile, verification, and resend endpoints', async () => {
    getMock.mockResolvedValue({ data: {} } as AxiosResponse)
    postMock.mockResolvedValue({ data: { message: 'ok' } } as AxiosResponse)
    await getProfile()
    await verifyEmail('verification-token')
    await resendVerification()
    expect(getMock).toHaveBeenCalledWith('/profile')
    expect(postMock).toHaveBeenNthCalledWith(1, '/auth/verify-email', { token: 'verification-token' })
    expect(postMock).toHaveBeenNthCalledWith(2, '/auth/resend-verification')
  })
})
