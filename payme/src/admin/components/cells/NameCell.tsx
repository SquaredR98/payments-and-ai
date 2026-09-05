'use client'

import './styles.css'

interface NameCellProps {
  cellData?: string
  rowData?: Record<string, unknown>
}

export function NameCell({ cellData, rowData }: NameCellProps) {
  const firstName = cellData || ''
  const lastName = (rowData?.lastName as string) || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return <span className="name-cell">{fullName || '—'}</span>
}
