import type { AdminViewServerProps } from 'payload'
import { UserEditViewClient } from './UserEditViewClient'
import './styles.css'

type EditViewProps = AdminViewServerProps & {
  doc: Record<string, any> | null
  formState: Record<string, any>
}

export function UserEditView(props: EditViewProps) {
  const { doc, formState, initPageResult } = props
  const { collectionConfig, docID } = initPageResult
  const {
    routes: { api: apiRoute },
  } = initPageResult.req.payload.config

  const isEditing = !!docID

  return (
    <UserEditViewClient
      doc={doc}
      docID={docID}
      formState={formState}
      collectionSlug={collectionConfig.slug}
      apiRoute={apiRoute}
      isEditing={isEditing}
    />
  )
}
