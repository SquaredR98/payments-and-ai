'use client'

import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePageHeader } from '@/hooks/use-page-header'
import { ComingSoon } from '@/components/coming-soon'

export default function DashboardPage() {
  const { user } = useAuth()
  usePageHeader({ title: 'Dashboard', subtitle: `Welcome back, ${user?.firstName || 'there'}!` })

  return (
    <ComingSoon
      title="Dashboard"
      description="Your overview with stats, recent activity, and quick actions will live here."
      icon={LayoutDashboard}
    />
  )
}
