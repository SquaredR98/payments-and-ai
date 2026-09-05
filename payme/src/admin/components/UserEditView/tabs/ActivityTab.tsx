'use client'

import { Activity } from 'lucide-react'

export function ActivityTab() {
  return (
    <div className="user-edit__placeholder">
      <div className="user-edit__placeholder-icon">
        <Activity size={24} strokeWidth={1.5} />
      </div>
      <h3 className="user-edit__placeholder-title">Activity</h3>
      <p className="user-edit__placeholder-desc">
        Login history, recent actions, and audit trail will appear here.
      </p>
    </div>
  )
}
