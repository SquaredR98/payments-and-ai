'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { User } from '@/payload-types'
import './business-settings.css'

type CountryCode = NonNullable<NonNullable<User['address']>['country']>

const COUNTRY_OPTIONS: { label: string; value: CountryCode }[] = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'India', value: 'IN' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'Japan', value: 'JP' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Other', value: 'OTHER' },
]

export function BusinessSettings() {
  const { user, refresh } = useAuth()

  const [businessName, setBusinessName] = useState(user?.businessName ?? '')
  const [taxId, setTaxId] = useState(user?.taxId ?? '')
  const [street, setStreet] = useState(user?.address?.street ?? '')
  const [city, setCity] = useState(user?.address?.city ?? '')
  const [state, setState] = useState(user?.address?.state ?? '')
  const [zip, setZip] = useState(user?.address?.zip ?? '')
  const [country, setCountry] = useState<CountryCode | ''>(user?.address?.country ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const res = await api.auth.updateProfile(user.id, {
      businessName,
      taxId,
      address: { street, city, state, zip, country: country || undefined },
    })

    if (res.ok) {
      await refresh()
      setMessage({ type: 'success', text: 'Business details updated successfully.' })
    } else {
      setMessage({ type: 'error', text: res.message })
    }

    setIsSubmitting(false)
  }

  return (
    <form className="business-settings" onSubmit={handleSubmit}>
      {message && (
        <div className={`business-settings__message business-settings__message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="business-settings__field">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Acme Inc."
        />
        <p className="business-settings__hint">Appears on invoices as the sender business name.</p>
      </div>

      <div className="business-settings__field">
        <Label htmlFor="taxId">Tax ID / GST / VAT Number</Label>
        <Input
          id="taxId"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="e.g. 12-3456789"
        />
        <p className="business-settings__hint">Your business tax identification number. Appears on invoices.</p>
      </div>

      <fieldset className="business-settings__group">
        <legend className="business-settings__legend">Address</legend>

        <div className="business-settings__field">
          <Label htmlFor="street">Street</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="123 Main Street"
          />
        </div>

        <div className="business-settings__row">
          <div className="business-settings__field">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Francisco"
            />
          </div>
          <div className="business-settings__field">
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="CA"
            />
          </div>
        </div>

        <div className="business-settings__row">
          <div className="business-settings__field">
            <Label htmlFor="zip">ZIP / Postal Code</Label>
            <Input
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="94102"
            />
          </div>
          <div className="business-settings__field">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              className="business-settings__select"
              value={country}
              onChange={(e) => setCountry(e.target.value as CountryCode | '')}
            >
              <option value="">Select country</option>
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="business-settings__actions">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
