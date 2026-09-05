'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useListQuery, useTableColumns } from '@payloadcms/ui'

import { FilterBuilder } from './FilterBuilder'
import type { FilterableField, FieldType } from './FilterBuilder/types'
import './styles.css'

interface CollectionListControlsProps {
  hasCreatePermission?: boolean
  newDocumentURL?: string
}

function mapFieldType(field: Record<string, unknown>): FieldType {
  const type = field.type as string
  if (type === 'email') return 'email'
  if (type === 'select') return 'select'
  if (type === 'checkbox') return 'checkbox'
  if (type === 'date') return 'date'
  if (type === 'number') return 'number'
  return 'text'
}

export function CollectionListControls({
  hasCreatePermission,
  newDocumentURL,
}: CollectionListControlsProps) {
  const { handleSearchChange, handleWhereChange, query } = useListQuery()
  const { columns, toggleColumn } = useTableColumns()

  const [search, setSearch] = useState((query?.search as string) || '')
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  const columnsRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const filterableFields = useMemo<FilterableField[]>(() => {
    return columns
      .filter((col) => col.field && col.accessor !== 'id')
      .map((col) => {
        const field = col.field as Record<string, unknown>
        const options = (field.options as { label: string; value: string }[]) || undefined
        return {
          name: col.accessor,
          label: (col.field?.label as string) || col.accessor,
          type: mapFieldType(field),
          options,
        }
      })
  }, [columns])

  function onSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      handleSearchChange?.(value)
    }, 300)
  }

  function onFilterApply(where: Record<string, unknown>) {
    handleWhereChange?.(where as any)
    const andClause = (where as any)?.and
    setActiveFilterCount(Array.isArray(andClause) ? andClause.length : 0)
    setFilterOpen(false)
  }

  function onFilterClear() {
    handleWhereChange?.({} as any)
    setActiveFilterCount(0)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (columnsRef.current && !columnsRef.current.contains(target)) {
        setColumnsOpen(false)
      }
      if (filterRef.current && !filterRef.current.contains(target)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="list-controls-custom">
      {/* Search */}
      <div className="list-controls-custom__search">
        <svg
          className="list-controls-custom__search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="list-controls-custom__search-input"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="list-controls-custom__search-clear"
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="list-controls-custom__actions">
        {/* Columns toggle */}
        <div className="list-controls-custom__dropdown" ref={columnsRef}>
          <button
            className={`list-controls-custom__pill ${columnsOpen ? 'list-controls-custom__pill--active' : ''}`}
            type="button"
            onClick={() => setColumnsOpen(!columnsOpen)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Columns
          </button>

          {columnsOpen && (
            <div className="list-controls-custom__dropdown-menu">
              {columns.map((col) => (
                <button
                  key={col.accessor}
                  className={`list-controls-custom__dropdown-item ${col.active ? 'list-controls-custom__dropdown-item--active' : ''}`}
                  type="button"
                  onClick={() => toggleColumn(col.accessor)}
                >
                  <span className="list-controls-custom__dropdown-check">
                    {col.active && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="list-controls-custom__dropdown-label">
                    {col.field?.label || col.accessor}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter toggle */}
        <div className="list-controls-custom__dropdown" ref={filterRef}>
          <button
            className={`list-controls-custom__pill ${filterOpen || activeFilterCount > 0 ? 'list-controls-custom__pill--active' : ''}`}
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="list-controls-custom__pill-badge">{activeFilterCount}</span>
            )}
          </button>

          {filterOpen && (
            <div className="list-controls-custom__dropdown-menu list-controls-custom__dropdown-menu--filter">
              <FilterBuilder
                fields={filterableFields}
                onApply={onFilterApply}
                onClear={onFilterClear}
              />
            </div>
          )}
        </div>

        {/* Create button */}
        {hasCreatePermission && newDocumentURL && (
          <a
            href={newDocumentURL}
            className="list-controls-custom__create-btn"
            aria-label="Create new"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
