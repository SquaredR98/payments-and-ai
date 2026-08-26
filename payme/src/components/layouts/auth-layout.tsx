import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      {/* Theme toggle in top-right corner */}
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo & heading */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link href="/">
            <img src="/logo-icon.svg" alt="PayMe" className="h-10 w-10" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-center text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Card content */}
        {children}
      </div>
    </div>
  )
}
