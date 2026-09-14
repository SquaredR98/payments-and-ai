import type { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: {
    singular: 'Audit Log',
    plural: 'Audit Logs',
  },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'entity', 'entityId', 'user', 'createdAt'],
    components: {
      views: {
        edit: {
          default: {
            Component: '/admin/components/AuditLogEditView/index#AuditLogEditView',
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
      return user.role === 'admin'
    },
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Invoice Created', value: 'invoice.created' },
        { label: 'Invoice Updated', value: 'invoice.updated' },
        { label: 'Invoice Sent', value: 'invoice.sent' },
        { label: 'Invoice Paid', value: 'invoice.paid' },
        { label: 'Invoice Cancelled', value: 'invoice.cancelled' },
        { label: 'Payment Received', value: 'payment.received' },
        { label: 'Payment Failed', value: 'payment.failed' },
        { label: 'Payment Refunded', value: 'payment.refunded' },
        { label: 'User Login', value: 'user.login' },
        { label: 'User Logout', value: 'user.logout' },
        { label: 'User Updated', value: 'user.updated' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'entity',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'Collection name: invoice, payment, or user.',
          },
        },
        {
          name: 'entityId',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'ID of the affected record.',
          },
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Who performed the action. Null for webhook/system events.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'previousData',
      type: 'json',
      admin: {
        description: 'Snapshot of data before the change.',
      },
    },
    {
      name: 'newData',
      type: 'json',
      admin: {
        description: 'Snapshot of data after the change.',
      },
    },
  ],
}
