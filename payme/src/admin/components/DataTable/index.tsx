'use client'

import { useListQuery, useTableColumns } from '@payloadcms/ui'

import './styles.css'

export function DataTable() {
  const { columns } = useTableColumns()
  const { data, handleSortChange, query } = useListQuery()

  const activeColumns = columns.filter((col) => col.active)
  const rows = data?.docs || []
  const currentSort = (query?.sort as string) || ''

  function getSortState(accessor: string): 'asc' | 'desc' | 'none' {
    if (currentSort === accessor) return 'asc'
    if (currentSort === `-${accessor}`) return 'desc'
    return 'none'
  }

  function onHeaderClick(accessor: string) {
    if (!handleSortChange) return
    const current = getSortState(accessor)
    if (current === 'none') {
      handleSortChange(accessor)
    } else if (current === 'asc') {
      handleSortChange(`-${accessor}`)
    } else {
      handleSortChange('')
    }
  }

  return (
    <div className="data-table">
      <table className="data-table__table">
        <thead className="data-table__thead">
          <tr>
            {activeColumns.map((col) => {
              const sortState = getSortState(col.accessor)
              return (
                <th
                  key={col.accessor}
                  className={`data-table__th ${sortState !== 'none' ? 'data-table__th--sorted' : ''}`}
                  onClick={() => onHeaderClick(col.accessor)}
                >
                  <span className="data-table__th-label">
                    {col.CustomLabel || col.field?.label || col.accessor}
                  </span>
                  {sortState !== 'none' && (
                    <span className="data-table__th-arrow">
                      {sortState === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="data-table__tbody">
          {rows.length === 0 && (
            <tr>
              <td className="data-table__empty" colSpan={activeColumns.length}>
                No results found
              </td>
            </tr>
          )}
          {rows.map((_, rowIndex) => (
            <tr key={rowIndex} className="data-table__row">
              {activeColumns.map((col) => (
                <td key={col.accessor} className="data-table__td">
                  {col.renderedCells?.[rowIndex] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
