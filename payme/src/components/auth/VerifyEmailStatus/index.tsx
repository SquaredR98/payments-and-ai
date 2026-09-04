'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Loader2 } from 'lucide-react'

import { api } from '@/lib/api'
import './styles.css'

type VerifyState = 'loading' | 'success' | 'error'

export function VerifyEmailStatus() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'error')
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : 'No verification token provided.',
  )

  useEffect(() => {
    if (!token) return

    async function verify() {
      const res = await api.auth.verifyEmail(token!)

      if (!res.ok) {
        setErrorMessage(
          res.message || 'This verification link is invalid or has expired.',
        )
        setState('error')
        return
      }

      setState('success')
    }

    verify()
  }, [token])

  return (
    <div className="verify-email">
      {state === 'loading' && (
        <>
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="verify-email__description">
            Verifying your email address...
          </p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="verify-email__icon--success">
            <Check className="size-6 text-success" strokeWidth={2.5} />
          </div>
          <h1 className="verify-email__title">Email verified</h1>
          <p className="verify-email__description">
            Your email has been verified successfully. You can now sign in.
          </p>
          <Link href="/login" className="verify-email__link">
            Continue to sign in
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="verify-email__icon--error">
            <X className="size-5.5 text-destructive" strokeWidth={2.5} />
          </div>
          <h1 className="verify-email__title">Verification failed</h1>
          <p className="verify-email__description">
            {errorMessage || 'This verification link is invalid or has expired. Request a new one from the sign-in screen.'}
          </p>
          <Link href="/login" className="verify-email__back-link">
            Back to login
          </Link>
        </>
      )}
    </div>
  )
}
