import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    components: {
      edit: {
        SaveButton: '/admin/components/SidebarSave/index#SidebarSave',
      },
      views: {
        list: {
          Component: '/admin/components/CollectionListView/index#CollectionListView',
        },
      },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
