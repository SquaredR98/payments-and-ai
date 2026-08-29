import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { env } from './lib/env'
import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    theme: 'all',
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '/admin/graphics/Logo',
        Icon: '/admin/graphics/Icon',
      },
      Nav: '/admin/components/Nav/index#AdminNav',
      actions: ['/admin/components/AppActions/index#AppActions'],
      providers: ['/admin/components/AdminProvider#AdminProvider'],
      beforeDashboard: ['/admin/components/Dashboard/index#AdminDashboard'],
      beforeLogin: ['/admin/components/LoginBranding/index#LoginBranding'],
      afterLogin: ['/admin/components/LoginFooter/index#LoginFooter'],
      views: {
        createFirstUser: {
          Component: '/admin/components/CreateFirstUser/index#CreateFirstUser',
        },
      },
    },
    dashboard: {
      widgets: [
        {
          slug: 'quick-access',
          Component: '/admin/components/QuickAccess/index#QuickAccess',
          minWidth: 'full',
          maxWidth: 'full',
        },
      ],
      defaultLayout: [
        { widgetSlug: 'quick-access', width: 'full' as const },
      ],
    },
    meta: {
      titleSuffix: ' — PayMe Admin',
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/logo-icon.svg',
        },
      ],
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [],
})
