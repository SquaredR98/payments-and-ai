import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <img src="/logo.svg" alt="PayMe" className="h-16" />
        {!user && (
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome to PayMe
          </h1>
        )}
        {user && (
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {user.email}
          </h1>
        )}
        <p className="max-w-md text-muted-foreground">
          Personal invoice and payment link generator. Create invoices, share
          payment links, and collect payments via Stripe or PayPal.
        </p>
        <div className="flex gap-3">
          <a
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            href="/admin"
          >
            Admin Panel
          </a>
        </div>
      </div>
    </div>
  )
}
