'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { api } from '@/lib/api'
import { AuthLayout } from '@/components/layouts/auth-layout'
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

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({})

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const result = registerSchema.safeParse(data)
    if (!result.success) {
      const errors: Partial<Record<keyof RegisterInput, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterInput
        if (!errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    const res = await api.auth.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    if (!res.ok) {
      setServerError(res.message)
      setIsLoading(false)
      return
    }

    router.push('/login?registered=true')
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your information below to get started
            </p>
          </div>

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!fieldErrors.firstName || undefined}>
              <FieldLabel htmlFor="firstName">First name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                aria-invalid={!!fieldErrors.firstName}
                disabled={isLoading}
              />
              {fieldErrors.firstName && (
                <FieldError>{fieldErrors.firstName}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!fieldErrors.lastName || undefined}>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                aria-invalid={!!fieldErrors.lastName}
                disabled={isLoading}
              />
              {fieldErrors.lastName && (
                <FieldError>{fieldErrors.lastName}</FieldError>
              )}
            </Field>
          </div>

          <Field data-invalid={!!fieldErrors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <FieldError>{fieldErrors.email}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!fieldErrors.password || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
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
              Confirm password
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
              Create Account
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <FieldDescription className="text-center">
              Already have an account?{' '}
              <Link href="/login">Sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
