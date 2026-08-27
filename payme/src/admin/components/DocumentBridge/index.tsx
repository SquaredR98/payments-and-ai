'use client'

import { useEffect } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { useSetDocumentBridge } from '../AdminProvider'

/**
 * DocumentBridge — invisible component registered via `beforeDocumentControls`.
 *
 * Sits inside the DocumentInfoProvider (edit view) and pushes reactive
 * document data into the shared DocumentBridgeContext so that components
 * outside the provider tree (e.g. AppActions header) can read it.
 *
 * Renders nothing.
 */
export function DocumentBridge() {
  const { data, collectionSlug, id, isEditing } = useDocumentInfo()
  const setBridge = useSetDocumentBridge()

  useEffect(() => {
    setBridge({
      collectionSlug: collectionSlug ?? undefined,
      id,
      isEditing,
      data: data ?? undefined,
    })

    // Clear bridge state when unmounting (navigating away from edit view)
    return () => {
      setBridge({})
    }
  }, [data, collectionSlug, id, isEditing, setBridge])

  return null
}
