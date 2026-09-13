'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

import type { FilterableField, FilterRow, Operator } from './types'
import { OPERATORS_BY_TYPE, operatorNeedsValue, buildWhereClause } from './types'
import { CustomSelect } from './CustomSelect'
import './styles.css'

interface FilterBuilderProps {
  fields: FilterableField[]
  onApply: (where: Record<string, unknown>) => void
  onClear: () => void
}

let nextId = 0
function createRow(): FilterRow {
  return { id: `filter-${++nextId}`, field: '', operator: 'contains', value: '' }
}

export function FilterBuilder({ fields, onApply, onClear }: FilterBuilderProps) {
  const [rows, setRows] = useState<FilterRow[]>([createRow()])

  const fieldOptions = fields.map((f) => ({ label: f.label, value: f.name }))

  function updateRow(id: string, updates: Partial<FilterRow>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const updated = { ...r, ...updates }
        if (updates.field) {
          const fieldConfig = fields.find((f) => f.name === updates.field)
          if (fieldConfig) {
            const validOps = OPERATORS_BY_TYPE[fieldConfig.type]
            updated.operator = validOps[0].value
            updated.value = ''
          }
        }
        if (updates.operator && !operatorNeedsValue(updates.operator)) {
          updated.value = ''
        }
        return updated
      }),
    )
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id)
      return next.length === 0 ? [createRow()] : next
    })
  }

  function addRow() {
    setRows((prev) => [...prev, createRow()])
  }

  function handleApply() {
    const where = buildWhereClause(rows)
    onApply(where)
  }

  function handleClear() {
    setRows([createRow()])
    onClear()
  }

  function getFieldConfig(name: string): FilterableField | undefined {
    return fields.find((f) => f.name === name)
  }

  return (
    <div className="filter-builder">
      <div className="filter-builder__rows">
        {rows.map((row, index) => {
          const fieldConfig = getFieldConfig(row.field)
          const operators = fieldConfig
            ? OPERATORS_BY_TYPE[fieldConfig.type].map((op) => ({ label: op.label, value: op.value }))
            : []
          const needsValue = operatorNeedsValue(row.operator)

          return (
            <div key={row.id} className="filter-builder__row">
              {index > 0 && <span className="filter-builder__conjunction">AND</span>}

              <div className="filter-builder__inputs">
                {/* Field selector */}
                <CustomSelect
                  options={fieldOptions}
                  value={row.field}
                  onChange={(val) => updateRow(row.id, { field: val })}
                  placeholder="Select field..."
                  className="filter-builder__field-select"
                />

                {/* Operator selector */}
                {row.field && (
                  <CustomSelect
                    options={operators}
                    value={row.operator}
                    onChange={(val) => updateRow(row.id, { operator: val as Operator })}
                    placeholder="Operator..."
                    className="filter-builder__operator-select"
                  />
                )}

                {/* Value input */}
                {row.field && needsValue && (
                  <>
                    {fieldConfig?.type === 'select' && fieldConfig.options ? (
                      <CustomSelect
                        options={fieldConfig.options}
                        value={row.value}
                        onChange={(val) => updateRow(row.id, { value: val })}
                        placeholder="Select..."
                        className="filter-builder__value-select"
                      />
                    ) : fieldConfig?.type === 'date' ? (
                      <input
                        className="filter-builder__input"
                        type="date"
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      />
                    ) : (
                      <input
                        className="filter-builder__input"
                        type={fieldConfig?.type === 'number' ? 'number' : 'text'}
                        placeholder="Value..."
                        value={row.value}
                        onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      />
                    )}
                  </>
                )}

                {/* Remove button */}
                <button
                  className="filter-builder__remove"
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove filter"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      <div className="filter-builder__footer">
        <button
          className="filter-builder__add"
          type="button"
          onClick={addRow}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add filter
        </button>

        <div className="filter-builder__actions">
          <button
            className="filter-builder__clear"
            type="button"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="filter-builder__apply"
            type="button"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
