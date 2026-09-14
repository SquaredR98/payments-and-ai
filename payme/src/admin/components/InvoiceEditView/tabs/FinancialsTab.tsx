'use client'

import type { NumberFieldClient, SelectFieldClient } from 'payload'
import { NumberField, TextField, SelectField } from '@payloadcms/ui'

type Props = {
  collectionSlug: string
}

export function FinancialsTab({ collectionSlug }: Props) {
  return (
    <div className="invoice-edit__fields">
      <h3 className="invoice-edit__section-title">Totals</h3>
      <NumberField
        field={
          {
            name: 'subtotal',
            label: 'Subtotal',
            type: 'number',
            admin: { readOnly: true, description: 'Auto-calculated: sum of all line item amounts' },
          } as NumberFieldClient
        }
        path="subtotal"
        schemaPath={`${collectionSlug}.subtotal`}
      />

      <h3 className="invoice-edit__section-title invoice-edit__section-title--spaced">Tax</h3>
      <div className="invoice-edit__row invoice-edit__row--3col">
        <NumberField
          field={{ name: 'taxRate', label: 'Tax Rate (%)', type: 'number', min: 0, max: 100 }}
          path="taxRate"
          schemaPath={`${collectionSlug}.taxRate`}
        />
        <TextField
          field={{ name: 'taxLabel', label: 'Tax Label', type: 'text' }}
          path="taxLabel"
          schemaPath={`${collectionSlug}.taxLabel`}
        />
        <NumberField
          field={
            {
              name: 'taxAmount',
              label: 'Tax Amount',
              type: 'number',
              admin: { readOnly: true, description: 'Auto-calculated from tax rate' },
            } as NumberFieldClient
          }
          path="taxAmount"
          schemaPath={`${collectionSlug}.taxAmount`}
        />
      </div>

      <h3 className="invoice-edit__section-title invoice-edit__section-title--spaced">Discount</h3>
      <div className="invoice-edit__row invoice-edit__row--3col">
        <SelectField
          field={
            {
              name: 'discountType',
              label: 'Discount Type',
              type: 'select',
              options: [
                { label: 'Percentage', value: 'percentage' },
                { label: 'Fixed Amount', value: 'fixed' },
              ],
            } as SelectFieldClient
          }
          path="discountType"
          schemaPath={`${collectionSlug}.discountType`}
        />
        <NumberField
          field={{ name: 'discountValue', label: 'Discount Value', type: 'number', min: 0 }}
          path="discountValue"
          schemaPath={`${collectionSlug}.discountValue`}
        />
        <NumberField
          field={
            {
              name: 'discountAmount',
              label: 'Discount Amount',
              type: 'number',
              admin: { readOnly: true, description: 'Auto-calculated from discount type and value' },
            } as NumberFieldClient
          }
          path="discountAmount"
          schemaPath={`${collectionSlug}.discountAmount`}
        />
      </div>

      <div className="invoice-edit__total-row">
        <NumberField
          field={
            {
              name: 'total',
              label: 'Total',
              type: 'number',
              admin: { readOnly: true, description: 'Auto-calculated: subtotal - discount + tax' },
            } as NumberFieldClient
          }
          path="total"
          schemaPath={`${collectionSlug}.total`}
        />
      </div>
    </div>
  )
}
