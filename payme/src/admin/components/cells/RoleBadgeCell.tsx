'use client'

interface RoleBadgeCellProps {
  cellData?: string
}

export function RoleBadgeCell({ cellData }: RoleBadgeCellProps) {
  const role = cellData || 'user'
  const isAdmin = role === 'admin'

  return (
    <span className={`badge ${isAdmin ? 'badge--brand' : 'badge--muted'}`}>
      <span className="badge__dot" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}
