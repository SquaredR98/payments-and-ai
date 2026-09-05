'use client'

type Props = {
  doc: Record<string, any> | null
  isEditing: boolean
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' — ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatID(id: number | string | null | undefined): string {
  if (!id) return '—'
  return `usr_${String(id).padStart(8, '0')}`
}

export function EditViewSidebar({ doc, isEditing }: Props) {
  if (!isEditing || !doc) return null

  const fields = [
    { label: 'ID', value: formatID(doc.id) },
    { label: 'Created At', value: formatDate(doc.createdAt) },
    { label: 'Updated At', value: formatDate(doc.updatedAt) },
    { label: 'Invoices Sent', value: '—' },
  ]

  return (
    <div className="edit-sidebar">
      <h2 className="edit-sidebar__heading">Metadata</h2>
      <div className="edit-sidebar__fields">
        {fields.map((field) => (
          <div key={field.label} className="edit-sidebar__field">
            <span className="edit-sidebar__label">{field.label}</span>
            <span className="edit-sidebar__value">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
