'use client'

import React from 'react'

const BRAND = '#2563eb'

interface RoleBadgeCellProps {
  cellData?: string
}

export function RoleBadgeCell({ cellData }: RoleBadgeCellProps) {
  const role = cellData || 'user'
  const isAdmin = role === 'admin'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        background: isAdmin ? 'rgba(37, 99, 235, 0.1)' : 'var(--theme-elevation-150)',
        color: isAdmin ? BRAND : 'var(--theme-elevation-600)',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isAdmin ? BRAND : 'var(--theme-elevation-400)',
        }}
      />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}
