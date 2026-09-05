'use client'

import { TextField } from '@payloadcms/ui'

type Props = {
  collectionSlug: string
}

export function BusinessTab({ collectionSlug }: Props) {
  return (
    <div className="user-edit__fields">
      <TextField
        field={{
          name: 'businessName',
          label: 'Business Name',
          admin: { description: 'Appears on invoices as the sender business name.' },
        }}
        path="businessName"
        schemaPath={`${collectionSlug}.businessName`}
      />

      <TextField
        field={{
          name: 'taxId',
          label: 'Tax ID / GST / VAT Number',
          admin: { description: 'Your business tax identification number. Appears on invoices.' },
        }}
        path="taxId"
        schemaPath={`${collectionSlug}.taxId`}
      />

      <TextField
        field={{ name: 'phone', label: 'Phone' }}
        path="phone"
        schemaPath={`${collectionSlug}.phone`}
      />
    </div>
  )
}
