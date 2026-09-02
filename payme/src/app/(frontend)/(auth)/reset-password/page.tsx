'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

import { api } from '@/lib/api'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'password' | 'confirmPassword', string>>
  >({})

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Invalid reset link</h1>
            <p className="text-sm text-balance text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Request a new reset link
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      token: token!,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const result = resetPasswordSchema.safeParse(data)
    if (!result.success) {
      const errors: Partial<Record<'password' | 'confirmPassword', string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ResetPasswordInput
        if (field === 'password' || field === 'confirmPassword') {
          if (!errors[field]) {
            errors[field] = issue.message
          }
        }
      }
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    const res = await api.auth.resetPassword(data.token, data.password)

    if (!res.ok) {
      setServerError(
        res.message || 'This reset link has expired or is invalid. Please request a new one.',
      )
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter a new password for your account
            </p>
          </div>

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Field data-invalid={!!fieldErrors.password || undefined}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                disabled={isLoading}
                className="pr-9"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
            <FieldDescription>
              Must contain uppercase, lowercase, and a number.
            </FieldDescription>
            {fieldErrors.password && (
              <FieldError>{fieldErrors.password}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!fieldErrors.confirmPassword || undefined}>
            <FieldLabel htmlFor="confirmPassword">
              Confirm new password
            </FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirmPassword}
              disabled={isLoading}
            />
            {fieldErrors.confirmPassword && (
              <FieldError>{fieldErrors.confirmPassword}</FieldError>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Reset Password
            </Button>
          </Field>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to login
          </Link>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
