'use client'

import type { ArrayFieldClient } from 'payload'
import {
  TextField,
  EmailField,
  TextareaField,
  SelectField,
  DateTimeField,
  ArrayField,
} from '@payloadcms/ui'

type Props = {
  schemaPrefix: string
}

export function DetailsTab({ schemaPrefix }: Props) {
  return (
    <div className="invoice-edit__fields">
      <h3 className="invoice-edit__section-title">Client Information</h3>
      <div className="invoice-edit__row">
        <TextField
          field={{ name: 'name', label: 'Client Name', required: true, type: 'text' }}
          path="client.name"
          schemaPath={`${schemaPrefix}.client.name`}
        />
        <EmailField
          field={{ name: 'email', label: 'Client Email', required: true, type: 'email' }}
          path="client.email"
          schemaPath={`${schemaPrefix}.client.email`}
        />
      </div>

      <div className="invoice-edit__row">
        <TextField
          field={{ name: 'phone', label: 'Phone', type: 'text' }}
          path="client.phone"
          schemaPath={`${schemaPrefix}.client.phone`}
        />
        <TextField
          field={{ name: 'taxId', label: 'Tax ID / GST / VAT', type: 'text' }}
          path="client.taxId"
          schemaPath={`${schemaPrefix}.client.taxId`}
        />
      </div>

      <TextareaField
        field={{ name: 'address', label: 'Address', type: 'textarea' }}
        path="client.address"
        schemaPath={`${schemaPrefix}.client.address`}
      />

      <h3 className="invoice-edit__section-title invoice-edit__section-title--spaced">Line Items</h3>
      <ArrayField
        field={{
          name: 'lineItems',
          label: 'Line Items',
          type: 'array',
          required: true,
          minRows: 1,
          labels: { singular: 'Line Item', plural: 'Line Items' },
          fields: [
            { name: 'description', type: 'text', required: true, label: 'Description' },
            { name: 'quantity', type: 'number', required: true, min: 1, label: 'Qty' },
            { name: 'unitPrice', type: 'number', required: true, min: 0.01, label: 'Unit Price' },
            { name: 'amount', type: 'number', label: 'Amount' },
          ],
        } as ArrayFieldClient}
        path="lineItems"
        schemaPath={`${schemaPrefix}.lineItems`}
      />

      <h3 className="invoice-edit__section-title invoice-edit__section-title--spaced">Invoice Settings</h3>
      <SelectField
        field={{
          name: 'currency',
          label: 'Currency',
          type: 'select',
          required: true,
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
        }}
        path="currency"
        schemaPath={`${schemaPrefix}.currency`}
      />

      <div className="invoice-edit__row">
        <DateTimeField
          field={{
            name: 'issueDate',
            label: 'Issue Date',
            type: 'date',
            required: true,
          }}
          path="issueDate"
          schemaPath={`${schemaPrefix}.issueDate`}
        />
        <DateTimeField
          field={{
            name: 'dueDate',
            label: 'Due Date',
            type: 'date',
            required: true,
          }}
          path="dueDate"
          schemaPath={`${schemaPrefix}.dueDate`}
        />
      </div>

      <TextareaField
        field={{ name: 'notes', label: 'Notes', type: 'textarea' }}
        path="notes"
        schemaPath={`${schemaPrefix}.notes`}
      />
    </div>
  )
}
