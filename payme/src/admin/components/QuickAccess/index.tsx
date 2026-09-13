import React from 'react'
import { formatAdminURL } from 'payload/shared'
import { Users, Image, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { PayloadRequest } from 'payload'
import './styles.css'

type CollectionLink = {
  slug: string
  label: string
  icon: LucideIcon
}

const collections: CollectionLink[] = [
  { slug: 'users', label: 'Users', icon: Users },
  { slug: 'media', label: 'Media', icon: Image },
]

export async function QuickAccess({ req }: { req: PayloadRequest }) {
  const adminRoute = req.payload.config.routes.admin

  return (
    <div className="quick-access">
      <h4 className="quick-access__heading">Quick Access</h4>
      <div className="quick-access__list">
        {collections.map(({ slug, label, icon: Icon }) => {
          const href = formatAdminURL({ adminRoute, path: `/collections/${slug}` })
          const createHref = formatAdminURL({ adminRoute, path: `/collections/${slug}/create` })

          return (
            <div key={slug} className="quick-access__item">
              <a href={href} className="quick-access__link">
                <span className="quick-access__icon">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <span className="quick-access__label">{label}</span>
              </a>
              <a
                href={createHref}
                className="quick-access__create"
                title={`Create new ${label.toLowerCase()}`}
              >
                <Plus size={14} strokeWidth={2} />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
