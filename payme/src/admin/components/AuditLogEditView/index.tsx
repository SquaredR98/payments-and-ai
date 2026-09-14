import type { AdminViewServerProps } from 'payload'
import { AuditLogEditViewClient } from './AuditLogEditViewClient'
import './styles.css'

type EditViewProps = AdminViewServerProps & {
  doc: Record<string, any> | null
  formState: Record<string, any>
}

export function AuditLogEditView(props: EditViewProps) {
  const { doc, initPageResult } = props
  const { docID } = initPageResult

  return <AuditLogEditViewClient doc={doc} isEditing={!!docID} />
}
