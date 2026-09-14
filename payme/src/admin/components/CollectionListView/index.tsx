'use client'

import type { ListViewClientProps } from 'payload'
import { RelationshipProvider, TableColumnsProvider } from '@payloadcms/ui'

import { CollectionListControls } from '../ListControls'
import { DataTable } from '../DataTable'
import { Pagination } from '../Pagination'

type Props = Pick<
  ListViewClientProps,
  | 'collectionSlug'
  | 'columnState'
  | 'hasCreatePermission'
  | 'newDocumentURL'
  | 'BeforeList'
  | 'renderedFilters'
  | 'resolvedFilterOptions'
  | 'listMenuItems'
>

export function CollectionListView(props: Props) {
  const {
    collectionSlug,
    columnState,
    hasCreatePermission,
    newDocumentURL,
    BeforeList,
  } = props

  return (
    <div className="collection-list">
      <div className="collection-list__wrap">
        {BeforeList}
        <TableColumnsProvider
          collectionSlug={collectionSlug}
          columnState={columnState}
        >
          <CollectionListControls
            hasCreatePermission={hasCreatePermission}
            newDocumentURL={newDocumentURL}
          />
          <RelationshipProvider>
            <DataTable />
          </RelationshipProvider>
          <Pagination />
        </TableColumnsProvider>
      </div>
    </div>
  )
}
