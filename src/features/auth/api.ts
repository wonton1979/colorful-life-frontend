import type { MessageResponse, AuthUser, TokenResponse } from './types.ts'
import { apiClient } from '../../lib/api/client.ts'

export interface Credentials {
  email: string
  password: string
}

export async function signup(credentials: Credentials): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/signup', credentials)
  return response.data
}

export async function login(credentials: Credentials): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', credentials)
  return response.data
}

export async function getProfile(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/profile')
  return response.data
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/verify-email', { token })
  return response.data
}

export async function resendVerification(): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/auth/resend-verification')
  return response.data
}
