'use client'

import {
  EmailField,
  Form,
  FormSubmit,
  Link,
  PasswordField,
  useAuth,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import { formatAdminURL, getSafeRedirect } from 'payload/shared'
import { Check } from 'lucide-react'
import { BrandIcon } from '../BrandIcon'

type Props = {
  prefillEmail?: string
  prefillPassword?: string
  searchParams: Record<string, string>
  userSlug: string
}

export function AdminLoginClient({
  prefillEmail,
  prefillPassword,
  searchParams,
  userSlug,
}: Props) {
  const {
    config: {
      admin: { routes: { forgot: forgotRoute } = {} },
      routes: { admin: adminRoute, api: apiRoute },
    },
  } = useConfig()
  const { t } = useTranslation()
  const { setUser } = useAuth()

  const initialState: Record<string, any> = {
    email: {
      initialValue: prefillEmail ?? undefined,
      valid: true,
      value: prefillEmail ?? undefined,
    },
    password: {
      initialValue: prefillPassword ?? undefined,
      valid: true,
      value: prefillPassword ?? undefined,
    },
  }

  const handleLogin = (data: any) => {
    setUser(data)
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        {/* ── Form Column ── */}
        <div className="admin-login__form-column">
          <div className="admin-login__form-header">
            <BrandIcon className="admin-login__icon" />
            <h1 className="admin-login__title">Welcome back</h1>
            <p className="admin-login__subtitle">Sign in to your PayMe account</p>
          </div>

          <Form
            action={formatAdminURL({ apiRoute, path: `/${userSlug}/login` })}
            className="admin-login__form"
            disableSuccessStatus
            initialState={initialState}
            method="POST"
            onSuccess={handleLogin}
            redirect={getSafeRedirect({
              fallbackTo: adminRoute,
              redirectTo: searchParams?.redirect,
            })}
            waitForAutocomplete
          >
            <div className="admin-login__fields">
              <EmailField
                field={{
                  name: 'email',
                  admin: { autoComplete: 'email' },
                  label: t('general:email'),
                  required: true,
                }}
                path="email"
              />
              <PasswordField
                field={{
                  name: 'password',
                  label: t('general:password'),
                  required: true,
                }}
                path="password"
              />
            </div>
            <Link
              className="admin-login__forgot"
              href={formatAdminURL({ adminRoute, path: forgotRoute || '/forgot' })}
              prefetch={false}
            >
              {t('authentication:forgotPasswordQuestion')}
            </Link>
            <FormSubmit className="admin-login__submit" size="large">
              {t('authentication:login')}
            </FormSubmit>
          </Form>

          <p className="admin-login__footer">Secure login powered by Payload CMS</p>
        </div>

        {/* ── Brand Panel ── */}
        <div className="admin-login__brand">
          <div className="admin-login__brand-shapes" aria-hidden="true">
            <svg className="admin-login__shape admin-login__shape--1" viewBox="0 0 120 120" fill="none">
              <rect width="120" height="120" rx="24" fill="rgba(255,255,255,0.06)" />
            </svg>
            <svg className="admin-login__shape admin-login__shape--2" viewBox="0 0 80 80" fill="none">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="rgba(255,255,255,0.05)" />
            </svg>
            <svg className="admin-login__shape admin-login__shape--3" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.04)" />
            </svg>
            <svg className="admin-login__shape admin-login__shape--4" viewBox="0 0 100 100" fill="none">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="rgba(255,255,255,0.03)" />
            </svg>
            <svg className="admin-login__shape admin-login__shape--5" viewBox="0 0 140 140" fill="none">
              <rect width="140" height="140" rx="28" transform="rotate(15 70 70)" fill="rgba(255,255,255,0.025)" />
            </svg>
          </div>

          <div className="admin-login__brand-content">
            <h2 className="admin-login__brand-heading">
              Professional invoicing,<br />made simple.
            </h2>
            <p className="admin-login__brand-desc">
              Create and send beautiful invoices, accept payments via Stripe and PayPal, and manage your business — all in one place.
            </p>
            <div className="admin-login__brand-features">
              <div className="admin-login__brand-feature">
                <Check size={16} strokeWidth={2.5} className="admin-login__feature-check" />
                <span>Stripe &amp; PayPal checkout</span>
              </div>
              <div className="admin-login__brand-feature">
                <Check size={16} strokeWidth={2.5} className="admin-login__feature-check" />
                <span>PDF invoice generation</span>
              </div>
              <div className="admin-login__brand-feature">
                <Check size={16} strokeWidth={2.5} className="admin-login__feature-check" />
                <span>Email notifications</span>
              </div>
            </div>
          </div>

          <div className="admin-login__brand-footer">
            &copy; 2026 PayMe. Built with Payload CMS.
          </div>
        </div>
      </div>
    </div>
  )
}
