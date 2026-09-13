import axios from 'axios'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage.tsx'
import { useAuth } from './useAuth.ts'
import type { AuthState } from './types.ts'

vi.mock('./useAuth.ts', () => ({ useAuth: vi.fn() }))
const loginMock = vi.fn()
const useAuthMock = vi.mocked(useAuth)

function renderPage(state: AuthState = { status: 'unauthenticated' }) {
  useAuthMock.mockReturnValue({ state, login: loginMock, signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: vi.fn() })
  return render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage />} /><Route path="/" element={<p>Home</p>} /><Route path="/verify-email" element={<p>Verify</p>} /></Routes></MemoryRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => { loginMock.mockReset(); vi.spyOn(axios, 'isAxiosError').mockReturnValue(true) })

  it('submits trimmed credentials and navigates verified users home', async () => {
    loginMock.mockResolvedValue({ status: 'authenticated', token: 'token', user: { id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' } })
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' a@example.com ' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(loginMock).toHaveBeenCalledWith('a@example.com', 'Password1!')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('navigates unverified users home without forcing verification', async () => {
    loginMock.mockResolvedValue({ status: 'authenticated-unverified', token: 'token' })
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows invalid credentials and remains on login', async () => {
    loginMock.mockRejectedValueOnce(Object.assign(new Error(), { response: { status: 401 } }))
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('exposes registration navigation', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/register')
  })

  it('toggles password visibility without submitting', () => {
    renderPage()
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(loginMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it.each([
    { status: 'authenticated', token: 'token', user: { id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' } },
    { status: 'authenticated-unverified', token: 'token' },
  ] as AuthState[])('redirects signed-in users away from the login form', (state) => {
    renderPage(state)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument()
  })
})
