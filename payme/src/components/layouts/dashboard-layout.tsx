'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Link2,
  CreditCard,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { label: 'Payment Links', href: '/dashboard/links', icon: Link2 },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
]

const bottomItems = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  user: { email: string; firstName?: string | null }
}

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: (typeof navItems)[0]
  pathname: string
  onClick?: () => void
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + '/')
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <item.icon className="size-4" />
      {item.label}
    </Link>
  )
}

function SidebarContent({
  pathname,
  onLinkClick,
}: {
  pathname: string
  onLinkClick?: () => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-icon.svg" alt="" className="h-7 w-7" />
          <span className="text-base font-bold tracking-tight">PayMe</span>
        </Link>
      </div>

      <Separator />

      {/* Main nav */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onLinkClick}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 px-3 pb-3">
        <Separator className="mb-3" />
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onLinkClick}
          />
        ))}
      </div>
    </>
  )
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="relative flex h-full w-60 flex-col border-r bg-sidebar shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close menu</span>
            </Button>
            <SidebarContent
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-lg">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          <span className="text-sm text-muted-foreground">
            {user.firstName || user.email}
          </span>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
