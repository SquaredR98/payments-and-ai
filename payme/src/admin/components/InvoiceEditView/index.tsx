import type { AdminViewServerProps } from 'payload'
import { InvoiceEditViewClient } from './InvoiceEditViewClient'
import './styles.css'

type EditViewProps = AdminViewServerProps & {
  doc: Record<string, any> | null
  formState: Record<string, any>
}

export function InvoiceEditView(props: EditViewProps) {
  const { doc, formState, initPageResult } = props
  const { collectionConfig, docID } = initPageResult
  const {
    routes: { api: apiRoute },
  } = initPageResult.req.payload.config

  const isEditing = !!docID

  return (
    <InvoiceEditViewClient
      doc={doc}
      docID={docID ?? null}
      formState={formState}
      collectionSlug={collectionConfig!.slug}
      apiRoute={apiRoute}
      isEditing={isEditing}
    />
  )
}
