'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import './security-settings.css'

export function SecuritySettings() {
  const { user, refresh } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user) return null

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    setPasswordSubmitting(true)

    const res = await api.auth.changePassword(user.id, currentPassword, newPassword)

    if (res.ok) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' })
    } else {
      setPasswordMessage({ type: 'error', text: res.message })
    }

    setPasswordSubmitting(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMessage(null)
    setEmailSubmitting(true)

    const res = await api.auth.updateProfile(user.id, {
      email: newEmail,
    })

    if (res.ok) {
      await refresh()
      setNewEmail('')
      setEmailPassword('')
      setEmailMessage({ type: 'success', text: 'Email updated successfully. Please verify your new email.' })
    } else {
      setEmailMessage({ type: 'error', text: res.message })
    }

    setEmailSubmitting(false)
  }

  return (
    <div className="security-settings">
      <form className="security-settings__section" onSubmit={handlePasswordSubmit}>
        <h2 className="security-settings__heading">Change Password</h2>

        {passwordMessage && (
          <div className={`security-settings__message security-settings__message--${passwordMessage.type}`}>
            {passwordMessage.text}
          </div>
        )}

        <div className="security-settings__field">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="security-settings__field">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </div>

        <div className="security-settings__field">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="security-settings__actions">
          <Button type="submit" size="lg" disabled={passwordSubmitting}>
            {passwordSubmitting && <Loader2 className="size-4 animate-spin" />}
            Update Password
          </Button>
        </div>
      </form>

      <form className="security-settings__section" onSubmit={handleEmailSubmit}>
        <h2 className="security-settings__heading">Change Email</h2>

        {emailMessage && (
          <div className={`security-settings__message security-settings__message--${emailMessage.type}`}>
            {emailMessage.text}
          </div>
        )}

        <div className="security-settings__field">
          <Label htmlFor="newEmail">New Email</Label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@example.com"
            required
          />
        </div>

        <div className="security-settings__field">
          <Label htmlFor="emailPassword">Current Password</Label>
          <Input
            id="emailPassword"
            type="password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            placeholder="Verify your identity"
            required
          />
          <p className="security-settings__hint">Required to confirm email change.</p>
        </div>

        <div className="security-settings__actions">
          <Button type="submit" size="lg" disabled={emailSubmitting}>
            {emailSubmitting && <Loader2 className="size-4 animate-spin" />}
            Update Email
          </Button>
        </div>
      </form>
    </div>
  )
}
