import type { CollectionConfig } from 'payload'
import {
  generateInvoiceNumber,
  calculateTotals,
  generatePaymentLink,
  preventHardDelete,
  setOwner,
  guardStatus,
  logInvoiceChange,
} from './hooks/invoiceHooks'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  labels: {
    singular: 'Invoice',
    plural: 'Invoices',
  },
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'client.name', 'total', 'status', 'dueDate'],
    components: {
      views: {
        list: {
          Component: '/admin/components/CollectionListView/index#CollectionListView',
        },
      },
    },
  },
  access: {
    create: ({ req: { user } }) => !!user,

    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { owner: { equals: user.id } }
    },

    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { owner: { equals: user.id } }
    },

    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { owner: { equals: user.id } }
    },
  },
  hooks: {
    beforeChange: [
      setOwner,
      guardStatus,
      generateInvoiceNumber,
      calculateTotals,
      generatePaymentLink,
    ],
    afterChange: [logInvoiceChange],
    beforeDelete: [preventHardDelete],
  },
  indexes: [
    { unique: true, fields: ['owner', 'invoiceNumber'] },
  ],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          description: 'Client information and line items.',
          fields: [
            {
              name: 'client',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      maxLength: 200,
                      admin: { placeholder: 'Client name or company' },
                    },
                    {
                      name: 'email',
                      type: 'email',
                      required: true,
                      admin: { placeholder: 'client@example.com' },
                    },
                  ],
                },
                {
                  name: 'phone',
                  type: 'text',
                  admin: { placeholder: '+1 (555) 123-4567' },
                },
                {
                  name: 'address',
                  type: 'textarea',
                  admin: { placeholder: '123 Main St, City, State, ZIP, Country' },
                },
                {
                  name: 'taxId',
                  type: 'text',
                  label: 'Tax ID / GST / VAT',
                  admin: { placeholder: 'e.g. 12-3456789' },
                },
              ],
            },
            {
              name: 'lineItems',
              type: 'array',
              required: true,
              minRows: 1,
              labels: {
                singular: 'Line Item',
                plural: 'Line Items',
              },
              fields: [
                {
                  name: 'description',
                  type: 'text',
                  required: true,
                  minLength: 3,
                  maxLength: 200,
                  admin: { placeholder: 'Service or product description' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'quantity',
                      type: 'number',
                      required: true,
                      min: 1,
                      admin: { placeholder: '1', width: '25%' },
                    },
                    {
                      name: 'unitPrice',
                      type: 'number',
                      required: true,
                      min: 0.01,
                      admin: { placeholder: '0.00', width: '25%' },
                    },
                    {
                      name: 'amount',
                      type: 'number',
                      admin: {
                        readOnly: true,
                        width: '25%',
                        description: 'Auto-calculated: quantity × unitPrice',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'currency',
              type: 'select',
              required: true,
              defaultValue: 'USD',
              options: [
                { label: 'USD — US Dollar', value: 'USD' },
                { label: 'EUR — Euro', value: 'EUR' },
                { label: 'GBP — British Pound', value: 'GBP' },
                { label: 'INR — Indian Rupee', value: 'INR' },
                { label: 'CAD — Canadian Dollar', value: 'CAD' },
                { label: 'AUD — Australian Dollar', value: 'AUD' },
                { label: 'JPY — Japanese Yen', value: 'JPY' },
                { label: 'BRL — Brazilian Real', value: 'BRL' },
                { label: 'MXN — Mexican Peso', value: 'MXN' },
                { label: 'SGD — Singapore Dollar', value: 'SGD' },
                { label: 'CHF — Swiss Franc', value: 'CHF' },
                { label: 'SEK — Swedish Krona', value: 'SEK' },
                { label: 'NOK — Norwegian Krone', value: 'NOK' },
                { label: 'DKK — Danish Krone', value: 'DKK' },
                { label: 'NZD — New Zealand Dollar', value: 'NZD' },
                { label: 'ZAR — South African Rand', value: 'ZAR' },
                { label: 'HKD — Hong Kong Dollar', value: 'HKD' },
                { label: 'KRW — South Korean Won', value: 'KRW' },
                { label: 'CNY — Chinese Yuan', value: 'CNY' },
                { label: 'PLN — Polish Zloty', value: 'PLN' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'issueDate',
                  type: 'date',
                  required: true,
                  defaultValue: () => new Date().toISOString(),
                  admin: {
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' },
                    width: '50%',
                  },
                },
                {
                  name: 'dueDate',
                  type: 'date',
                  required: true,
                  index: true,
                  admin: {
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' },
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'notes',
              type: 'textarea',
              admin: {
                placeholder: 'Payment terms, thank you message, or additional notes...',
                description: 'Appears at the bottom of the invoice.',
              },
            },
          ],
        },
        {
          label: 'Financials',
          description: 'Subtotal, tax, discount, and total calculations.',
          fields: [
            {
              name: 'subtotal',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Auto-calculated: sum of all line item amounts',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'taxRate',
                  type: 'number',
                  min: 0,
                  max: 100,
                  admin: { placeholder: '0', width: '25%' },
                },
                {
                  name: 'taxLabel',
                  type: 'text',
                  admin: { placeholder: 'e.g. GST, VAT, Sales Tax', width: '25%' },
                },
                {
                  name: 'taxAmount',
                  type: 'number',
                  admin: {
                    readOnly: true,
                    width: '25%',
                    description: 'Auto-calculated from tax rate',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'discountType',
                  type: 'select',
                  options: [
                    { label: 'Percentage', value: 'percentage' },
                    { label: 'Fixed Amount', value: 'fixed' },
                  ],
                  admin: { width: '25%' },
                },
                {
                  name: 'discountValue',
                  type: 'number',
                  min: 0,
                  admin: { placeholder: '0', width: '25%' },
                },
                {
                  name: 'discountAmount',
                  type: 'number',
                  admin: {
                    readOnly: true,
                    width: '25%',
                    description: 'Auto-calculated from discount type and value',
                  },
                },
              ],
            },
            {
              name: 'total',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Auto-calculated: subtotal - discount + tax',
              },
            },
          ],
        },
        {
          label: 'Payment',
          description: 'Payment link, gateway details, and payment status.',
          fields: [
            {
              name: 'paidAt',
              type: 'date',
              admin: {
                readOnly: true,
                date: { pickerAppearance: 'dayAndTime' },
                description: 'Set automatically when payment is received.',
              },
            },
            {
              name: 'paidVia',
              type: 'select',
              options: [
                { label: 'Stripe', value: 'stripe' },
                { label: 'PayPal', value: 'paypal' },
              ],
              admin: {
                readOnly: true,
                description: 'Payment gateway used.',
              },
            },
            {
              name: 'stripePaymentIntentId',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Stripe payment intent ID for reconciliation.',
              },
            },
            {
              name: 'paypalOrderId',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'PayPal order ID for reconciliation.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Invoice lifecycle status.',
      },
    },
    {
      name: 'paymentLink',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-generated slug for the public payment page.',
      },
    },
    {
      name: 'invoiceNumber',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated: INV-YYYY-XXXX (per-user serialized).',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-set to the user who created this invoice.',
      },
    },
  ],
}
