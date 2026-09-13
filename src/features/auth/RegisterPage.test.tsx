import axios from 'axios'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage.tsx'
import { useAuth } from './useAuth.ts'

vi.mock('./useAuth.ts', () => ({ useAuth: vi.fn() }))
const signupMock = vi.fn()
const useAuthMock = vi.mocked(useAuth)

function renderPage() {
  useAuthMock.mockReturnValue({ state: { status: 'unauthenticated' }, login: vi.fn(), signup: signupMock, refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: vi.fn() })
  return render(<MemoryRouter initialEntries={['/register']}><Routes><Route path="/register" element={<RegisterPage />} /><Route path="/verify-email" element={<p>Verification guidance</p>} /></Routes></MemoryRouter>)
}

describe('RegisterPage', () => {
  beforeEach(() => { signupMock.mockReset() })

  it('validates fields and submits trimmed credentials', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' bad@example.com ' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() => expect(signupMock).toHaveBeenCalledWith('bad@example.com', 'Password1!'))
  })

  it.each([
    ['invalid email', 'bad', 'Password1!', 'Password1!'],
    ['weak password', 'a@example.com', 'weak', 'weak'],
    ['mismatched password', 'a@example.com', 'Password1!', 'Password2!'],
  ])('%s blocks signup', async (_name, email, password, confirmation) => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: confirmation } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(signupMock).not.toHaveBeenCalled()
  })

  it('shows duplicate email feedback and navigates after success', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password1!' } })
    signupMock.mockRejectedValueOnce(Object.assign(new Error(), { response: { status: 409 } }))
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already in use.')
    signupMock.mockResolvedValueOnce(undefined)
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Verification guidance')).toBeInTheDocument()
  })

  it('prevents duplicate pending submissions', async () => {
    renderPage()
    signupMock.mockReturnValue(new Promise(() => undefined))
    for (const [label, value] of [['Email', 'a@example.com'], ['Password', 'Password1!'], ['Confirm password', 'Password1!']] as const) fireEvent.change(screen.getByLabelText(label), { target: { value } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    fireEvent.click(screen.getByRole('button', { name: 'Creating account...' }))
    expect(signupMock).toHaveBeenCalledTimes(1)
  })

  it('exposes login navigation', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })

  it('shows password requirements and independently toggles both password fields', () => {
    renderPage()
    expect(screen.getByText('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.')).toBeInTheDocument()
    const password = screen.getByLabelText('Password')
    const confirmation = screen.getByLabelText('Confirm password')
    expect(password).toHaveAttribute('type', 'password')
    expect(confirmation).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(confirmation).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Show confirm password' }))
    expect(confirmation).toHaveAttribute('type', 'text')
    expect(signupMock).not.toHaveBeenCalled()
  })
})
