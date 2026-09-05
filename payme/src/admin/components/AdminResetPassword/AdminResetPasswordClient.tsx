'use client'

import {
  ConfirmPasswordField,
  Form,
  FormSubmit,
  HiddenField,
  Link,
  PasswordField,
  useAuth,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'

type Props = {
  token: string
  userSlug: string
}

export function AdminResetPasswordClient({ token, userSlug }: Props) {
  const {
    config: {
      admin: { routes: { login: loginRoute } = {} },
      routes: { api: apiRoute, admin: adminRoute },
    },
  } = useConfig()
  const { t } = useTranslation()
  const router = useRouter()
  const { fetchFullUser } = useAuth()

  const onSuccess = async () => {
    const user = await fetchFullUser()
    if (user) {
      router.push(adminRoute)
    } else {
      router.push(formatAdminURL({ adminRoute, path: loginRoute || '/login' }))
    }
  }

  const initialState = {
    'confirm-password': { initialValue: '', valid: false, value: '' },
    password: { initialValue: '', valid: false, value: '' },
    token: { initialValue: token, valid: true, value: token },
  }

  return (
    <div className="admin-reset">
      <div className="admin-reset__card">
        <div className="admin-reset__header">
          <svg viewBox="0 0 34 34" fill="none" className="admin-reset__icon">
            <rect width="34" height="34" rx="8" fill="var(--theme-success-500)" />
            <path d="M10 17 L17 10 L24 17 L17 24 Z" fill="white" />
          </svg>
          <h1 className="admin-reset__title">{t('authentication:resetPassword')}</h1>
          <p className="admin-reset__desc">Enter your new password below.</p>
        </div>

        <Form
          action={formatAdminURL({ apiRoute, path: `/${userSlug}/reset-password` })}
          className="admin-reset__form"
          initialState={initialState}
          method="POST"
          onSuccess={onSuccess}
        >
          <div className="admin-reset__fields">
            <PasswordField
              field={{
                name: 'password',
                label: t('authentication:newPassword'),
                required: true,
              }}
              path="password"
              schemaPath={`${userSlug}.password`}
            />
            <ConfirmPasswordField />
            <HiddenField path="token" schemaPath={`${userSlug}.token`} value={token} />
          </div>
          <FormSubmit size="large">{t('authentication:resetPassword')}</FormSubmit>
        </Form>

        <Link
          className="admin-reset__back-link"
          href={formatAdminURL({ adminRoute, path: loginRoute || '/login' })}
          prefetch={false}
        >
          {t('authentication:backToLogin')}
        </Link>
      </div>
    </div>
  )
}
