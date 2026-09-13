'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  label: string
  value: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`filter-select ${className}`} ref={ref}>
      <button
        className={`filter-select__trigger ${open ? 'filter-select__trigger--open' : ''}`}
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span className={`filter-select__value ${!selected ? 'filter-select__value--placeholder' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`filter-select__chevron ${open ? 'filter-select__chevron--open' : ''}`}
          size={12}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div className="filter-select__menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`filter-select__option ${opt.value === value ? 'filter-select__option--active' : ''}`}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
