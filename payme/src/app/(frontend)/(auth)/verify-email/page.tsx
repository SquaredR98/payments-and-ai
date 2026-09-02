'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

import { api } from '@/lib/api'
import { AuthLayout } from '@/components/layouts/auth-layout'

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
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Email Verification</h1>
          {state === 'loading' && (
            <p className="text-sm text-balance text-muted-foreground">
              Verifying your email address...
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          {state === 'loading' && (
            <Loader2 className="size-8 animate-spin text-primary" />
          )}

          {state === 'success' && (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">Email verified</p>
                <p className="text-xs text-muted-foreground">
                  Your email has been verified successfully. You can now sign
                  in.
                </p>
              </div>
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
              <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="size-6 text-destructive" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">Verification failed</p>
                <p className="text-xs text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
