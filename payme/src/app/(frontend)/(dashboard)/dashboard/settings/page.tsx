'use client'

import { useState } from 'react'
import { User, Building2, Shield } from 'lucide-react'
import { usePageHeader } from '@/hooks/use-page-header'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { BusinessSettings } from '@/components/settings/business-settings'
import { SecuritySettings } from '@/components/settings/security-settings'
import './styles.css'

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'business', label: 'Business', icon: Building2 },
  { key: 'security', label: 'Security', icon: Shield },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function SettingsPage() {
  usePageHeader({ title: 'Settings', subtitle: 'Manage your account preferences' })
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  return (
    <div className="settings">
      <nav className="settings__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`settings__tab ${activeTab === tab.key ? 'settings__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="settings__tab-icon" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="settings__content" role="tabpanel">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'business' && <BusinessSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  )
}
