import type { CollectionAfterChangeHook } from 'payload'
import { logAuditEvent } from '@/lib/audit'

export const syncInvoiceStatus: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context?.seed) return doc

  const statusChanged = doc.status !== previousDoc?.status
  if (!statusChanged) return doc

  const ipAddress =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  const invoiceId =
    typeof doc.invoice === 'object' ? doc.invoice.id : doc.invoice

  if (!invoiceId) return doc

  if (doc.status === 'succeeded') {
    await req.payload.update({
      collection: 'invoices',
      id: invoiceId,
      data: {
        status: 'paid',
        paidAt: new Date().toISOString(),
        paidVia: doc.gateway,
        ...(doc.gateway === 'stripe' && {
          stripePaymentIntentId: doc.gatewayTransactionId,
        }),
        ...(doc.gateway === 'paypal' && {
          paypalOrderId: doc.gatewayTransactionId,
        }),
      },
      overrideAccess: true,
      context: { skipGuardStatus: true },
    })

    logAuditEvent(req.payload, {
      action: 'payment.received',
      entity: 'payment',
      entityId: String(doc.id),
      ipAddress,
      userAgent,
      newData: { gateway: doc.gateway, amount: doc.amount, invoiceId },
    })
  }

  if (doc.status === 'refunded') {
    await req.payload.update({
      collection: 'invoices',
      id: invoiceId,
      data: { status: 'refunded' },
      overrideAccess: true,
      context: { skipGuardStatus: true },
    })

    logAuditEvent(req.payload, {
      action: 'payment.refunded',
      entity: 'payment',
      entityId: String(doc.id),
      ipAddress,
      userAgent,
      newData: { refundAmount: doc.refundAmount, invoiceId },
    })
  }

  if (doc.status === 'failed') {
    logAuditEvent(req.payload, {
      action: 'payment.failed',
      entity: 'payment',
      entityId: String(doc.id),
      ipAddress,
      userAgent,
      newData: { gateway: doc.gateway, amount: doc.amount, invoiceId },
    })
  }

  return doc
}
