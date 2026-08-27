import React from 'react'
import { formatAdminURL } from 'payload/shared'

import type { PayloadRequest } from 'payload'
import './styles.css'

// Icon SVGs rendered inline to avoid client component dependency
// These match the Lucide icons used in the sidebar nav
const icons = {
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  media: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
}

type CollectionLink = {
  slug: string
  label: string
  icon: keyof typeof icons
}

const collections: CollectionLink[] = [
  { slug: 'users', label: 'Users', icon: 'users' },
  { slug: 'media', label: 'Media', icon: 'media' },
]

export async function QuickAccess({ req }: { req: PayloadRequest }) {
  const adminRoute = req.payload.config.routes.admin

  return (
    <div className="quick-access">
      <h4 className="quick-access__heading">Quick Access</h4>
      <div className="quick-access__list">
        {collections.map(({ slug, label, icon }) => {
          const href = formatAdminURL({ adminRoute, path: `/collections/${slug}` })
          const createHref = formatAdminURL({ adminRoute, path: `/collections/${slug}/create` })

          return (
            <div key={slug} className="quick-access__item">
              <a href={href} className="quick-access__link">
                <span className="quick-access__icon">{icons[icon]}</span>
                <span className="quick-access__label">{label}</span>
              </a>
              <a
                href={createHref}
                className="quick-access__create"
                title={`Create new ${label.toLowerCase()}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
