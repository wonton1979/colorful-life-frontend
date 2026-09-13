import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './Header.tsx'
import { useAuth } from '../../features/auth/useAuth.ts'
import { CartProvider } from '../../features/cart/CartContext.tsx'

vi.mock('../../features/auth/useAuth.ts', () => ({ useAuth: vi.fn() }))
vi.mock('../../features/cart/api.ts', () => ({ getCart: vi.fn().mockResolvedValue({ items: [] }) }))
const logoutMock = vi.fn()
const useAuthMock = vi.mocked(useAuth)

describe('Header authentication states', () => {
  it.each([
    [{ status: 'unauthenticated' }, 'link', 'Account'],
    [{ status: 'authenticated-unverified', token: 'token' }, 'button', 'Account'],
    [{ status: 'authenticated', token: 'token', user: { id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' } }, 'button', 'Account'],
  ])('renders the appropriate account control', (state, role, name) => {
    useAuthMock.mockReturnValue({ state: state as never, login: vi.fn(), signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: logoutMock })
    render(<CartProvider><MemoryRouter><Header /></MemoryRouter></CartProvider>)
    expect(screen.getByRole(role as 'link' | 'button', { name })).toBeInTheDocument()
  })

  it('logs out authenticated users', () => {
    useAuthMock.mockReturnValue({ state: { status: 'authenticated', token: 'token', user: { id: 1, email: 'a@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' } }, login: vi.fn(), signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: logoutMock })
    render(<CartProvider><MemoryRouter><Header /></MemoryRouter></CartProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Account' }))
    expect(logoutMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(logoutMock).toHaveBeenCalledOnce()
  })

  it('shows verification guidance without forcing unverified users out of the storefront', () => {
    useAuthMock.mockReturnValue({ state: { status: 'authenticated-unverified', token: 'token' }, login: vi.fn(), signup: vi.fn(), refreshProfile: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn(), logout: logoutMock })
    render(<CartProvider><MemoryRouter><Header /></MemoryRouter></CartProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Account' }))
    expect(screen.getByText('Email verification required')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Verify email' })).toHaveAttribute('href', '/verify-email')
    expect(logoutMock).not.toHaveBeenCalled()
  })
})
