'use client'

import { useState, useRef, useEffect } from 'react'

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
        <svg
          className={`filter-select__chevron ${open ? 'filter-select__chevron--open' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="1 1 5 5 9 1" />
        </svg>
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
