'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { api } from '@/lib/api'
import { AuthHeading } from '@/components/auth/AuthHeading'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import './styles.css'

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    await api.auth.forgotPassword(data.email)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="forgot-password-form__submitted">
        <div className="forgot-password-form__icon">
          <Mail className="size-6 text-primary" />
        </div>
        <AuthHeading
          title="Check your inbox"
          description="If an account exists with that email, we've sent password reset instructions."
        />
        <Link href="/login" className="forgot-password-form__back-link">
          &larr; Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="forgot-password-form">
      <AuthHeading
        title="Forgot password"
        description="Enter the email on your account and we'll send a reset link."
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && (
              <FieldError>{errors.email.message}</FieldError>
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
              Send Reset Link
            </Button>
          </Field>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            &larr; Back to login
          </Link>
        </FieldGroup>
      </form>
    </div>
  )
}
