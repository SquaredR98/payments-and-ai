'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import './profile-settings.css'

export function ProfileSettings() {
  const { user, refresh } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const res = await api.auth.updateProfile(user.id, {
      firstName,
      lastName,
      phone,
    })

    if (res.ok) {
      await refresh()
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
    } else {
      setMessage({ type: 'error', text: res.message })
    }

    setIsSubmitting(false)
  }

  return (
    <form className="profile-settings" onSubmit={handleSubmit}>
      {message && (
        <div className={`profile-settings__message profile-settings__message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-settings__row">
        <div className="profile-settings__field">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div className="profile-settings__field">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="profile-settings__field">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email}
          disabled
          readOnly
        />
        <p className="profile-settings__hint">
          To change your email, go to the Security tab.
        </p>
      </div>

      <div className="profile-settings__field">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="profile-settings__actions">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
