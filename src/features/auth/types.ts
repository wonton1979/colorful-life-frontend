export interface AuthUser {
  id: number
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface TokenResponse {
  token: string
}

export interface MessageResponse {
  message: string
}

export type AuthState =
  | { status: 'restoring' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated-unverified'; token: string }
  | { status: 'authenticated-error'; token: string }
  | { status: 'authenticated'; token: string; user: AuthUser }
