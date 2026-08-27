'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import './styles.css'

type Props = {
  collectionSlug: string
  hasCreatePermission: boolean
  newDocumentURL: string
}

export const ListCreateButton = ({
  hasCreatePermission,
  newDocumentURL,
}: Props) => {
  const [container, setContainer] = useState<Element | null>(null)

  useEffect(() => {
    // Find the search bar actions container to portal into
    const el = document.querySelector('.search-bar__actions')
    if (el) setContainer(el)
  }, [])

  if (!hasCreatePermission || !newDocumentURL || !container) return null

  return createPortal(
    <Link href={newDocumentURL} className="list-create-btn" aria-label="Create new">
      <span className="list-create-btn__icon">+</span>
    </Link>,
    container,
  )
}
