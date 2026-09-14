'use client'

import { useState } from 'react'
import { Form } from '@payloadcms/ui'
import type { FormState } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { DocumentBridge } from '../DocumentBridge'
import { DetailsTab } from './tabs/DetailsTab'
import { FinancialsTab } from './tabs/FinancialsTab'
import { PaymentTab } from './tabs/PaymentTab'
import { InvoiceSidebar } from './InvoiceSidebar'

type Props = {
  doc: Record<string, any> | null
  docID: number | string | null
  formState: FormState
  collectionSlug: string
  apiRoute: string
  isEditing: boolean
}

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'financials', label: 'Financials' },
  { key: 'payment', label: 'Payment' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function InvoiceEditViewClient({
  doc,
  docID,
  formState,
  collectionSlug,
  apiRoute,
  isEditing,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('details')

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
      <div className="invoice-edit">
        <div className="invoice-edit__main">
          <div className="invoice-edit__card">
            <nav className="invoice-edit__tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`invoice-edit__tab${activeTab === tab.key ? ' invoice-edit__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="invoice-edit__content">
              {activeTab === 'details' && (
                <DetailsTab collectionSlug={collectionSlug} />
              )}
              {activeTab === 'financials' && (
                <FinancialsTab collectionSlug={collectionSlug} />
              )}
              {activeTab === 'payment' && (
                <PaymentTab collectionSlug={collectionSlug} />
              )}
            </div>
          </div>
        </div>

        <div className="invoice-edit__sidebar-wrap">
          <InvoiceSidebar doc={doc} isEditing={isEditing} />
          <button type="submit" className="invoice-edit__save-btn">
            Save
          </button>
        </div>
      </div>
    </Form>
  )
}
