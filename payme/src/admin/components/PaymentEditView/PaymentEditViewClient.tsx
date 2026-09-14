'use client'

import { CreditCard, AlertTriangle } from 'lucide-react'

type Props = {
  doc: Record<string, any> | null
  isEditing: boolean
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--theme-elevation-500)',
  succeeded: '#22c55e',
  failed: '#ef4444',
  refunded: '#f59e0b',
  partially_refunded: '#f59e0b',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  succeeded: 'Succeeded',
  failed: 'Failed',
  refunded: 'Refunded',
  partially_refunded: 'Partially Refunded',
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
      hour12: false,
    })
  )
}

function formatCurrency(amount: number | null | undefined, currency: string): string {
  if (amount == null) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function PaymentEditViewClient({ doc, isEditing }: Props) {
  if (!isEditing || !doc) {
    return (
      <div className="payment-view">
        <div className="payment-view__empty">
          <div className="payment-view__empty-icon">
            <AlertTriangle size={24} />
          </div>
          <h2 className="payment-view__empty-title">Payments Cannot Be Created Manually</h2>
          <p className="payment-view__empty-desc">
            Payment records are created automatically by webhook handlers when a client pays via
            Stripe or PayPal.
          </p>
        </div>
      </div>
    )
  }

  const status = doc.status || 'pending'
  const invoiceRef =
    typeof doc.invoice === 'object' && doc.invoice
      ? doc.invoice.invoiceNumber || `#${doc.invoice.id}`
      : doc.invoice
        ? `#${doc.invoice}`
        : '—'

  return (
    <div className="payment-view">
      <div className="payment-view__main">
        <div className="payment-view__header">
          <div className="payment-view__header-icon">
            <CreditCard size={20} />
          </div>
          <div className="payment-view__header-info">
            <h1 className="payment-view__title">{doc.gatewayTransactionId}</h1>
            <span className="payment-view__subtitle">
              {doc.gateway === 'stripe' ? 'Stripe' : 'PayPal'} Payment
            </span>
          </div>
          <span
            className="payment-view__status-badge"
            style={{ background: STATUS_COLORS[status] || STATUS_COLORS.pending }}
          >
            {STATUS_LABELS[status] || status}
          </span>
        </div>

        <div className="payment-view__card">
          <h3 className="payment-view__section-title">Payment Details</h3>

          <div className="payment-view__grid">
            <ReadOnlyField label="Amount" value={formatCurrency(doc.amount, doc.currency || 'USD')} bold />
            <ReadOnlyField label="Currency" value={doc.currency || '—'} />
            <ReadOnlyField label="Gateway" value={doc.gateway === 'stripe' ? 'Stripe' : 'PayPal'} />
            <ReadOnlyField label="Invoice" value={invoiceRef} />
          </div>

          <h3 className="payment-view__section-title payment-view__section-title--spaced">
            Payer Information
          </h3>
          <div className="payment-view__grid">
            <ReadOnlyField label="Payer Name" value={doc.payerName} />
            <ReadOnlyField label="Payer Email" value={doc.payerEmail} />
          </div>

          <h3 className="payment-view__section-title payment-view__section-title--spaced">
            Transaction References
          </h3>
          <div className="payment-view__grid payment-view__grid--1col">
            <ReadOnlyField label="Transaction ID" value={doc.gatewayTransactionId} mono />
            <ReadOnlyField label="Idempotency Key" value={doc.idempotencyKey} mono />
          </div>

          <h3 className="payment-view__section-title payment-view__section-title--spaced">
            Timestamps
          </h3>
          <div className="payment-view__grid">
            <ReadOnlyField label="Processed At" value={formatDate(doc.processedAt)} />
            <ReadOnlyField label="Created At" value={formatDate(doc.createdAt)} />
            {doc.refundedAt && (
              <>
                <ReadOnlyField label="Refunded At" value={formatDate(doc.refundedAt)} />
                <ReadOnlyField label="Refund Amount" value={formatCurrency(doc.refundAmount, doc.currency || 'USD')} />
              </>
            )}
          </div>

          {doc.metadata && (
            <>
              <h3 className="payment-view__section-title payment-view__section-title--spaced">
                Raw Gateway Response
              </h3>
              <pre className="payment-view__json">
                {JSON.stringify(doc.metadata, null, 2)}
              </pre>
            </>
          )}
        </div>

        <p className="payment-view__readonly-notice">
          Payment records are read-only. They are created and updated by webhook handlers.
        </p>
      </div>
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  mono,
  bold,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
  bold?: boolean
}) {
  return (
    <div className="payment-view__field">
      <span className="payment-view__field-label">{label}</span>
      <span
        className={`payment-view__field-value${mono ? ' payment-view__field-value--mono' : ''}${bold ? ' payment-view__field-value--bold' : ''}`}
      >
        {value || '—'}
      </span>
    </div>
  )
}
