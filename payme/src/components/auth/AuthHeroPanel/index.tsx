import { Check, Mail } from 'lucide-react'
import './styles.css'

type HeroVariant = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email'

interface AuthHeroPanelProps {
  variant?: HeroVariant
}

const heroContent: Record<HeroVariant, { headline: string; subtitle: string }> = {
  login: {
    headline: 'Get paid faster.',
    subtitle: 'Send a polished invoice, share a payment link, and let Stripe or PayPal do the collecting.',
  },
  register: {
    headline: 'Look the part.',
    subtitle: 'Branded invoices, clear line items, and a payment link your clients already trust.',
  },
  'forgot-password': {
    headline: 'Back in, quickly.',
    subtitle: 'Reset links expire in 30 minutes so your account stays yours.',
  },
  'reset-password': {
    headline: 'Secure by default.',
    subtitle: 'Your payouts and client data sit behind bank-grade encryption.',
  },
  'verify-email': {
    headline: 'One last step.',
    subtitle: 'Verified accounts can send invoices and receive payouts immediately.',
  },
}

function InvoiceCard({ badge }: { badge: 'sent' | 'paid' }) {
  return (
    <div className="auth-hero__invoice">
      <div className="auth-hero__invoice-header">
        <div className="auth-hero__invoice-title">
          <span>Invoice #1042</span>
          <span>Due Sep 18, 2026</span>
        </div>
        <span className={`auth-hero__invoice-badge auth-hero__invoice-badge--${badge}`}>
          {badge.toUpperCase()}
        </span>
      </div>
      <div className="auth-hero__invoice-lines">
        <div className="auth-hero__invoice-line">
          <span>Brand strategy</span>
          <span>$2,400.00</span>
        </div>
        <div className="auth-hero__invoice-line">
          <span>Design system</span>
          <span>$1,850.00</span>
        </div>
        <div className="auth-hero__invoice-line">
          <span>Handoff session</span>
          <span>$450.00</span>
        </div>
      </div>
      <div className="auth-hero__invoice-divider" />
      <div className="auth-hero__invoice-total">
        <span>Total</span>
        <span>$4,700.00</span>
      </div>
    </div>
  )
}

function ReceiptCard() {
  return (
    <div className="auth-hero__receipt">
      <div className="auth-hero__receipt-title">
        <span>Payment received</span>
        <span>Stripe · Sep 2, 2026</span>
      </div>
      <div className="auth-hero__receipt-amount">
        <span>$4,700.00</span>
        <span className="auth-hero__invoice-badge auth-hero__invoice-badge--cleared">
          CLEARED
        </span>
      </div>
      <div className="auth-hero__invoice-divider" />
      <div className="auth-hero__receipt-footer">
        <span>Invoice #1042</span>
        <span>Rivera Studio</span>
      </div>
    </div>
  )
}

function EmailCard() {
  return (
    <div className="auth-hero__email">
      <div className="auth-hero__email-icon">
        <Mail className="size-5 text-[#2563EB]" />
      </div>
      <span className="auth-hero__email-title">Confirm it&apos;s you</span>
      <span className="auth-hero__email-description">
        One click on the link we emailed and your account is live.
      </span>
    </div>
  )
}

function CreditCard() {
  return (
    <div className="auth-hero__card">
      <div className="auth-hero__card-chip" />
      <div className="auth-hero__card-details">
        <span className="auth-hero__card-number">•••• 4242</span>
        <span className="auth-hero__card-name">J. RIVERA</span>
      </div>
    </div>
  )
}

function CheckBadge() {
  return (
    <div className="auth-hero__check">
      <Check className="size-5 text-white" strokeWidth={3} />
    </div>
  )
}

const variantCards: Record<HeroVariant, React.ReactNode> = {
  login: (
    <>
      <InvoiceCard badge="sent" />
      <CreditCard />
      <CheckBadge />
    </>
  ),
  register: (
    <>
      <InvoiceCard badge="paid" />
      <CreditCard />
      <CheckBadge />
    </>
  ),
  'forgot-password': (
    <>
      <InvoiceCard badge="sent" />
      <CreditCard />
    </>
  ),
  'reset-password': (
    <>
      <ReceiptCard />
      <CreditCard />
      <CheckBadge />
    </>
  ),
  'verify-email': (
    <>
      <EmailCard />
      <CreditCard />
    </>
  ),
}

export function AuthHeroPanel({ variant = 'login' }: AuthHeroPanelProps) {
  const { headline, subtitle } = heroContent[variant]

  return (
    <div className="auth-hero hidden lg:block">
      <div className="auth-hero__grid" />
      {variantCards[variant]}
      <div className="auth-hero__text">
        <span className="auth-hero__headline">{headline}</span>
        <span className="auth-hero__subtitle">{subtitle}</span>
      </div>
    </div>
  )
}
