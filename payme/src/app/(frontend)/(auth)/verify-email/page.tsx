'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, X, Loader2 } from 'lucide-react'

import { api } from '@/lib/api'
import { AuthLayout } from '@/components/layouts/AuthLayout'

type VerifyState = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
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
    <AuthLayout variant="verify-email">
      <div className="flex flex-col items-center gap-3 text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-[15px] text-muted-foreground">
              Verifying your email address...
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="flex size-13 items-center justify-center rounded-full bg-success/10">
              <Check className="size-6 text-success" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Email verified
            </h1>
            <p className="text-sm text-muted-foreground">
              Your email has been verified successfully. You can now sign in.
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Continue to sign in
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="flex size-13 items-center justify-center rounded-full bg-destructive/10">
              <X className="size-5.5 text-destructive" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Verification failed
            </h1>
            <p className="text-sm text-muted-foreground">
              {errorMessage || 'This verification link is invalid or has expired. Request a new one from the sign-in screen.'}
            </p>
            <Link
              href="/login"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
