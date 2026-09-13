import axios from 'axios'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext.tsx'
import { useAuth } from './useAuth.ts'
import { getProfile, login, signup, verifyEmail } from './api.ts'

vi.mock('./api.ts', () => ({ getProfile: vi.fn(), login: vi.fn(), signup: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn() }))

const getProfileMock = vi.mocked(getProfile)
const loginMock = vi.mocked(login)
const signupMock = vi.mocked(signup)
const verifyEmailMock = vi.mocked(verifyEmail)

function Harness() {
  const auth = useAuth()
  return <><output>{auth.state.status}</output><button onClick={() => void auth.login('a@example.com', 'Password1!').catch(() => undefined)}>login</button><button onClick={() => void auth.signup('a@example.com', 'Password1!')}>signup</button><button onClick={auth.logout}>logout</button><button onClick={() => void auth.verifyEmail('token')}>verify</button></>
}

function renderAuth() { return render(<AuthProvider><Harness /></AuthProvider>) }

function rejected(status: number, error?: string) {
  return Object.assign(new Error(error), { response: { status, data: error ? { error } : undefined } })
}

describe('AuthProvider', () => {
  beforeEach(() => { sessionStorage.clear(); getProfileMock.mockReset(); loginMock.mockReset(); signupMock.mockReset(); verifyEmailMock.mockReset(); vi.spyOn(axios, 'isAxiosError').mockReturnValue(true) })

  it('starts unauthenticated without a stored token', () => { renderAuth(); expect(screen.getByText('unauthenticated')).toBeInTheDocument() })

  it('restores verified and unverified sessions, clearing only 401 sessions', async () => {
    sessionStorage.setItem('authToken', 'token')
    getProfileMock.mockResolvedValue({ id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' })
    renderAuth()
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument())
    cleanup()

    getProfileMock.mockRejectedValueOnce(rejected(403, 'Email verification required'))
    sessionStorage.setItem('authToken', 'token')
    renderAuth()
    await waitFor(() => expect(screen.getByText('authenticated-unverified')).toBeInTheDocument())
    expect(sessionStorage.getItem('authToken')).toBe('token')
  })

  it('clears a token for a 401 and retains it as an authenticated error for unexpected failures', async () => {
    sessionStorage.setItem('authToken', 'token')
    getProfileMock.mockRejectedValueOnce(rejected(401))
    renderAuth()
    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument())
    expect(sessionStorage.getItem('authToken')).toBeNull()

    sessionStorage.setItem('authToken', 'token')
    getProfileMock.mockRejectedValueOnce(rejected(500))
    renderAuth()
    await waitFor(() => expect(screen.getByText('authenticated-error')).toBeInTheDocument())
    expect(sessionStorage.getItem('authToken')).toBe('token')
  })

  it('stores signup and login tokens and supports logout and verification refresh', async () => {
    signupMock.mockResolvedValue({ token: 'signup-token' })
    renderAuth()
    await act(async () => { screen.getByRole('button', { name: 'signup' }).click() })
    expect(screen.getByText('authenticated-unverified')).toBeInTheDocument()
    expect(sessionStorage.getItem('authToken')).toBe('signup-token')
    await act(async () => { screen.getByRole('button', { name: 'logout' }).click() })
    expect(screen.getByText('unauthenticated')).toBeInTheDocument()
    verifyEmailMock.mockResolvedValue({ message: 'ok' })
    getProfileMock.mockResolvedValue({ id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' })
    sessionStorage.setItem('authToken', 'token')
    sessionStorage.setItem('authToken', 'token')
    await act(async () => { screen.getByRole('button', { name: 'verify' }).click() })
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument())
  })

  it('resolves verified and unverified login outcomes and does not fabricate failed login state', async () => {
    loginMock.mockResolvedValueOnce({ token: 'login-token' })
    getProfileMock.mockResolvedValueOnce({ id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' })
    renderAuth()
    await act(async () => { screen.getAllByRole('button', { name: 'login' })[0].click() })
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument())

    cleanup()
    sessionStorage.clear()
    loginMock.mockResolvedValueOnce({ token: 'unverified-token' })
    getProfileMock.mockRejectedValueOnce(rejected(403, 'Email verification required'))
    renderAuth()
    await act(async () => { screen.getAllByRole('button', { name: 'login' })[0].click() })
    await waitFor(() => expect(screen.getByText('authenticated-unverified')).toBeInTheDocument())
    expect(sessionStorage.getItem('authToken')).toBe('unverified-token')

    cleanup()
    sessionStorage.clear()
    loginMock.mockRejectedValueOnce(new Error('failed'))
    renderAuth()
    await act(async () => { expect(screen.getByText('unauthenticated')).toBeInTheDocument(); screen.getByRole('button', { name: 'login' }).click() })
  })
})
