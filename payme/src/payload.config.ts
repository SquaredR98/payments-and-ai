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
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '/admin/graphics/Logo',
        Icon: '/admin/graphics/Icon',
      },
      Nav: '/admin/components/Nav#AdminNav',
      actions: ['/admin/components/AppActions#AppActions'],
      providers: ['/admin/components/AdminProvider#AdminProvider'],
      beforeDashboard: ['/admin/components/Dashboard#AdminDashboard'],
      beforeLogin: ['/admin/components/LoginBranding#LoginBranding'],
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
