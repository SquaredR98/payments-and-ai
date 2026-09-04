import { AuthLayout } from '@/components/layouts/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <AuthLayout variant="reset-password">
      <ResetPasswordForm />
    </AuthLayout>
  )
}
