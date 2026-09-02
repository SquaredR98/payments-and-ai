'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

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
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const result = loginSchema.safeParse(data)
    if (!result.success) {
      const errors: Partial<Record<keyof LoginInput, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginInput
        if (!errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

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
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {justRegistered && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-primary">
              <CheckCircle2 className="size-4 shrink-0" />
              Account created successfully. Please sign in.
            </div>
          )}

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

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
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
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
            {fieldErrors.password && (
              <FieldError>{fieldErrors.password}</FieldError>
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
              Sign In
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <FieldDescription className="text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register">Sign up</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  )
}
