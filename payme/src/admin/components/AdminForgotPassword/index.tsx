import React from 'react'
import { redirect } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'

import { AdminForgotPasswordClient } from './AdminForgotPasswordClient'
import './styles.css'

import type { AdminViewServerProps } from 'payload'

export function AdminForgotPassword({ initPageResult }: AdminViewServerProps) {
  const {
    req: {
      user,
      payload: { config },
    },
  } = initPageResult

  const {
    admin: {
      user: userSlug,
      routes: { account: accountRoute } = {},
    },
    routes: { admin: adminRoute },
  } = config

  if (user) {
    redirect(formatAdminURL({ adminRoute, path: accountRoute || '/account' }))
  }

  return <AdminForgotPasswordClient userSlug={userSlug} />
}
