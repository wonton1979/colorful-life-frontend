import axios from 'axios'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

type VerificationState = 'missing' | 'verifying' | 'success' | 'invalid' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { state: authState, verifyEmail, resendVerification } = useAuth()
  const [state, setState] = useState<VerificationState>(() => searchParams.get('token') ? 'verifying' : 'missing')
  const [resendState, setResendState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return
    let cancelled = false
    void verifyEmail(token).then(() => {
      if (!cancelled) setState('success')
    }).catch((error: unknown) => {
      if (cancelled) return
      setState(axios.isAxiosError(error) && error.response?.status === 400 ? 'invalid' : 'error')
    })
    return () => { cancelled = true }
  }, [searchParams, verifyEmail])

  const message = { missing: 'Verification link is missing a token.', verifying: 'Verifying your email...', success: 'Email verified successfully.', invalid: 'This verification link is invalid or expired.', error: 'Unable to verify your email.' }[state]
  async function handleResend() {
    setResendState('pending')
    try { await resendVerification(); setResendState('success') } catch { setResendState('error') }
  }

  const hasError = state === 'invalid' || state === 'error'
  return <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><h1 className="text-3xl font-semibold">Email verification</h1><p className={hasError ? 'mt-4 text-red-700' : 'mt-4'} role={hasError ? 'alert' : undefined}>{message}</p>{state === 'missing' && authState.status === 'authenticated-unverified' && <div className="mt-6 space-y-3"><p>Check your email to verify your account.</p><button className="cursor-pointer rounded bg-slate-800 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={resendState === 'pending'} onClick={handleResend}>{resendState === 'pending' ? 'Sending...' : 'Resend verification email'}</button>{resendState === 'success' && <p role="status">Verification email sent.</p>}{resendState === 'error' && <p className="mt-2 text-sm text-red-700" role="alert">Unable to resend verification email.</p>}</div>}</div>
}
