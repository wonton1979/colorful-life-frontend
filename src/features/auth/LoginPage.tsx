import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './useAuth.ts'

function EyeIcon({ hidden }: { hidden: boolean }) {
  return <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{hidden ? <><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A11.3 11.3 0 0 1 12 4c5.2 0 8.7 4 9.8 6-.4.8-1.2 2-2.4 3.1M6.1 6.1C4.3 7.3 3.2 8.9 2.2 10c1.1 2 4.6 6 9.8 6 1 0 1.9-.2 2.7-.5" /></> : <><path d="M2.2 10c1.1-2 4.6-6 9.8-6s8.7 4 9.8 6c-1.1 2-4.6 6-9.8 6s-8.7-4-9.8-6Z" /><circle cx="12" cy="10" r="2.5" /></>}</svg>
}

export function LoginPage() {
  const { state: authState, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login(email.trim(), password)
    } catch (requestError: unknown) {
      setError(axios.isAxiosError(requestError) && requestError.response?.status === 401 ? 'Invalid credentials.' : 'Unable to sign in.')
    } finally {
      setPending(false)
    }
  }

  if (authState.status === 'authenticated' || authState.status === 'authenticated-unverified') return <Navigate to="/" replace />
  if (authState.status === 'restoring') return <div className="mx-auto max-w-md px-4 py-10 sm:px-6"><p>Restoring your session...</p></div>

  return <div className="mx-auto max-w-md px-4 py-10 sm:px-6"><h1 className="text-3xl font-semibold">Sign in</h1><form className="mt-6 space-y-4" onSubmit={handleSubmit}>
    <div><label className="block text-sm font-medium" htmlFor="login-email">Email</label><input className="mt-1 w-full rounded border p-2" id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
    <div><label className="block text-sm font-medium" htmlFor="login-password">Password</label><div className="relative mt-1"><input className="w-full rounded border p-2 pr-10" id="login-password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="absolute inset-y-0 right-2 cursor-pointer rounded-sm px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} onClick={() => setPasswordVisible((visible) => !visible)}><EyeIcon hidden={!passwordVisible} /></button></div></div>
    {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    <button className="cursor-pointer rounded bg-slate-800 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={pending}>{pending ? 'Signing in...' : 'Sign in'}</button>
  </form><p className="mt-6 text-sm text-slate-600">Don't have an account? <Link className="cursor-pointer font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" to="/register">Create an account</Link></p></div>
}
