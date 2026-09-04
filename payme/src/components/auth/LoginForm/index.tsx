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
  FieldSeparator,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import './styles.css'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)

    const res = await api.auth.login(data.email, data.password)

    if (!res.ok) {
      if (res.status === 401) {
        setServerError('Invalid email or password. Please try again.')
      } else if (res.status === 403) {
        setServerError(
          'Your account has been locked due to too many failed attempts. Please try again later.',
        )
      } else {
        setServerError(res.message)
      }
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <FieldGroup>
        <AuthHeading
          title="Sign in"
          description="Welcome back. Enter your details to continue."
        />

        {justRegistered && (
          <AuthAlert variant="success">
            Account created successfully. Please sign in.
          </AuthAlert>
        )}

        {serverError && (
          <AuthAlert variant="error">{serverError}</AuthAlert>
        )}

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

        <Field data-invalid={!!errors.password || undefined}>
          <div className="login-form__password-header">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/forgot-password" className="login-form__forgot-link">
              Forgot your password?
            </Link>
          </div>
          <div className="login-form__password-wrapper">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              className="pr-9"
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              className="login-form__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="login-form__toggle-icon" />
              ) : (
                <Eye className="login-form__toggle-icon" />
              )}
            </button>
          </div>
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
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
            Sign In
          </Button>
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
          <FieldDescription className="login-form__footer">
            Don&apos;t have an account?{' '}
            <Link href="/register">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
