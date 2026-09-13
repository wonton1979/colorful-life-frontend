import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { getProfile, login } from './features/auth/api.ts'

vi.mock('./features/auth/api.ts', () => ({ getProfile: vi.fn(), login: vi.fn(), signup: vi.fn(), resendVerification: vi.fn(), verifyEmail: vi.fn() }))

const loginMock = vi.mocked(login)
const getProfileMock = vi.mocked(getProfile)

describe('application authentication integration', () => {
  it('shares login state with Header after navigation without a refresh', async () => {
    loginMock.mockResolvedValue({ token: 'token' })
    getProfileMock.mockResolvedValue({ id: 1, email: 'customer@example.com', role: 'CUSTOMER', createdAt: '', updatedAt: '' })
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'customer@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Account' }))
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    await waitFor(() => expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/login'))
  })
})
