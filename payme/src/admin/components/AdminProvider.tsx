'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

// ── Brand Context ────────────────────────────────────────────
interface AdminBrandContext {
  brandName: string
  brandColor: string
  brandColorMuted: string
}

const defaultBrand: AdminBrandContext = {
  brandName: 'PayMe',
  brandColor: '#2563eb',
  brandColorMuted: 'rgba(37, 99, 235, 0.08)',
}

const BrandContext = createContext<AdminBrandContext>(defaultBrand)

export const useAdminBrand = () => useContext(BrandContext)

// ── Document Bridge Context ─────────────────────────────────
// Bridges reactive document data from inside DocumentInfoProvider
// (edit view) to components outside of it (AppActions header).

export interface DocumentBridgeState {
  collectionSlug?: string
  id?: string | number
  isEditing?: boolean
  data?: Record<string, any>
}

interface DocumentBridgeContextValue {
  state: DocumentBridgeState
  setState: (state: DocumentBridgeState) => void
}

const DocumentBridgeContext = createContext<DocumentBridgeContextValue>({
  state: {},
  setState: () => {},
})

/** Read document bridge state (for consumers like AppActions) */
export const useDocumentBridge = () => useContext(DocumentBridgeContext).state

/** Write document bridge state (for producers like DocumentBridge) */
export const useSetDocumentBridge = () => useContext(DocumentBridgeContext).setState

// ── Provider ─────────────────────────────────────────────────
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [docBridgeState, setDocBridgeState] = useState<DocumentBridgeState>({})

  const setState = useCallback((next: DocumentBridgeState) => {
    setDocBridgeState((prev) => {
      // Avoid re-renders if nothing changed
      if (
        prev.collectionSlug === next.collectionSlug &&
        prev.id === next.id &&
        prev.isEditing === next.isEditing &&
        prev.data === next.data
      ) {
        return prev
      }
      return next
    })
  }, [])

  return (
    <BrandContext.Provider value={defaultBrand}>
      <DocumentBridgeContext.Provider value={{ state: docBridgeState, setState }}>
        {children}
      </DocumentBridgeContext.Provider>
    </BrandContext.Provider>
  )
}
