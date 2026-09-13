export function validatePassword(password: string) {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.'
  if (!/\d/.test(password)) return 'Password must include a digit.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character.'
  return null
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Enter a valid email address.'
}
