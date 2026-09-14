import type { Payload } from 'payload'

export type AuditAction =
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.cancelled'
  | 'payment.received'
  | 'payment.failed'
  | 'payment.refunded'
  | 'user.login'
  | 'user.logout'
  | 'user.updated'

interface AuditEventParams {
  action: AuditAction
  entity: 'invoice' | 'payment' | 'user'
  entityId: string
  user?: number
  ipAddress?: string
  userAgent?: string
  previousData?: Record<string, unknown>
  newData?: Record<string, unknown>
}

export async function logAuditEvent(
  payload: Payload,
  params: AuditEventParams,
): Promise<void> {
  try {
    await payload.create({
      collection: 'audit-logs',
      data: {
        action: params.action,
        entity: params.entity,
        entityId: String(params.entityId),
        user: params.user ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        previousData: params.previousData ?? null,
        newData: params.newData ?? null,
      },
      overrideAccess: true,
    })
  } catch (error) {
    console.error('[Audit] Failed to log event:', params.action, error)
  }
}
