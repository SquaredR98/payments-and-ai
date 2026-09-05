'use client'

import { TextField, SelectField } from '@payloadcms/ui'

type Props = {
  collectionSlug: string
}

export function AddressTab({ collectionSlug }: Props) {
  return (
    <div className="user-edit__fields">
      <TextField
        field={{ name: 'street', label: 'Street' }}
        path="address.street"
        schemaPath={`${collectionSlug}.address.street`}
      />

      <div className="user-edit__row">
        <TextField
          field={{ name: 'city', label: 'City' }}
          path="address.city"
          schemaPath={`${collectionSlug}.address.city`}
        />
        <TextField
          field={{ name: 'state', label: 'State' }}
          path="address.state"
          schemaPath={`${collectionSlug}.address.state`}
        />
      </div>

      <div className="user-edit__row">
        <TextField
          field={{ name: 'zip', label: 'ZIP / Postal Code' }}
          path="address.zip"
          schemaPath={`${collectionSlug}.address.zip`}
        />
        <SelectField
          field={{
            name: 'country',
            label: 'Country',
            options: [
              { label: 'United States', value: 'US' },
              { label: 'United Kingdom', value: 'GB' },
              { label: 'Canada', value: 'CA' },
              { label: 'Australia', value: 'AU' },
              { label: 'India', value: 'IN' },
              { label: 'Germany', value: 'DE' },
              { label: 'France', value: 'FR' },
              { label: 'Japan', value: 'JP' },
              { label: 'Brazil', value: 'BR' },
              { label: 'Other', value: 'OTHER' },
            ],
          }}
          path="address.country"
          schemaPath={`${collectionSlug}.address.country`}
        />
      </div>
    </div>
  )
}
