import type { AdminViewServerProps } from 'payload'
import { PaymentEditViewClient } from './PaymentEditViewClient'
import './styles.css'

type EditViewProps = AdminViewServerProps & {
  doc: Record<string, any> | null
  formState: Record<string, any>
}

export function PaymentEditView(props: EditViewProps) {
  const { doc, initPageResult } = props
  const { docID } = initPageResult

  return <PaymentEditViewClient doc={doc} isEditing={!!docID} />
}
