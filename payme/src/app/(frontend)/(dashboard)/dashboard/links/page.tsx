'use client'

import { Link2 } from 'lucide-react'
import { usePageHeader } from '@/hooks/use-page-header'
import { ComingSoon } from '@/components/coming-soon'

export default function PaymentLinksPage() {
  usePageHeader({ title: 'Payment Links', subtitle: 'Share links to collect payments' })

  return (
    <ComingSoon
      title="Payment Links"
      description="Generate shareable payment links for quick and easy collection. No invoice needed."
      icon={Link2}
    />
  )
}
