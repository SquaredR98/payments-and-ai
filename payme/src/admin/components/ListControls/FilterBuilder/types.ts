export type FieldType = 'text' | 'email' | 'select' | 'checkbox' | 'date' | 'number'

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_true'
  | 'is_false'
  | 'exists'
  | 'not_exists'

export interface FilterableField {
  name: string
  label: string
  type: FieldType
  options?: { label: string; value: string }[]
}

export interface FilterRow {
  id: string
  field: string
  operator: Operator
  value: string
}

export const OPERATORS_BY_TYPE: Record<FieldType, { value: Operator; label: string }[]> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'exists', label: 'Is set' },
    { value: 'not_exists', label: 'Is not set' },
  ],
  email: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
  ],
  checkbox: [
    { value: 'is_true', label: 'Is checked' },
    { value: 'is_false', label: 'Is unchecked' },
  ],
  date: [
    { value: 'equals', label: 'Is' },
    { value: 'greater_than', label: 'After' },
    { value: 'less_than', label: 'Before' },
    { value: 'exists', label: 'Is set' },
    { value: 'not_exists', label: 'Is not set' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
  ],
}

const NO_VALUE_OPERATORS: Operator[] = ['is_true', 'is_false', 'exists', 'not_exists']

export function operatorNeedsValue(operator: Operator): boolean {
  return !NO_VALUE_OPERATORS.includes(operator)
}

const OPERATOR_TO_PAYLOAD: Record<Operator, string> = {
  equals: 'equals',
  not_equals: 'not_equals',
  contains: 'contains',
  not_contains: 'not_contains',
  greater_than: 'greater_than',
  less_than: 'less_than',
  is_true: 'equals',
  is_false: 'equals',
  exists: 'exists',
  not_exists: 'exists',
}

export function buildWhereClause(filters: FilterRow[]): Record<string, unknown> {
  const activeFilters = filters.filter((f) => {
    if (!f.field || !f.operator) return false
    if (operatorNeedsValue(f.operator) && !f.value) return false
    return true
  })

  if (activeFilters.length === 0) return {}

  const and = activeFilters.map((f) => {
    const payloadOp = OPERATOR_TO_PAYLOAD[f.operator]
    let value: unknown = f.value

    if (f.operator === 'is_true') value = true
    if (f.operator === 'is_false') value = false
    if (f.operator === 'not_exists') value = false
    if (f.operator === 'exists') value = true

    return {
      [f.field]: {
        [payloadOp]: value,
      },
    }
  })

  return { and }
}
