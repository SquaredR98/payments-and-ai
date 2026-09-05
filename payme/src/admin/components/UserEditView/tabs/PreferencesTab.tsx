'use client'

import { Settings } from 'lucide-react'

export function PreferencesTab() {
  return (
    <div className="user-edit__placeholder">
      <div className="user-edit__placeholder-icon">
        <Settings size={24} strokeWidth={1.5} />
      </div>
      <h3 className="user-edit__placeholder-title">Preferences</h3>
      <p className="user-edit__placeholder-desc">
        Notification settings, display preferences, and regional options will appear here.
      </p>
    </div>
  )
}
