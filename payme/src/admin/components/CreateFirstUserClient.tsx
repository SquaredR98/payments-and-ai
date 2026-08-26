'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import {
  ConfirmPasswordField,
  EmailAndUsernameFields,
  Form,
  FormSubmit,
  PasswordField,
  RenderFields,
  useAuth,
  useConfig,
  useServerFunctions,
  useTranslation,
} from '@payloadcms/ui'
import { abortAndIgnore, handleAbortRef } from '@payloadcms/ui/shared'
import { formatAdminURL } from 'payload/shared'

import type { FormState } from 'payload'

type Props = {
  docPermissions: any
  docPreferences: any
  initialState: FormState
  loginWithUsername?: false | { allowEmailLogin?: boolean; requireUsername?: boolean }
  userSlug: string
}

// Only render firstName and lastName — skip tabs, role, logo, phone, business, address
const firstUserFields = [
  {
    type: 'row' as const,
    fields: [
      {
        name: 'firstName',
        type: 'text' as const,
        required: true,
        minLength: 1,
        maxLength: 100,
        admin: {
          placeholder: 'John',
        },
      },
      {
        name: 'lastName',
        type: 'text' as const,
        required: true,
        minLength: 1,
        maxLength: 100,
        admin: {
          placeholder: 'Doe',
        },
      },
    ],
  },
]

export function CreateFirstUserClient({
  docPermissions,
  docPreferences,
  initialState,
  loginWithUsername,
  userSlug,
}: Props) {
  const {
    config: {
      routes: { admin, api: apiRoute },
    },
  } = useConfig()

  const { getFormState } = useServerFunctions()
  const { t } = useTranslation()
  const { setUser } = useAuth()

  const abortOnChangeRef = useRef<AbortController | null>(null)

  const onChange = useCallback(
    async ({ formState: prevFormState, submitted }: { formState: FormState; submitted?: boolean }) => {
      const controller = handleAbortRef(abortOnChangeRef as React.RefObject<AbortController>)
      const response = await getFormState({
        collectionSlug: userSlug,
        docPermissions,
        docPreferences,
        formState: prevFormState,
        operation: 'create',
        schemaPath: userSlug,
        signal: controller.signal,
        skipValidation: !submitted,
      })
      abortOnChangeRef.current = null
      if (response && response.state) {
        return response.state
      }
      return prevFormState
    },
    [userSlug, getFormState, docPermissions, docPreferences],
  )

  const handleFirstRegister = (data: any) => {
    setUser(data)
  }

  useEffect(() => {
    return () => {
      if (abortOnChangeRef.current) {
        abortAndIgnore(abortOnChangeRef.current)
      }
    }
  }, [])

  return (
    <Form
      action={formatAdminURL({
        apiRoute,
        path: `/${userSlug}/first-register`,
      })}
      initialState={{
        ...initialState,
        'confirm-password': {
          ...initialState['confirm-password'],
          valid: initialState['confirm-password']?.['valid'] || false,
          value: initialState['confirm-password']?.['value'] || '',
        },
      }}
      method="POST"
      onChange={[onChange]}
      onSuccess={handleFirstRegister}
      redirect={admin}
      validationOperation="create"
    >
      <EmailAndUsernameFields
        className="emailAndUsername"
        loginWithUsername={loginWithUsername as any}
        operation="create"
        readOnly={false}
        t={t as any}
      />
      <PasswordField
        autoComplete="off"
        field={{
          name: 'password',
          label: t('authentication:newPassword'),
          required: true,
        }}
        path="password"
      />
      <ConfirmPasswordField />
      <RenderFields
        fields={firstUserFields}
        forceRender
        parentIndexPath=""
        parentPath=""
        parentSchemaPath={userSlug}
        permissions={true}
        readOnly={false}
      />
      <FormSubmit size="large">Create Admin Account</FormSubmit>
    </Form>
  )
}
