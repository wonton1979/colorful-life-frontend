import { beforeEach, describe, expect, it } from 'vitest'
import { clearAuthToken, getAuthToken, setAuthToken } from './tokenStorage.ts'

describe('tokenStorage', () => {
  beforeEach(() => sessionStorage.clear())

  it('stores, reads, and clears the auth token in sessionStorage', () => {
    setAuthToken('token')
    expect(getAuthToken()).toBe('token')
    expect(localStorage.getItem('authToken')).toBeNull()
    clearAuthToken()
    expect(getAuthToken()).toBeNull()
  })
})
