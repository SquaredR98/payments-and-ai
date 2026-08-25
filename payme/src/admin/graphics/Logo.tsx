import React from 'react'

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img
        src="/logo.svg"
        alt="PayMe"
        style={{ maxHeight: '60px', width: 'auto' }}
      />
    </div>
  )
}
