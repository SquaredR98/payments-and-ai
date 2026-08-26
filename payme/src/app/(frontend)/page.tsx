import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import {
  FileText,
  Link2,
  CreditCard,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react'

import config from '@/payload.config'
import { PublicLayout } from '@/components/layouts/public-layout'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <PublicLayout user={user}>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Zap className="size-3 text-primary" />
              Professional invoicing made simple
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Create invoices.{' '}
              <span className="text-primary">Get paid faster.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Generate professional invoices, share payment links, and collect
              payments via Stripe or PayPal — all from one clean dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Get Started Free
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to get paid
            </h2>
            <p className="mt-3 text-muted-foreground">
              Simple tools for freelancers and small businesses.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'Professional Invoices',
                description:
                  'Create and send branded invoices with automatic PDF generation and email delivery.',
              },
              {
                icon: Link2,
                title: 'Payment Links',
                description:
                  'Generate shareable payment links your clients can pay with one click.',
              },
              {
                icon: CreditCard,
                title: 'Multi-Gateway Payments',
                description:
                  'Accept payments via Stripe and PayPal. Your clients choose how they pay.',
              },
              {
                icon: Zap,
                title: 'Instant Notifications',
                description:
                  'Get notified the moment a payment arrives. Automatic receipt emails to clients.',
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                description:
                  'PCI-DSS compliant payment processing. Your data is encrypted and protected.',
              },
              {
                icon: Globe,
                title: 'Works Everywhere',
                description:
                  'Responsive design works on any device. Send invoices from your phone.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-1 text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Bottom CTA ===== */}
      {!user && (
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to streamline your invoicing?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start sending professional invoices in minutes. No credit card
              required.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}
    </PublicLayout>
  )
}
