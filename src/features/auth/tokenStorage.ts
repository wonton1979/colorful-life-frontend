const AUTH_TOKEN_KEY = 'authToken'

export function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}
