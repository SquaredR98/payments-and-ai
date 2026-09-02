import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { AuthProvider } from '@/providers/auth-provider'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  // Unauthenticated users must sign in first
  if (!user) {
    redirect('/login')
  }

  return (
    <AuthProvider initialUser={user}>
      <DashboardLayout user={user}>{children}</DashboardLayout>
    </AuthProvider>
  )
}
