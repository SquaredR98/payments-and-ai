'use client'

import { useState } from 'react'
import {
  EmailField,
  Form,
  FormSubmit,
  Link,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

type Props = {
  userSlug: string
}

export function AdminForgotPasswordClient({ userSlug }: Props) {
  const {
    config: {
      admin: { routes: { login: loginRoute } = {} },
      routes: { api: apiRoute, admin: adminRoute },
    },
  } = useConfig()
  const { t } = useTranslation()
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleResponse = (res: Response, successToast: (msg: string) => void) => {
    res.json().then(() => {
      setHasSubmitted(true)
      successToast(t('general:submissionSuccessful'))
    })
  }

  if (hasSubmitted) {
    return (
      <div className="admin-forgot">
        <div className="admin-forgot__card">
          <div className="admin-forgot__sent">
            <svg viewBox="0 0 24 24" fill="none" className="admin-forgot__sent-icon" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h1 className="admin-forgot__title">{t('authentication:emailSent')}</h1>
            <p className="admin-forgot__desc">
              {t('authentication:checkYourEmailForPasswordReset')}
            </p>
            <Link
              className="admin-forgot__back-link"
              href={formatAdminURL({ adminRoute, path: loginRoute || '/login' })}
              prefetch={false}
            >
              {t('authentication:backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-forgot">
      <div className="admin-forgot__card">
        <div className="admin-forgot__header">
          <svg viewBox="0 0 34 34" fill="none" className="admin-forgot__icon">
            <rect width="34" height="34" rx="8" fill="var(--theme-success-500)" />
            <path d="M10 17 L17 10 L24 17 L17 24 Z" fill="white" />
          </svg>
          <h1 className="admin-forgot__title">{t('authentication:forgotPassword')}</h1>
          <p className="admin-forgot__desc">
            {t('authentication:forgotPasswordEmailInstructions')}
          </p>
        </div>

        <Form
          action={formatAdminURL({ apiRoute, path: `/${userSlug}/forgot-password` })}
          className="admin-forgot__form"
          handleResponse={handleResponse}
          initialState={{
            email: { initialValue: '', valid: true, value: undefined },
          }}
          method="POST"
        >
          <EmailField
            field={{
              name: 'email',
              admin: { autoComplete: 'email' },
              label: t('general:email'),
              required: true,
            }}
            path="email"
          />
          <FormSubmit size="large">{t('general:submit')}</FormSubmit>
        </Form>

        <Link
          className="admin-forgot__back-link"
          href={formatAdminURL({ adminRoute, path: loginRoute || '/login' })}
          prefetch={false}
        >
          {t('authentication:backToLogin')}
        </Link>
      </div>
    </div>
  )
}
