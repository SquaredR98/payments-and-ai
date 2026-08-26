import React from 'react'
import { buildFormState } from '@payloadcms/ui/utilities/buildFormState'

import { CreateFirstUserClient } from './CreateFirstUserClient'

import type { AdminViewServerProps } from 'payload'

export async function CreateFirstUser({ initPageResult }: AdminViewServerProps) {
  const {
    locale,
    req,
    req: {
      payload: {
        collections,
        config: {
          admin: { user: userSlug },
        },
      },
    },
  } = initPageResult

  const collectionConfig = (collections as Record<string, any>)?.[userSlug]?.config
  const { auth: authOptions } = collectionConfig
  const loginWithUsername = authOptions.loginWithUsername

  // Build form state with all field permissions open (first user = full access)
  const baseFields = Object.fromEntries(
    collectionConfig.fields
      .filter((f: any) => 'name' in f && typeof f.name === 'string')
      .map((f: any) => [
        f.name,
        {
          create: true as const,
          read: true as const,
          update: true as const,
        },
      ]),
  )

  const docPermissions = {
    create: true as const,
    delete: true as const,
    fields: baseFields,
    read: true as const,
    readVersions: true as const,
    update: true as const,
  }

  const { state: formState } = await buildFormState({
    collectionSlug: collectionConfig.slug,
    data: {},
    docPermissions,
    docPreferences: { fields: {} },
    locale: locale?.code,
    operation: 'create',
    renderAllFields: true,
    req,
    schemaPath: collectionConfig.slug,
    skipClientConfigAuth: true,
    skipValidation: true,
  })

  return (
    <div className="create-first-user cfu">
      <div className="cfu__header">
        <img src="/logo-icon.svg" alt="PayMe" className="cfu__logo" />
        <h1 className="cfu__title">PayMe</h1>
        <p className="cfu__subtitle">Set up your admin account to get started</p>
      </div>
      <CreateFirstUserClient
        docPermissions={docPermissions}
        docPreferences={{ fields: {} }}
        initialState={formState}
        loginWithUsername={loginWithUsername}
        userSlug={userSlug}
      />
    </div>
  )
}
