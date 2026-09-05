'use client'

import { useState } from 'react'
import { Form } from '@payloadcms/ui'
import type { FormState } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { DocumentBridge } from '../DocumentBridge'
import { AccountTab } from './tabs/AccountTab'
import { BusinessTab } from './tabs/BusinessTab'
import { AddressTab } from './tabs/AddressTab'
import { PreferencesTab } from './tabs/PreferencesTab'
import { ActivityTab } from './tabs/ActivityTab'
import { EditViewSidebar } from './EditViewSidebar'

type Props = {
  doc: Record<string, any> | null
  docID: number | string | null
  formState: FormState
  collectionSlug: string
  apiRoute: string
  isEditing: boolean
}

const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'business', label: 'Business' },
  { key: 'address', label: 'Address' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'activity', label: 'Activity' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function UserEditViewClient({
  doc,
  docID,
  formState,
  collectionSlug,
  apiRoute,
  isEditing,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('account')

  const actionUrl = isEditing
    ? formatAdminURL({ apiRoute, path: `/${collectionSlug}/${docID}` })
    : formatAdminURL({ apiRoute, path: `/${collectionSlug}` })

  return (
    <Form
      action={actionUrl}
      initialState={formState}
      method={isEditing ? 'PATCH' : 'POST'}
    >
      <DocumentBridge />
      <div className="user-edit">
        <div className="user-edit__main">
          <div className="user-edit__card">
            <nav className="user-edit__tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`user-edit__tab${activeTab === tab.key ? ' user-edit__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="user-edit__content">
              {activeTab === 'account' && (
                <AccountTab collectionSlug={collectionSlug} isEditing={isEditing} />
              )}
              {activeTab === 'business' && (
                <BusinessTab collectionSlug={collectionSlug} />
              )}
              {activeTab === 'address' && (
                <AddressTab collectionSlug={collectionSlug} />
              )}
              {activeTab === 'preferences' && <PreferencesTab />}
              {activeTab === 'activity' && <ActivityTab />}
            </div>
          </div>
        </div>

        <div className="user-edit__sidebar-wrap">
          <EditViewSidebar doc={doc} isEditing={isEditing} />
          <button type="submit" className="user-edit__save-btn">
            Save
          </button>
        </div>
      </div>
    </Form>
  )
}
