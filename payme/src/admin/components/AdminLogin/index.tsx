import React from 'react'
import { redirect } from 'next/navigation'
import { getSafeRedirect } from 'payload/shared'

import { AdminLoginClient } from './AdminLoginClient'
import './styles.css'

import type { AdminViewServerProps } from 'payload'

export function AdminLogin({ initPageResult, searchParams }: AdminViewServerProps) {
  const {
    req: {
      user,
      payload: { config },
    },
  } = initPageResult

  const {
    admin: { user: userSlug },
    routes: { admin: adminRoute },
  } = config

  const redirectUrl = getSafeRedirect({
    fallbackTo: adminRoute,
    redirectTo: searchParams.redirect,
  })

  if (user) {
    redirect(redirectUrl)
  }

  const prefillAutoLogin =
    typeof config.admin?.autoLogin === 'object' && config.admin?.autoLogin.prefillOnly
  const prefillEmail =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.email
      : undefined
  const prefillPassword =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.password
      : undefined

  return (
    <AdminLoginClient
      prefillEmail={prefillEmail}
      prefillPassword={prefillPassword}
      searchParams={searchParams}
      userSlug={userSlug}
    />
  )
}
