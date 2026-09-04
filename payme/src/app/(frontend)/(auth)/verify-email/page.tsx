import { AuthLayout } from '@/components/layouts/AuthLayout'
import { VerifyEmailStatus } from '@/components/auth/VerifyEmailStatus'

export default function VerifyEmailPage() {
  return (
    <AuthLayout variant="verify-email">
      <VerifyEmailStatus />
    </AuthLayout>
  )
}
