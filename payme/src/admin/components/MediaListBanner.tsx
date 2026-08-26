import React from 'react'
import type { ServerProps } from 'payload'
import { Image } from 'lucide-react'

const BRAND = '#2563eb'

export async function MediaListBanner(props: ServerProps) {
  const { payload } = props

  if (!payload) return null

  let totalCount = 0

  try {
    const result = await payload.count({ collection: 'media' })
    totalCount = result.totalDocs
  } catch {
    // Safe to ignore
  }

  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: 'rgba(37, 99, 235, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: BRAND,
          flexShrink: 0,
        }}
      >
        <Image size={22} strokeWidth={1.75} />
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--theme-elevation-1000)',
            margin: '0 0 2px',
          }}
        >
          Media Library
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--theme-elevation-500)',
            margin: 0,
          }}
        >
          Upload and manage images, documents, and other file assets.
        </p>
      </div>

      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--theme-elevation-1000)',
            lineHeight: 1,
            marginBottom: '2px',
          }}
        >
          {totalCount}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--theme-elevation-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Files
        </div>
      </div>
    </div>
  )
}
