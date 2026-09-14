'use client'

import { Shield, AlertTriangle } from 'lucide-react'

type Props = {
  doc: Record<string, any> | null
  isEditing: boolean
}

const ACTION_LABELS: Record<string, string> = {
  'invoice.created': 'Invoice Created',
  'invoice.updated': 'Invoice Updated',
  'invoice.sent': 'Invoice Sent',
  'invoice.paid': 'Invoice Paid',
  'invoice.cancelled': 'Invoice Cancelled',
  'payment.received': 'Payment Received',
  'payment.failed': 'Payment Failed',
  'payment.refunded': 'Payment Refunded',
  'user.login': 'User Login',
  'user.logout': 'User Logout',
  'user.updated': 'User Updated',
}

const ACTION_COLORS: Record<string, string> = {
  'invoice.created': '#3b82f6',
  'invoice.updated': '#8b5cf6',
  'invoice.sent': 'var(--theme-success-500)',
  'invoice.paid': '#22c55e',
  'invoice.cancelled': 'var(--theme-elevation-500)',
  'payment.received': '#22c55e',
  'payment.failed': '#ef4444',
  'payment.refunded': '#f59e0b',
  'user.login': '#3b82f6',
  'user.logout': 'var(--theme-elevation-500)',
  'user.updated': '#8b5cf6',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return (
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' at ' +
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  )
}

export function AuditLogEditViewClient({ doc, isEditing }: Props) {
  if (!isEditing || !doc) {
    return (
      <div className="audit-view">
        <div className="audit-view__empty">
          <div className="audit-view__empty-icon">
            <AlertTriangle size={24} />
          </div>
          <h2 className="audit-view__empty-title">Audit Logs Cannot Be Created Manually</h2>
          <p className="audit-view__empty-desc">
            Audit log entries are created automatically by system hooks when financially relevant
            events occur.
          </p>
        </div>
      </div>
    )
  }

  const action = doc.action || 'unknown'
  const userName =
    typeof doc.user === 'object' && doc.user
      ? doc.user.firstName
        ? `${doc.user.firstName} ${doc.user.lastName || ''}`.trim()
        : doc.user.email
      : doc.user
        ? `User #${doc.user}`
        : 'System'

  return (
    <div className="audit-view">
      <div className="audit-view__main">
        <div className="audit-view__header">
          <div className="audit-view__header-icon">
            <Shield size={20} />
          </div>
          <div className="audit-view__header-info">
            <h1 className="audit-view__title">{ACTION_LABELS[action] || action}</h1>
            <span className="audit-view__subtitle">
              {doc.entity} #{doc.entityId}
            </span>
          </div>
          <span
            className="audit-view__action-badge"
            style={{ background: ACTION_COLORS[action] || 'var(--theme-elevation-500)' }}
          >
            {action}
          </span>
        </div>

        <div className="audit-view__card">
          <h3 className="audit-view__section-title">Event Details</h3>
          <div className="audit-view__grid">
            <ReadOnlyField label="Action" value={ACTION_LABELS[action] || action} />
            <ReadOnlyField label="Entity" value={doc.entity} />
            <ReadOnlyField label="Entity ID" value={doc.entityId} mono />
            <ReadOnlyField label="Performed By" value={userName} />
            <ReadOnlyField label="Timestamp" value={formatDate(doc.createdAt)} />
          </div>

          <h3 className="audit-view__section-title audit-view__section-title--spaced">
            Request Context
          </h3>
          <div className="audit-view__grid audit-view__grid--1col">
            <ReadOnlyField label="IP Address" value={doc.ipAddress} mono />
            <ReadOnlyField label="User Agent" value={doc.userAgent} />
          </div>

          {doc.previousData && (
            <>
              <h3 className="audit-view__section-title audit-view__section-title--spaced">
                Previous Data
              </h3>
              <pre className="audit-view__json">
                {JSON.stringify(doc.previousData, null, 2)}
              </pre>
            </>
          )}

          {doc.newData && (
            <>
              <h3 className="audit-view__section-title audit-view__section-title--spaced">
                New Data
              </h3>
              <pre className="audit-view__json">
                {JSON.stringify(doc.newData, null, 2)}
              </pre>
            </>
          )}
        </div>

        <p className="audit-view__readonly-notice">
          Audit logs are append-only and cannot be modified or deleted.
        </p>
      </div>
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  mono,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
}) {
  return (
    <div className="audit-view__field">
      <span className="audit-view__field-label">{label}</span>
      <span
        className={`audit-view__field-value${mono ? ' audit-view__field-value--mono' : ''}`}
      >
        {value || '—'}
      </span>
    </div>
  )
}
