import axios from 'axios'
import { env } from '../../config/env.ts'
import { getAuthToken } from '../../features/auth/tokenStorage.ts'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
