'use client'

import { CreditCard } from 'lucide-react'
import { usePageHeader } from '@/hooks/use-page-header'
import { ComingSoon } from '@/components/coming-soon'

export default function PaymentsPage() {
  usePageHeader({ title: 'Payments', subtitle: 'Track incoming payments' })

  return (
    <ComingSoon
      title="Payments"
      description="View all incoming payments, track statuses, and manage refunds across all payment methods."
      icon={CreditCard}
    />
  )
}
