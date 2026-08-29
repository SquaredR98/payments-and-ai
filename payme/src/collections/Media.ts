import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    components: {
      beforeList: ['/admin/components/ListCreateButton/index#ListCreateButton'],
      edit: {
        SaveButton: '/admin/components/SidebarSave/index#SidebarSave',
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
