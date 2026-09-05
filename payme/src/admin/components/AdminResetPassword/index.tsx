import React from 'react'
import { redirect } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'

import { AdminResetPasswordClient } from './AdminResetPasswordClient'
import './styles.css'

import type { AdminViewServerProps } from 'payload'

export function AdminResetPassword({ initPageResult, params }: AdminViewServerProps) {
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

  const token = params?.segments?.[1] ?? ''

  return <AdminResetPasswordClient token={token} userSlug={userSlug} />
}
