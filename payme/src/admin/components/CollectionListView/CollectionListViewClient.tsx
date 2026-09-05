'use client'

import type { ListViewClientProps } from 'payload'
import { TableColumnsProvider, useConfig } from '@payloadcms/ui'

import { CollectionListControls } from '../ListControls'
import { DataTable } from '../DataTable'

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

export function CollectionListViewClient(props: Props) {
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
          <DataTable />
        </TableColumnsProvider>
      </div>
    </div>
  )
}
