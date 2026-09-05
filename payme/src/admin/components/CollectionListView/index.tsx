import type { ListViewServerProps } from 'payload'

import { CollectionListViewClient } from './CollectionListViewClient'

export function CollectionListView(props: ListViewServerProps) {
  const {
    collectionSlug,
    columnState,
    hasCreatePermission,
    newDocumentURL,
    BeforeList,
    renderedFilters,
    resolvedFilterOptions,
    listMenuItems,
  } = props

  return (
    <CollectionListViewClient
      collectionSlug={collectionSlug}
      columnState={columnState}
      hasCreatePermission={hasCreatePermission}
      newDocumentURL={newDocumentURL}
      BeforeList={BeforeList}
      renderedFilters={renderedFilters}
      resolvedFilterOptions={resolvedFilterOptions}
      listMenuItems={listMenuItems}
    />
  )
}
