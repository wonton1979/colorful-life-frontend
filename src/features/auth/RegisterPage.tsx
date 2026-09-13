import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './useAuth.ts'
import { validateEmail, validatePassword } from './validation.ts'

function EyeIcon({ hidden }: { hidden: boolean }) {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{hidden ? <><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A11.3 11.3 0 0 1 12 4c5.2 0 8.7 4 9.8 6-.4.8-1.2 2-2.4 3.1M6.1 6.1C4.3 7.3 3.2 8.9 2.2 10c1.1 2 4.6 6 9.8 6 1 0 1.9-.2 2.7-.5" /></> : <><path d="M2.2 10c1.1-2 4.6-6 9.8-6s8.7 4 9.8 6c-1.1 2-4.6 6-9.8 6s-8.7-4-9.8-6Z" /><circle cx="12" cy="10" r="2.5" /></>}</svg>
}

export function RegisterPage() {
  const { state: authState, signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const emailError = validateEmail(email.trim())
    const passwordError = validatePassword(password)
    if (emailError || passwordError || password !== confirmPassword) {
      setError(emailError ?? passwordError ?? 'Passwords do not match.')
      return
    }
    setPending(true)
    try {
      await signup(email.trim(), password)
      navigate('/verify-email')
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) && requestError.response?.status === 409 ? 'Email already in use.' : 'Unable to create account.')
    } finally {
      setPending(false)
    }
  }

  if (authState.status === 'authenticated' || authState.status === 'authenticated-unverified') return <Navigate to="/" replace />
  if (authState.status === 'restoring') return <div className="mx-auto max-w-md px-4 py-10 sm:px-6"><p>Restoring your session...</p></div>

  return <div className="mx-auto max-w-md px-4 py-10 sm:px-6"><h1 className="text-3xl font-semibold">Create your account</h1><form className="mt-6 space-y-4" onSubmit={handleSubmit}>
    <div><label className="block text-sm font-medium" htmlFor="register-email">Email</label><input className="mt-1 w-full rounded border p-2" id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
    <div><label className="block text-sm font-medium" htmlFor="register-password">Password</label><div className="relative mt-1"><input className="w-full rounded border p-2 pr-10" id="register-password" type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="absolute inset-y-0 right-2 cursor-pointer rounded-sm px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible((visible) => !visible)}><EyeIcon hidden={!passwordVisible} /></button></div><p className="mt-1 text-sm text-slate-600">Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.</p></div>
    <div><label className="block text-sm font-medium" htmlFor="register-confirm-password">Confirm password</label><div className="relative mt-1"><input className="w-full rounded border p-2 pr-10" id="register-confirm-password" type={confirmPasswordVisible ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><button className="absolute inset-y-0 right-2 cursor-pointer rounded-sm px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" aria-label={confirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setConfirmPasswordVisible((visible) => !visible)}><EyeIcon hidden={!confirmPasswordVisible} /></button></div></div>
    {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    <button className="cursor-pointer rounded bg-slate-800 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={pending}>{pending ? 'Creating account...' : 'Create account'}</button>
  </form><p className="mt-6 text-sm text-slate-600">Already have an account? <Link className="cursor-pointer font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to="/login">Sign in</Link></p></div>
}
