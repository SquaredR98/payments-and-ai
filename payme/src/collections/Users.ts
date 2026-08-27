import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 604800, // 7 days in seconds
    verify: true, // Enable email verification — sends a verification email on registration
    maxLoginAttempts: 5, // Lock account after 5 failed login attempts
    lockTime: 600 * 1000, // 10 minutes lockout in milliseconds
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', '_verified'],
    components: {
      beforeList: ['/admin/components/ListCreateButton/index#ListCreateButton'],
      edit: {
        beforeDocumentControls: ['/admin/components/DocumentBridge/index#DocumentBridge'],
      },
    },
  },
  access: {
    // Anyone can create an account (registration is public)
    create: () => true,

    // Users can read their own profile, admins can read all
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      // Returning a where-clause object: filters queries to only this user's record
      return { id: { equals: user.id } }
    },

    // Users can update their own profile only
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },

    // Only admins can delete users
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    // --- Tabbed Layout ---
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          description: 'Personal information and contact details.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'firstName',
                  type: 'text',
                  required: true,
                  minLength: 1,
                  maxLength: 100,
                  admin: {
                    placeholder: 'John',
                  },
                },
                {
                  name: 'lastName',
                  type: 'text',
                  required: true,
                  minLength: 1,
                  maxLength: 100,
                  admin: {
                    placeholder: 'Doe',
                  },
                },
              ],
            },
            {
              name: 'phone',
              type: 'text',
              admin: {
                placeholder: '+1 (555) 123-4567',
              },
            },
          ],
        },
        {
          label: 'Business',
          description: 'Business details that appear on your invoices.',
          fields: [
            {
              name: 'businessName',
              type: 'text',
              maxLength: 200,
              admin: {
                placeholder: 'Acme Inc.',
                description: 'Appears on invoices as the sender business name.',
              },
            },
            {
              name: 'taxId',
              type: 'text',
              label: 'Tax ID / GST / VAT Number',
              admin: {
                placeholder: 'e.g. 12-3456789',
                description:
                  'Your business tax identification number. Appears on invoices.',
              },
            },
          ],
        },
        {
          label: 'Address',
          description: 'Business address for invoices and correspondence.',
          fields: [
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  admin: {
                    placeholder: '123 Main Street',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'city',
                      type: 'text',
                      admin: {
                        placeholder: 'San Francisco',
                      },
                    },
                    {
                      name: 'state',
                      type: 'text',
                      admin: {
                        placeholder: 'CA',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'zip',
                      type: 'text',
                      label: 'ZIP / Postal Code',
                      admin: {
                        placeholder: '94102',
                      },
                    },
                    {
                      name: 'country',
                      type: 'select',
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
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // --- Sidebar Fields ---
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        // Only admins can change roles — regular users can see but not modify
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        position: 'sidebar',
        description: 'User role. Only admins can modify this.',
        components: {
          Cell: '/admin/components/cells/RoleBadgeCell#RoleBadgeCell',
        },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description:
          'Your business logo. Appears on invoices and payment pages. Max 2MB, JPG/PNG only.',
      },
    },

    // Override the auto-generated _verified field to add a custom Cell
    {
      name: '_verified',
      type: 'checkbox',
      admin: {
        components: {
          Field: false,
          Cell: '/admin/components/cells/VerifiedBadgeCell#VerifiedBadgeCell',
        },
      },
    },
  ],
}
