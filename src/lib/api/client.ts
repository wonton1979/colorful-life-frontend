import axios from 'axios'
import { env } from '../../config/env.ts'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
})
