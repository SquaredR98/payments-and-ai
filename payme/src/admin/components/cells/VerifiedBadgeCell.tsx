'use client'

import './styles.css'

interface VerifiedBadgeCellProps {
  cellData?: boolean
}

export function VerifiedBadgeCell({ cellData }: VerifiedBadgeCellProps) {
  const verified = Boolean(cellData)

  return (
    <span className={`badge ${verified ? 'badge--success' : 'badge--muted'}`}>
      <span className="badge__dot" />
      {verified ? 'Verified' : 'Unverified'}
    </span>
  )
}
