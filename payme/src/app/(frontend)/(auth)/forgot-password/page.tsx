import { AuthLayout } from '@/components/layouts/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout variant="forgot-password">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
