'use client'

import { useEffect } from 'react'
import { usePageHeaderContext } from '@/contexts/page-header-context'

interface PageHeaderOptions {
  title: string
  subtitle?: string
}

export function usePageHeader({ title, subtitle }: PageHeaderOptions) {
  const { setHeader } = usePageHeaderContext()

  useEffect(() => {
    setHeader({ title, subtitle })

    return () => {
      setHeader(null)
    }
  }, [title, subtitle, setHeader])
}
