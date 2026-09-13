'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface PageHeaderState {
  title: string
  subtitle?: string
}

interface PageHeaderContextValue {
  header: PageHeaderState | null
  setHeader: (state: PageHeaderState | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderState | null>(null)

  const setHeader = useCallback((state: PageHeaderState | null) => {
    setHeaderState(state)
  }, [])

  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeaderContext() {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeaderContext must be used within a PageHeaderProvider')
  }
  return context
}
