import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContext.ts'
import type { AuthContextValue } from './authContext.ts'
import { getProfile, login, resendVerification, signup, verifyEmail } from './api.ts'
import { clearAuthToken, getAuthToken, setAuthToken } from './tokenStorage.ts'
import type { AuthState, AuthUser } from './types.ts'

function isVerificationRequired(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 403 && error.response.data?.error === 'Email verification required'
}

async function resolveToken(token: string, onState: (state: AuthState) => void) {
  try {
    const user: AuthUser = await getProfile()
    onState({ status: 'authenticated', token, user })
  } catch (error: unknown) {
    if (isVerificationRequired(error)) {
      onState({ status: 'authenticated-unverified', token })
      return
    }
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthToken()
      onState({ status: 'unauthenticated' })
      return
    }
    onState({ status: 'authenticated-error', token })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => getAuthToken() ? { status: 'restoring' } : { status: 'unauthenticated' })

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken()
    if (token) await resolveToken(token, setState)
  }, [])

  const verifyCurrentEmail = useCallback(async (token: string) => {
    await verifyEmail(token)
    await refreshProfile()
  }, [refreshProfile])

  const loginUser = useCallback(async (email: string, password: string): Promise<AuthState> => {
    const response = await login({ email, password })
    setAuthToken(response.token)
    setState({ status: 'restoring' })
    return await new Promise<AuthState>((resolve) => {
      void resolveToken(response.token, (nextState) => {
        setState(nextState)
        resolve(nextState)
      })
    })
  }, [])

  const signupUser = useCallback(async (email: string, password: string) => {
    const response = await signup({ email, password })
    setAuthToken(response.token)
    setState({ status: 'authenticated-unverified', token: response.token })
  }, [])

  const resend = useCallback(async () => (await resendVerification()).message, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setState({ status: 'unauthenticated' })
  }, [])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    void resolveToken(token, setState)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    state,
    login: loginUser,
    signup: signupUser,
    refreshProfile,
    resendVerification: resend,
    verifyEmail: verifyCurrentEmail,
    logout,
  }), [loginUser, logout, refreshProfile, resend, signupUser, state, verifyCurrentEmail])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
