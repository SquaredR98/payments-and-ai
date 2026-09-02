import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  // Authenticated users have no reason to see auth pages
  if (user) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
