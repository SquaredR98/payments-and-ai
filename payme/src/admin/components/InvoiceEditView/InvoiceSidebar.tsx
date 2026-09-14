'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type Props = {
  doc: Record<string, any> | null
  isEditing: boolean
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'var(--theme-elevation-500)',
  sent: 'var(--theme-success-500)',
  viewed: '#3b82f6',
  paid: '#22c55e',
  overdue: '#ef4444',
  cancelled: 'var(--theme-elevation-400)',
  refunded: '#f59e0b',
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
    ' — ' +
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

export function InvoiceSidebar({ doc, isEditing }: Props) {
  const [copied, setCopied] = useState(false)

  if (!isEditing || !doc) {
    return (
      <div className="invoice-sidebar">
        <h2 className="invoice-sidebar__heading">Invoice</h2>
        <div className="invoice-sidebar__fields">
          <div className="invoice-sidebar__field">
            <span className="invoice-sidebar__label">Status</span>
            <span className="invoice-sidebar__status-badge" style={{ background: STATUS_COLORS.draft }}>
              Draft
            </span>
          </div>
          <p className="invoice-sidebar__hint">Save to generate invoice number and payment link.</p>
        </div>
      </div>
    )
  }

  const status = doc.status || 'draft'
  const paymentLinkUrl = doc.paymentLink
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/pay/${doc.paymentLink}`
    : null

  const handleCopyLink = async () => {
    if (!paymentLinkUrl) return
    try {
      await navigator.clipboard.writeText(paymentLinkUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  const ownerName =
    typeof doc.owner === 'object' && doc.owner
      ? doc.owner.firstName
        ? `${doc.owner.firstName} ${doc.owner.lastName || ''}`.trim()
        : doc.owner.email
      : null

  return (
    <div className="invoice-sidebar">
      <h2 className="invoice-sidebar__heading">Invoice</h2>
      <div className="invoice-sidebar__fields">
        <div className="invoice-sidebar__field">
          <span className="invoice-sidebar__label">Status</span>
          <span
            className="invoice-sidebar__status-badge"
            style={{ background: STATUS_COLORS[status] || STATUS_COLORS.draft }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="invoice-sidebar__field">
          <span className="invoice-sidebar__label">Invoice #</span>
          <span className="invoice-sidebar__value invoice-sidebar__value--mono">
            {doc.invoiceNumber || '—'}
          </span>
        </div>

        <div className="invoice-sidebar__field">
          <span className="invoice-sidebar__label">Total</span>
          <span className="invoice-sidebar__value invoice-sidebar__value--bold">
            {formatCurrency(doc.total, doc.currency || 'USD')}
          </span>
        </div>

        {paymentLinkUrl && (
          <div className="invoice-sidebar__field">
            <span className="invoice-sidebar__label">Payment Link</span>
            <button
              type="button"
              className="invoice-sidebar__copy-btn"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy Link
                </>
              )}
            </button>
          </div>
        )}

        {ownerName && (
          <div className="invoice-sidebar__field">
            <span className="invoice-sidebar__label">Owner</span>
            <span className="invoice-sidebar__value">{ownerName}</span>
          </div>
        )}

        <div className="invoice-sidebar__field">
          <span className="invoice-sidebar__label">Created</span>
          <span className="invoice-sidebar__value invoice-sidebar__value--small">
            {formatDate(doc.createdAt)}
          </span>
        </div>

        <div className="invoice-sidebar__field">
          <span className="invoice-sidebar__label">Updated</span>
          <span className="invoice-sidebar__value invoice-sidebar__value--small">
            {formatDate(doc.updatedAt)}
          </span>
        </div>

        {doc.paidAt && (
          <div className="invoice-sidebar__field">
            <span className="invoice-sidebar__label">Paid At</span>
            <span className="invoice-sidebar__value invoice-sidebar__value--small">
              {formatDate(doc.paidAt)}
            </span>
          </div>
        )}

        {doc.paidVia && (
          <div className="invoice-sidebar__field">
            <span className="invoice-sidebar__label">Paid Via</span>
            <span className="invoice-sidebar__value">
              {doc.paidVia === 'stripe' ? 'Stripe' : 'PayPal'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
