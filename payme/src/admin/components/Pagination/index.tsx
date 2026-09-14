'use client'

import { useListQuery } from '@payloadcms/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import './styles.css'

function getPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  pages.push(total)

  return pages
}

export function Pagination() {
  const { data, handlePageChange } = useListQuery()

  const page = data?.page ?? 1
  const totalPages = data?.totalPages ?? 1
  const totalDocs = data?.totalDocs ?? 0
  const limit = data?.limit ?? 10
  const hasNextPage = data?.hasNextPage ?? false
  const hasPrevPage = data?.hasPrevPage ?? false

  if (totalDocs === 0 || totalPages <= 1) return null

  const rangeStart = (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, totalDocs)
  const pages = getPageRange(page, totalPages)

  return (
    <div className="pagination">
      <span className="pagination__info">
        {rangeStart}–{rangeEnd} of {totalDocs}
      </span>

      <div className="pagination__controls">
        <button
          className="pagination__btn pagination__btn--nav"
          type="button"
          disabled={!hasPrevPage}
          onClick={() => handlePageChange?.(page - 1)}
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
              type="button"
              onClick={() => p !== page && handlePageChange?.(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className="pagination__btn pagination__btn--nav"
          type="button"
          disabled={!hasNextPage}
          onClick={() => handlePageChange?.(page + 1)}
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
