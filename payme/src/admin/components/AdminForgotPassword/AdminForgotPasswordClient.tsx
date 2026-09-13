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
import { Mail } from 'lucide-react'
import { BrandIcon } from '../BrandIcon'

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
            <Mail size={32} strokeWidth={1.5} className="admin-forgot__sent-icon" />
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
          <BrandIcon className="admin-forgot__icon" />
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
