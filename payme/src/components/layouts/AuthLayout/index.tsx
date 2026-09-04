import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel'
import './styles.css'

type HeroVariant = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'

interface AuthLayoutProps {
  children: React.ReactNode
  variant?: HeroVariant
}

export function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__card">
        <div className="auth-layout__form-column">
          <div className="auth-layout__header">
            <Link href="/" className="auth-layout__logo">
              <img src="/logo-icon.svg" alt="" className="auth-layout__logo-icon" />
              PayMe
            </Link>
            <ThemeToggle />
          </div>
          <div className="auth-layout__body">
            <div className="auth-layout__content">
              {children}
            </div>
          </div>
        </div>
        <AuthHeroPanel variant={variant} />
      </div>
    </div>
  )
}
