'use client'

import { useAuth } from '@/hooks/use-auth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">
        Welcome back, {user?.firstName || 'there'}!
      </h1>
      <p className="text-muted-foreground">
        This is your dashboard. Invoices, payment links, and more coming soon.
      </p>
    </div>
  )
}
