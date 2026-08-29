import React from 'react'
import './styles.css'

/**
 * Rendered via the `afterLogin` slot.
 * Provides:
 *  - A heading group ("Welcome back" + subtitle) that CSS repositions ABOVE the form
 *  - A footer line below the form
 */
export function LoginFooter() {
  return (
    <>
      {/* Heading — CSS order moves this above the form */}
      <div className="login-right__header">
        <svg viewBox="0 0 34 34" fill="none" className="login-right__icon">
          <rect width="34" height="34" rx="8" fill="#2563eb" />
          <path d="M10 17 L17 10 L24 17 L17 24 Z" fill="white" />
        </svg>
        <h1 className="login-right__title">Welcome back</h1>
        <p className="login-right__subtitle">Sign in to your PayMe account</p>
      </div>

      {/* Footer — stays below form naturally */}
      <div className="login-right__footer">
        <span>Secure login powered by Payload CMS</span>
      </div>
    </>
  )
}
