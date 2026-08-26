import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

interface PublicLayoutProps {
  children: React.ReactNode
  user?: { email: string } | null
}

export function PublicLayout({ children, user }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* --- Public Nav --- */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-icon.svg" alt="" className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight">PayMe</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1">{children}</main>

      {/* --- Footer --- */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} PayMe. All rights reserved.</p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
