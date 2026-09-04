import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import './styles.css'

interface AuthAlertProps {
  variant: 'success' | 'error'
  children: React.ReactNode
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
}

export function AuthAlert({ variant, children }: AuthAlertProps) {
  const Icon = icons[variant]

  return (
    <div className={cn('auth-alert', `auth-alert--${variant}`)}>
      <Icon className="auth-alert__icon" />
      {children}
    </div>
  )
}
