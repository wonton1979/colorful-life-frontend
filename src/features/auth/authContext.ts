import { createContext } from 'react'
import type { AuthState } from './types.ts'

export interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<AuthState>
  signup: (email: string, password: string) => Promise<void>
  refreshProfile: () => Promise<void>
  resendVerification: () => Promise<string>
  verifyEmail: (token: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
