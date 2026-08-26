import React from 'react'
import { EntityType, groupNavItems } from '@payloadcms/ui/shared'
import { AdminNavClient } from './NavClient'

import type { ServerProps } from 'payload'

export async function AdminNav(props: ServerProps) {
  const { payload, permissions, visibleEntities, i18n } = props

  if (!payload?.config) {
    return null
  }

  const { collections, globals } = payload.config

  // Build entity list filtered by what the user can see
  const entities = [
    ...collections
      .filter(({ slug }) => visibleEntities.collections.includes(slug))
      .map((collection) => ({
        type: EntityType.collection as const,
        entity: collection,
      })),
    ...globals
      .filter(({ slug }) => visibleEntities.globals.includes(slug))
      .map((global) => ({
        type: EntityType.global as const,
        entity: global,
      })),
  ]

  // Group by admin.group property
  const groups = groupNavItems(entities, permissions, i18n)

  // Get nav preferences (collapse state)
  let navPreferences: { groups?: Record<string, { open: boolean }> } = {}
  try {
    const prefs = await payload.find({
      collection: 'payload-preferences',
      where: {
        key: { equals: 'nav' },
      },
      depth: 0,
      limit: 1,
    })
    if (prefs.docs[0]) {
      navPreferences = (prefs.docs[0] as { value?: typeof navPreferences }).value || {}
    }
  } catch {
    // Preferences collection may not exist yet — safe to ignore
  }

  return <AdminNavClient groups={groups} navPreferences={navPreferences} />
}
