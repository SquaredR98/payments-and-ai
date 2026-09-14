import crypto from 'crypto'
import { APIError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
} from 'payload'
import { logAuditEvent } from '@/lib/audit'

function getRequestContext(req: { headers: Headers }) {
  return {
    ipAddress:
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  }
}

async function resolveNextInvoiceNumber(
  payload: typeof import('payload').default,
  ownerId: number | string,
  prefix: string,
): Promise<string> {
  const { docs: existing } = await payload.find({
    collection: 'invoices',
    where: {
      and: [
        { owner: { equals: ownerId } },
        { invoiceNumber: { like: `${prefix}%` } },
      ],
    },
    sort: '-invoiceNumber',
    limit: 1,
    overrideAccess: true,
  })

  let nextCounter = 1

  if (existing.length > 0) {
    const lastNumber = existing[0].invoiceNumber as string
    const lastCounter = parseInt(lastNumber.replace(prefix, ''), 10)
    if (!isNaN(lastCounter)) {
      nextCounter = lastCounter + 1
    }
  }

  return `${prefix}${String(nextCounter).padStart(4, '0')}`
}

export const generateInvoiceNumber: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`

  data.invoiceNumber = await resolveNextInvoiceNumber(
    req.payload,
    req.user!.id,
    prefix,
  )

  return data
}

const round2 = (n: number) => Math.round(n * 100) / 100

export const calculateTotals: CollectionBeforeChangeHook = async ({ data }) => {
  const lineItems = data.lineItems as Array<{
    quantity?: number
    unitPrice?: number
    amount?: number
  }>

  if (!lineItems?.length) return data

  // 1. Calculate each line item amount
  for (const item of lineItems) {
    item.amount = round2((item.quantity ?? 0) * (item.unitPrice ?? 0))
  }

  // 2. Subtotal = sum of all line item amounts
  const subtotal = round2(lineItems.reduce((sum, item) => sum + (item.amount ?? 0), 0))
  data.subtotal = subtotal

  // 3. Discount (applied BEFORE tax)
  let discountAmount = 0
  if (data.discountType && data.discountValue) {
    if (data.discountType === 'percentage') {
      discountAmount = round2(subtotal * data.discountValue / 100)
    } else if (data.discountType === 'fixed') {
      discountAmount = round2(Math.min(data.discountValue, subtotal))
    }
  }
  data.discountAmount = discountAmount

  // 4. Tax (applied to the discounted subtotal)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = data.taxRate ? round2(taxableAmount * data.taxRate / 100) : 0
  data.taxAmount = taxAmount

  // 5. Total = subtotal - discount + tax
  data.total = round2(subtotal - discountAmount + taxAmount)

  return data
}

export const generatePaymentLink: CollectionBeforeChangeHook = async ({
  data,
  operation,
}) => {
  if (operation !== 'create') return data

  const slug = crypto.randomBytes(9).toString('base64url')
  data.paymentLink = `pay_${slug}`

  return data
}

export const preventHardDelete: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  const doc = await req.payload.findByID({
    collection: 'invoices',
    id,
    overrideAccess: true,
  })

  if (doc.status === 'paid') {
    throw new APIError('Cannot delete a paid invoice. Paid invoices must be kept for financial records.', 403)
  }

  await req.payload.update({
    collection: 'invoices',
    id,
    data: { status: 'cancelled' },
    overrideAccess: true,
  })

  const { ipAddress, userAgent } = getRequestContext(req)
  logAuditEvent(req.payload, {
    action: 'invoice.cancelled',
    entity: 'invoice',
    entityId: String(id),
    user: req.user?.id,
    ipAddress,
    userAgent,
    previousData: { status: doc.status },
    newData: { status: 'cancelled' },
  })

  throw new APIError('Invoice has been cancelled instead of deleted. Financial records cannot be hard-deleted.', 403)
}

export const setOwner: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === 'create' && req.user) {
    data.owner = req.user.id
  }

  return data
}

export const logInvoiceChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const action = operation === 'create' ? 'invoice.created' : 'invoice.updated'
  const { ipAddress, userAgent } = getRequestContext(req)

  logAuditEvent(req.payload, {
    action,
    entity: 'invoice',
    entityId: String(doc.id),
    user: req.user?.id,
    ipAddress,
    userAgent,
    previousData: operation === 'update' ? previousDoc : undefined,
    newData: doc,
  })

  return doc
}

const NON_EDITABLE_STATUSES = ['paid', 'cancelled', 'refunded']

export const guardStatus: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update') return data

  if (originalDoc && NON_EDITABLE_STATUSES.includes(originalDoc.status)) {
    throw new APIError(
      `Cannot edit an invoice with status "${originalDoc.status}". Only draft, sent, viewed, and overdue invoices can be modified.`,
      403,
    )
  }

  return data
}
