'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import './styles.css'

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setServerError(null)

    const res = await api.auth.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    if (!res.ok) {
      setServerError(res.message)
      return
    }

    router.push('/login?registered=true')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      <FieldGroup>
        <AuthHeading
          title="Create your account"
          description="Start invoicing in under a minute."
        />

        {serverError && (
          <AuthAlert variant="error">{serverError}</AuthAlert>
        )}

        <div className="register-form__name-row">
          <Field data-invalid={!!errors.firstName || undefined}>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              placeholder="John"
              aria-invalid={!!errors.firstName}
              disabled={isSubmitting}
              {...register('firstName')}
            />
            {errors.firstName && (
              <FieldError>{errors.firstName.message}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!errors.lastName || undefined}>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              placeholder="Doe"
              aria-invalid={!!errors.lastName}
              disabled={isSubmitting}
              {...register('lastName')}
            />
            {errors.lastName && (
              <FieldError>{errors.lastName.message}</FieldError>
            )}
          </Field>
        </div>

        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="register-form__password-wrapper">
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
              className="register-form__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="register-form__toggle-icon" />
              ) : (
                <Eye className="register-form__toggle-icon" />
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
            Confirm password
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
            Create Account
          </Button>
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
          <FieldDescription className="register-form__footer">
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
