'use client'

import React, { createContext, useContext } from 'react'

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

export function AdminProvider({ children }: { children: React.ReactNode }) {
  return (
    <BrandContext.Provider value={defaultBrand}>
      {children}
    </BrandContext.Provider>
  )
}
