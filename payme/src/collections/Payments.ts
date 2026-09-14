import type { CollectionConfig } from 'payload'
import { syncInvoiceStatus } from './hooks/paymentHooks'

export const Payments: CollectionConfig = {
  slug: 'payments',
  labels: {
    singular: 'Payment',
    plural: 'Payments',
  },
  admin: {
    useAsTitle: 'gatewayTransactionId',
    defaultColumns: ['invoice', 'gateway', 'amount', 'status', 'processedAt'],
    components: {
      views: {
        edit: {
          default: {
            Component: '/admin/components/PaymentEditView/index#PaymentEditView',
          },
        },
        list: {
          Component: '/admin/components/CollectionListView/index#CollectionListView',
        },
      },
    },
  },
  access: {
    create: () => false,

    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { 'invoice.owner': { equals: user.id } }
    },

    update: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },

    delete: () => false,
  },
  hooks: {
    afterChange: [syncInvoiceStatus],
  },
  fields: [
    {
      name: 'invoice',
      type: 'relationship',
      relationTo: 'invoices',
      required: true,
      admin: {
        description: 'The invoice this payment is for.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'gateway',
          type: 'select',
          required: true,
          options: [
            { label: 'Stripe', value: 'stripe' },
            { label: 'PayPal', value: 'paypal' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '33%' },
        },
        {
          name: 'currency',
          type: 'text',
          required: true,
          admin: { width: '33%', description: 'Matches the invoice currency.' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Payment processing status.',
      },
    },
    {
      name: 'gatewayTransactionId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Stripe payment intent ID or PayPal order ID.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'payerEmail',
          type: 'email',
          admin: { placeholder: 'payer@example.com', width: '50%' },
        },
        {
          name: 'payerName',
          type: 'text',
          admin: { placeholder: 'Jane Smith', width: '50%' },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Raw gateway response for debugging.',
      },
    },
    {
      name: 'idempotencyKey',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Unique key to prevent duplicate webhook processing.',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the payment was processed by the gateway.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'refundedAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
            description: 'When a refund was issued.',
            width: '50%',
          },
        },
        {
          name: 'refundAmount',
          type: 'number',
          min: 0,
          admin: {
            readOnly: true,
            description: 'Partial or full refund amount.',
            width: '50%',
          },
        },
      ],
    },
  ],
}
