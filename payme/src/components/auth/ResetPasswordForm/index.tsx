'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { api } from '@/lib/api'
import { AuthHeading } from '@/components/auth/AuthHeading'
import { AuthAlert } from '@/components/auth/AuthAlert'
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
import './styles.css'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? '' },
  })

  if (!token) {
    return (
      <>
        <AuthAlert variant="error">
          This password reset link is invalid or has expired.
        </AuthAlert>
        <AuthHeading
          title="Invalid reset link"
          description="This password reset link is invalid or has expired."
        />
        <div className="reset-password-form__invalid">
          <Link href="/forgot-password" className="reset-password-form__link">
            Request a new reset link
          </Link>
          <Link href="/login" className="reset-password-form__back-link">
            &larr; Back to login
          </Link>
        </div>
      </>
    )
  }

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null)

    const res = await api.auth.resetPassword(data.token, data.password)

    if (!res.ok) {
      setServerError(
        res.message || 'This reset link has expired or is invalid. Please request a new one.',
      )
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
      <FieldGroup>
        <AuthHeading
          title="Set a new password"
          description="Choose something you haven't used before."
        />

        {serverError && (
          <AuthAlert variant="error">{serverError}</AuthAlert>
        )}

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <div className="reset-password-form__password-wrapper">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              className="pr-9"
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              className="reset-password-form__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="reset-password-form__toggle-icon" />
              ) : (
                <Eye className="reset-password-form__toggle-icon" />
              )}
            </button>
          </div>
          <FieldDescription>
            Must contain uppercase, lowercase, and a number.
          </FieldDescription>
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel htmlFor="confirmPassword">
            Confirm new password
          </FieldLabel>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </Field>

        <Field>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Reset Password
          </Button>
        </Field>

        <Link href="/login" className="reset-password-form__back-link">
          &larr; Back to login
        </Link>
      </FieldGroup>
    </form>
  )
}
