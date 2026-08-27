'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth, useConfig, Link } from '@payloadcms/ui'
import { Sun, Moon, Plus, Upload, BookOpen } from 'lucide-react'
import { formatAdminURL } from 'payload/shared'
import './styles.css'

// Map route segments to page titles
function getPageTitle(pathname: string, adminRoute: string): { title: string; description?: string } {
  const path = pathname.replace(adminRoute, '').replace(/^\//, '')

  if (!path || path === '/') {
    return { title: 'Dashboard', description: 'Overview of your PayMe admin.' }
  }

  // /collections/users/create
  if (path.match(/^collections\/(\w[\w-]*)\/create$/)) {
    const slug = path.split('/')[1]
    return { title: `New ${slugToLabel(slug, true)}` }
  }

  // /collections/users/:id
  if (path.match(/^collections\/(\w[\w-]*)\/[\w-]+$/)) {
    const slug = path.split('/')[1]
    return { title: `Edit ${slugToLabel(slug, true)}` }
  }

  // /collections/users
  if (path.match(/^collections\/(\w[\w-]*)$/)) {
    const slug = path.split('/')[1]
    return { title: slugToLabel(slug), description: collectionDescriptions[slug] }
  }

  // /globals/:slug
  if (path.match(/^globals\/(\w[\w-]*)$/)) {
    const slug = path.split('/')[1]
    return { title: slugToLabel(slug) }
  }

  // /account
  if (path === 'account') {
    return { title: 'Account' }
  }

  return { title: 'Admin' }
}

// Descriptions shown in the topbar for collection list pages
const collectionDescriptions: Record<string, string> = {
  users: 'Manage registered users, roles, and account status.',
  media: 'Upload and manage images, documents, and files.',
}

function slugToLabel(slug: string, singular = false): string {
  const label = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  if (singular && label.endsWith('s') && label.length > 1) {
    return label.slice(0, -1)
  }

  return label
}

export function AppActions() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { config } = useConfig()
  const { routes: { admin: adminRoute } } = config

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    setIsDark(!isDark)
  }

  const isDashboard =
    pathname === adminRoute ||
    pathname === `${adminRoute}/` ||
    pathname === adminRoute + ''

  const { title, description } = isDashboard
    ? {
        title: `Welcome back, ${(user as { firstName?: string })?.firstName || (user as { email?: string })?.email || 'Admin'}`,
        description: "Here's your PayMe admin overview.",
      }
    : getPageTitle(pathname, adminRoute)

  return (
    <div className="topbar">
      {/* Page title / welcome message */}
      <div className="topbar__title-group">
        <h1 className="topbar__title">{title}</h1>
        {description && <p className="topbar__subtitle">{description}</p>}
      </div>

      {/* Right side: quick actions + theme toggle */}
      <div className="topbar__actions">
        <Link
          href={formatAdminURL({ adminRoute, path: '/collections/users/create' })}
          prefetch={false}
          title="New User"
          className="topbar__icon-btn"
        >
          <Plus size={15} strokeWidth={1.75} />
        </Link>
        <Link
          href={formatAdminURL({ adminRoute, path: '/collections/media/create' })}
          prefetch={false}
          title="Upload Media"
          className="topbar__icon-btn"
        >
          <Upload size={15} strokeWidth={1.75} />
        </Link>
        <a
          href="https://payloadcms.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          title="View Docs"
          className="topbar__icon-btn"
        >
          <BookOpen size={15} strokeWidth={1.75} />
        </a>

        {/* Separator */}
        <div className="topbar__separator" />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="topbar__icon-btn"
        >
          {isDark ? <Moon size={15} strokeWidth={1.75} /> : <Sun size={15} strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  )
}
