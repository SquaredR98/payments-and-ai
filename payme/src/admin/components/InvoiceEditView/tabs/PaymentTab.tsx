'use client'

import type { DateFieldClient, SelectFieldClient, TextFieldClient } from 'payload'
import { TextField, SelectField, DateTimeField } from '@payloadcms/ui'

type Props = {
  schemaPrefix: string
}

export function PaymentTab({ schemaPrefix }: Props) {
  return (
    <div className="invoice-edit__fields">
      <h3 className="invoice-edit__section-title">Payment Status</h3>
      <div className="invoice-edit__row">
        <DateTimeField
          field={
            {
              name: 'paidAt',
              label: 'Paid At',
              type: 'date',
              admin: {
                readOnly: true,
                date: { pickerAppearance: 'dayAndTime' },
                description: 'Set automatically when payment is received.',
              },
            } as DateFieldClient
          }
          path="paidAt"
          schemaPath={`${schemaPrefix}.paidAt`}
        />
        <SelectField
          field={
            {
              name: 'paidVia',
              label: 'Paid Via',
              type: 'select',
              options: [
                { label: 'Stripe', value: 'stripe' },
                { label: 'PayPal', value: 'paypal' },
              ],
              admin: { readOnly: true, description: 'Payment gateway used.' },
            } as SelectFieldClient
          }
          path="paidVia"
          schemaPath={`${schemaPrefix}.paidVia`}
        />
      </div>

      <h3 className="invoice-edit__section-title invoice-edit__section-title--spaced">
        Gateway References
      </h3>
      <TextField
        field={
          {
            name: 'stripePaymentIntentId',
            label: 'Stripe Payment Intent ID',
            type: 'text',
            admin: {
              readOnly: true,
              description: 'Stripe payment intent ID for reconciliation.',
            },
          } as TextFieldClient
        }
        path="stripePaymentIntentId"
        schemaPath={`${schemaPrefix}.stripePaymentIntentId`}
      />
      <TextField
        field={
          {
            name: 'paypalOrderId',
            label: 'PayPal Order ID',
            type: 'text',
            admin: {
              readOnly: true,
              description: 'PayPal order ID for reconciliation.',
            },
          } as TextFieldClient
        }
        path="paypalOrderId"
        schemaPath={`${schemaPrefix}.paypalOrderId`}
      />
    </div>
  )
}
