'use client'

import { useMemo, useState } from 'react'
import { Form, RenderFields, useConfig, useDocumentInfo } from '@payloadcms/ui'
import type { ClientField, FormState, TabsFieldClient } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { DocumentBridge } from '../DocumentBridge'
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
  { key: 'details', label: 'Details', tabIndex: 0 },
  { key: 'financials', label: 'Financials', tabIndex: 1 },
  { key: 'payment', label: 'Payment', tabIndex: 2 },
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
  const { docPermissions } = useDocumentInfo()
  const { getEntityConfig } = useConfig()
  const collectionConfig = getEntityConfig({ collectionSlug })

  const tabFields = useMemo(() => {
    const fields = collectionConfig?.fields ?? []
    const tabsField = fields.find(
      (f): f is TabsFieldClient => f.type === 'tabs',
    )
    if (!tabsField) return { details: [], financials: [], payment: [] }

    return {
      details: tabsField.tabs[0]?.fields ?? [],
      financials: tabsField.tabs[1]?.fields ?? [],
      payment: tabsField.tabs[2]?.fields ?? [],
    }
  }, [collectionConfig])

  const tabsFieldIndex = useMemo(() => {
    const fields = collectionConfig?.fields ?? []
    return fields.findIndex((f) => f.type === 'tabs')
  }, [collectionConfig])

  const actionUrl = isEditing
    ? formatAdminURL({ apiRoute, path: `/${collectionSlug}/${docID}` })
    : formatAdminURL({ apiRoute, path: `/${collectionSlug}` })

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!
  const parentSchemaPath = `${collectionSlug}._index-${tabsFieldIndex}-${activeTabConfig.tabIndex}`

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
              <RenderFields
                fields={tabFields[activeTab] as ClientField[]}
                forceRender
                parentIndexPath=""
                parentPath=""
                parentSchemaPath={parentSchemaPath}
                permissions={docPermissions?.fields ?? true}
              />
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
