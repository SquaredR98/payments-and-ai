'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'

import { api } from '@/lib/api'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError(null)

    const formData = new FormData(e.currentTarget)
    const data = { email: formData.get('email') as string }

    const result = forgotPasswordSchema.safeParse(data)
    if (!result.success) {
      setEmailError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    await api.auth.forgotPassword(data.email)
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {isSubmitted
              ? 'Check your inbox for reset instructions.'
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-5 text-primary" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              If an account exists with that email, we&apos;ve sent password
              reset instructions.
            </p>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!emailError || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  disabled={isLoading}
                />
                {emailError && <FieldError>{emailError}</FieldError>}
              </Field>

              <Field>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="size-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </Field>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                Back to login
              </Link>
            </FieldGroup>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
