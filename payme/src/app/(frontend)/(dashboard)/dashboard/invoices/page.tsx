'use client'

import { FileText } from 'lucide-react'
import { usePageHeader } from '@/hooks/use-page-header'
import { ComingSoon } from '@/components/coming-soon'

export default function InvoicesPage() {
  usePageHeader({ title: 'Invoices', subtitle: 'Create and manage invoices' })

  return (
    <ComingSoon
      title="Invoices"
      description="Create, send, and track invoices for your clients. Manage payment status and send reminders."
      icon={FileText}
    />
  )
}
