import axios from 'axios'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VerifyEmailPage } from './VerifyEmailPage.tsx'
import { useAuth } from './useAuth.ts'
import type { AuthState } from './types.ts'

vi.mock('./useAuth.ts', () => ({ useAuth: vi.fn() }))
const verifyMock = vi.fn()
const resendMock = vi.fn()
const useAuthMock = vi.mocked(useAuth)

function renderPage(path: string, state: AuthState = { status: 'unauthenticated' }) {
  useAuthMock.mockReturnValue({ state, login: vi.fn(), signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: resendMock, verifyEmail: verifyMock, logout: vi.fn() })
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/verify-email" element={<VerifyEmailPage />} /></Routes></MemoryRouter>)
}

describe('VerifyEmailPage', () => {
  beforeEach(() => { verifyMock.mockReset(); resendMock.mockReset(); vi.spyOn(axios, 'isAxiosError').mockReturnValue(true) })

  it('handles a missing token and exposes resend for unverified sessions', async () => {
    renderPage('/verify-email', { status: 'authenticated-unverified', token: 'auth-token' })
    expect(screen.getByText('Verification link is missing a token.')).toBeInTheDocument()
    resendMock.mockResolvedValueOnce({ message: 'sent' })
    fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }))
    expect(resendMock).toHaveBeenCalled()
    expect(await screen.findByRole('status')).toHaveTextContent('Verification email sent.')
  })

  it('verifies a query token and reports invalid or generic failures', async () => {
    let resolve: (() => void) | undefined
    verifyMock.mockReturnValueOnce(new Promise<void>((done) => { resolve = done }))
    renderPage('/verify-email?token=secret')
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
    resolve?.()
    expect(await screen.findByText('Email verified successfully.')).toBeInTheDocument()

    verifyMock.mockRejectedValueOnce(Object.assign(new Error(), { response: { status: 400 } }))
    renderPage('/verify-email?token=expired')
    expect(await screen.findByText('This verification link is invalid or expired.')).toBeInTheDocument()
  })

  it('reports generic verification and resend failures', async () => {
    verifyMock.mockRejectedValueOnce(new Error('network'))
    renderPage('/verify-email?token=token')
    expect(await screen.findByText('Unable to verify your email.')).toBeInTheDocument()
    resendMock.mockRejectedValueOnce(new Error('network'))
    renderPage('/verify-email', { status: 'authenticated-unverified', token: 'auth-token' })
    fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }))
    await waitFor(() => expect(screen.getByText('Unable to resend verification email.')).toHaveAttribute('role', 'alert'))
  })
})
