import React from 'react'
import './styles.css'

export function LoginBranding() {
  return (
    <div className="login-brand-panel">
      {/* Floating geometric shapes — echo the PayMe diamond motif */}
      <div className="login-brand-panel__shapes" aria-hidden="true">
        <svg className="login-brand-panel__shape login-brand-panel__shape--1" viewBox="0 0 120 120" fill="none">
          <rect width="120" height="120" rx="24" fill="rgba(255,255,255,0.06)" />
        </svg>
        <svg className="login-brand-panel__shape login-brand-panel__shape--2" viewBox="0 0 80 80" fill="none">
          <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="rgba(255,255,255,0.05)" />
        </svg>
        <svg className="login-brand-panel__shape login-brand-panel__shape--3" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.04)" />
        </svg>
        <svg className="login-brand-panel__shape login-brand-panel__shape--4" viewBox="0 0 100 100" fill="none">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="rgba(255,255,255,0.03)" />
        </svg>
        <svg className="login-brand-panel__shape login-brand-panel__shape--5" viewBox="0 0 140 140" fill="none">
          <rect width="140" height="140" rx="28" transform="rotate(15 70 70)" fill="rgba(255,255,255,0.025)" />
        </svg>
      </div>

      {/* Brand content */}
      <div className="login-brand-panel__content">
        <div className="login-brand-panel__logo-row">
          <svg viewBox="0 0 34 34" fill="none" className="login-brand-panel__icon">
            <rect width="34" height="34" rx="8" fill="white" />
            <path d="M10 17 L17 10 L24 17 L17 24 Z" fill="#2563eb" />
          </svg>
          <span className="login-brand-panel__name">PayMe</span>
        </div>
        <h1 className="login-brand-panel__heading">
          Professional invoicing,<br />made simple.
        </h1>
        <p className="login-brand-panel__description">
          Create and send beautiful invoices, accept payments via Stripe and PayPal, and manage your business — all in one place.
        </p>

        {/* Feature highlights */}
        <div className="login-brand-panel__features">
          <div className="login-brand-panel__feature">
            <svg viewBox="0 0 20 20" fill="none" className="login-brand-panel__feature-icon">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
            </svg>
            <span>Stripe & PayPal checkout</span>
          </div>
          <div className="login-brand-panel__feature">
            <svg viewBox="0 0 20 20" fill="none" className="login-brand-panel__feature-icon">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
            </svg>
            <span>PDF invoice generation</span>
          </div>
          <div className="login-brand-panel__feature">
            <svg viewBox="0 0 20 20" fill="none" className="login-brand-panel__feature-icon">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
            </svg>
            <span>Email notifications</span>
          </div>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="login-brand-panel__footer">
        <span>&copy; 2026 PayMe. Built with Payload CMS.</span>
      </div>
    </div>
  )
}
