import React from 'react'
import type { ServerProps } from 'payload'
import { Users } from 'lucide-react'

const BRAND = '#2563eb'

export async function UsersListBanner(props: ServerProps) {
  const { payload } = props

  if (!payload) return null

  let totalCount = 0
  let adminCount = 0

  try {
    const [total, admins] = await Promise.all([
      payload.count({ collection: 'users' }),
      payload.count({
        collection: 'users',
        where: { role: { equals: 'admin' } },
      }),
    ])
    totalCount = total.totalDocs
    adminCount = admins.totalDocs
  } catch {
    // Safe to ignore if collection not ready
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
        <Users size={22} strokeWidth={1.75} />
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
          Users Management
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--theme-elevation-500)',
            margin: 0,
          }}
        >
          Manage registered users, their roles, and account status.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          fontSize: '13px',
          color: 'var(--theme-elevation-500)',
          flexShrink: 0,
        }}
      >
        <div style={{ textAlign: 'center' }}>
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
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total
          </div>
        </div>
        <div
          style={{
            width: '1px',
            background: 'var(--theme-border-color)',
            alignSelf: 'stretch',
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: BRAND,
              lineHeight: 1,
              marginBottom: '2px',
            }}
          >
            {adminCount}
          </div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Admins
          </div>
        </div>
      </div>
    </div>
  )
}
