'use client'

import { useState } from 'react'
import {
  EmailField,
  TextField,
  SelectField,
  CheckboxField,
  PasswordField,
  ConfirmPasswordField,
  useConfig,
} from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

type Props = {
  collectionSlug: string
  isEditing: boolean
}

export function AccountTab({ collectionSlug, isEditing }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const {
    config: {
      routes: { api: apiRoute },
    },
  } = useConfig()

  const handleResendVerification = async () => {
    try {
      setAuthMessage(null)
      const res = await fetch(
        formatAdminURL({ apiRoute, path: `/${collectionSlug}/verify` }),
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      if (res.ok) {
        setAuthMessage('Verification email sent.')
      } else {
        setAuthMessage('Failed to send verification email.')
      }
    } catch {
      setAuthMessage('Failed to send verification email.')
    }
  }

  const handleForceLogout = async () => {
    try {
      setAuthMessage(null)
      const res = await fetch(
        formatAdminURL({ apiRoute, path: `/${collectionSlug}/logout?allSessions=true` }),
        {
          method: 'POST',
          credentials: 'include',
        },
      )
      if (res.ok) {
        setAuthMessage('All sessions have been terminated.')
      } else {
        setAuthMessage('Failed to terminate sessions.')
      }
    } catch {
      setAuthMessage('Failed to terminate sessions.')
    }
  }

  return (
    <div className="user-edit__account">
      <div className="user-edit__fields">
        <div className="user-edit__row">
          <EmailField
            field={{ name: 'email', label: 'Email', required: true }}
            path="email"
            schemaPath={`${collectionSlug}.email`}
          />
          <SelectField
            field={{
              name: 'role',
              label: 'Role',
              required: true,
              options: [
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
              ],
            }}
            path="role"
            schemaPath={`${collectionSlug}.role`}
          />
        </div>

        <div className="user-edit__row">
          <TextField
            field={{ name: 'firstName', label: 'First Name', required: true }}
            path="firstName"
            schemaPath={`${collectionSlug}.firstName`}
          />
          <TextField
            field={{ name: 'lastName', label: 'Last Name', required: true }}
            path="lastName"
            schemaPath={`${collectionSlug}.lastName`}
          />
        </div>

        <TextField
          field={{ name: 'company', label: 'Company' }}
          path="company"
          schemaPath={`${collectionSlug}.company`}
        />

        <CheckboxField
          field={{ name: '_verified', label: 'Email Verified' }}
          path="_verified"
          schemaPath={`${collectionSlug}._verified`}
        />
      </div>

      {isEditing && (
        <div className="user-edit__auth">
          <h3 className="user-edit__auth-title">Authentication</h3>
          <div className="user-edit__auth-actions">
            <button
              type="button"
              className={`user-edit__auth-btn${showPassword ? ' user-edit__auth-btn--active' : ''}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Cancel Password Change' : 'Change Password'}
            </button>
            <button
              type="button"
              className="user-edit__auth-btn"
              onClick={handleResendVerification}
            >
              Resend Verification
            </button>
            <button
              type="button"
              className="user-edit__auth-btn"
              onClick={handleForceLogout}
            >
              Force Log Out
            </button>
          </div>

          {authMessage && (
            <p className="user-edit__auth-message">{authMessage}</p>
          )}

          {showPassword && (
            <div className="user-edit__password-fields">
              <PasswordField
                field={{
                  name: 'password',
                  label: 'New Password',
                  required: true,
                }}
                path="password"
                schemaPath={`${collectionSlug}.password`}
              />
              <ConfirmPasswordField />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
