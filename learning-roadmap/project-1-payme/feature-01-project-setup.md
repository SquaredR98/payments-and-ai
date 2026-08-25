# Feature 01: Project Setup & PayloadCMS Configuration

> **Project:** PayMe — Personal Invoice & Payment Link Generator
> **Epic:** 1 of 14
> **Phase:** Feature Documentation
> **Status:** Draft — Awaiting Approval

---

## Table of Contents

1. [What We Are Building](#what-we-are-building)
2. [Why We Are Building It This Way](#why-we-are-building-it-this-way)
3. [Architecture Overview](#architecture-overview)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
   - [Step 1: Initialize PayloadCMS + Next.js Project](#step-1-initialize-payloadcms--nextjs-project)
   - [Step 2: Configure PostgreSQL Database Adapter](#step-2-configure-postgresql-database-adapter)
   - [Step 3: Configure Environment Variables with Zod Validation](#step-3-configure-environment-variables-with-zod-validation)
   - [Step 4: Set Up Project Folder Structure](#step-4-set-up-project-folder-structure)
   - [Step 5: Configure Tailwind CSS + shadcn/ui](#step-5-configure-tailwind-css--shadcnui)
   - [Step 6: Customize PayloadCMS Admin Panel Branding](#step-6-customize-payloadcms-admin-panel-branding)
   - [Step 7: Configure Admin Panel Navigation Groups](#step-7-configure-admin-panel-navigation-groups)
6. [Folder Structure (Final)](#folder-structure-final)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Common Mistakes & Pitfalls](#common-mistakes--pitfalls)
9. [Production Considerations](#production-considerations)
10. [Verification Checklist](#verification-checklist)
11. [References](#references)

---

## What We Are Building

This feature sets up the entire foundation for the PayMe project:

1. **A PayloadCMS 3.x application** running inside a Next.js 16 App Router project — PayloadCMS 3 is "Next.js native," meaning it installs directly into your `/app` folder rather than running as a separate server.
2. **PostgreSQL as the database** via PayloadCMS's official Postgres adapter.
3. **Environment variable management** with type-safe validation using Zod — the app fails fast at startup if any required variable is missing or malformed.
4. **A clean, scalable folder structure** separating PayloadCMS config, frontend code, shared utilities, and types.
5. **Tailwind CSS + shadcn/ui** as the design system, with a custom theme and base components pre-installed.
6. **Branded admin panel** — custom logo, favicon, title, and organized navigation groups so the PayloadCMS admin feels like a product, not a generic CMS.

By the end of this feature, you'll have a fully running development environment with an admin panel at `/admin`, a frontend at `/`, a connected PostgreSQL database, and a component library ready for building the UI.

---

## Why We Are Building It This Way

### Why PayloadCMS 3 (not 2, not Strapi, not Directus)?

PayloadCMS 3 is fundamentally different from other headless CMS options because it runs **inside** your Next.js application. There is no separate CMS server to deploy and manage. This matters because:

- **One deployment, one codebase.** Your CMS admin panel, API, and frontend are all one Next.js app. This simplifies deployment, reduces infrastructure costs, and eliminates API latency between your frontend and CMS.
- **Local API access.** In server components and server actions, you can call `payload.find()` directly — this goes straight to the database without an HTTP round-trip. This is the fastest possible data access pattern in a Next.js app.
- **Full TypeScript.** PayloadCMS auto-generates TypeScript types from your collection schemas. You get compile-time type safety across your entire stack — from database schema to API response to frontend rendering.
- **Access control built in.** PayloadCMS has a powerful field-level and collection-level access control system. For a payment app that handles invoices and financial data, this is critical.

### Why PostgreSQL (not MongoDB)?

- **Relational data model fits invoicing.** Invoices have line items. Line items belong to invoices. Payments reference invoices. Users own invoices. These are all relational concepts.
- **ACID transactions.** When a payment webhook fires and we need to update both the Payment record and the Invoice status atomically, PostgreSQL gives us real transactions. MongoDB's multi-document transactions work but are slower and more complex.
- **PayloadCMS officially supports it.** The `@payloadcms/db-postgres` adapter is first-party and well-maintained.

### Why Zod for environment validation?

- **Fail fast.** If someone deploys without setting `STRIPE_SECRET_KEY`, the app should crash immediately with a clear error — not silently fail when a user tries to pay.
- **Type inference.** Zod schemas infer TypeScript types. Once you validate your env, you get autocompletion and type safety everywhere you use an env var.
- **Single source of truth.** The Zod schema serves as both validation logic and documentation of what env vars exist.

### Why shadcn/ui (not Material UI, not Chakra)?

- **Not a dependency.** shadcn/ui copies component source code into your project. You own it. No version lock-in, no breaking changes from upstream, no bundle bloat from unused components.
- **Tailwind-native.** Since we're already using Tailwind CSS, shadcn/ui components work seamlessly — they're just Tailwind classes and Radix UI primitives.
- **Customizable.** For a payment product where trust and professionalism matter, we need full control over the UI. shadcn/ui gives us that.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 Application                   │
│                                                               │
│  ┌──────────────────────┐    ┌──────────────────────────┐   │
│  │   Frontend (App)      │    │   PayloadCMS (Admin)      │   │
│  │   /app/(frontend)/    │    │   /app/(payload)/         │   │
│  │                        │    │                            │   │
│  │  - Public pages        │    │  - Admin panel at /admin   │   │
│  │  - Dashboard           │    │  - REST API at /api        │   │
│  │  - Payment pages       │    │  - GraphQL (optional)      │   │
│  │  - Auth pages          │    │  - Auto-generated types    │   │
│  └────────┬───────────────┘    └─────────┬──────────────────┘   │
│           │                               │                      │
│           │    ┌─────────────────────┐    │                      │
│           └────┤   Shared Layer       ├────┘                      │
│                │   /src/lib/          │                            │
│                │   /src/utils/        │                            │
│                │   /src/types/        │                            │
│                │   /src/hooks/        │                            │
│                └─────────┬───────────┘                            │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                 ┌─────────▼───────────┐
                 │    PostgreSQL        │
                 │    (via Payload      │
                 │     db-postgres)     │
                 └─────────────────────┘
```

### How PayloadCMS 3 Lives Inside Next.js

PayloadCMS 3 uses Next.js **route groups** to coexist with your frontend:

- `app/(payload)/` — Contains PayloadCMS's admin panel routes and API handlers. These files are generated once and never touched again.
- `app/(frontend)/` — Contains your custom frontend pages (dashboard, login, payment pages, etc.).

Both route groups share the same Next.js application, the same `node_modules`, and the same deployment. PayloadCMS exposes a **Local API** that your frontend server components can call directly — no HTTP overhead.

### Request Flow

```
Browser Request
       │
       ▼
  Next.js Router
       │
       ├── /admin/*  ──────▶  PayloadCMS Admin Panel (React)
       │
       ├── /api/*    ──────▶  PayloadCMS REST API + Custom API Routes
       │
       └── /*        ──────▶  Frontend Pages (your code)
                                    │
                                    ▼
                             payload.find() / payload.create()
                                    │
                                    ▼
                              PostgreSQL Database
```

---

## Prerequisites

Before starting implementation, ensure you have the following installed:

| Tool | Version | How to Check | Install Guide |
|------|---------|-------------|---------------|
| Node.js | 20.9.0+ | `node -v` | https://nodejs.org |
| pnpm | 8+ | `pnpm -v` | `npm install -g pnpm` |
| PostgreSQL | 14+ | `psql --version` | https://www.postgresql.org/download/ |
| Git | Any | `git --version` | https://git-scm.com |
| VS Code | Any | — | https://code.visualstudio.com |

### PostgreSQL Setup

You need a running PostgreSQL instance. Options:

1. **Local install** — Download from postgresql.org or use your OS package manager.
2. **Docker** (recommended for consistency):
   ```bash
   docker run --name payme-db -e POSTGRES_USER=payme -e POSTGRES_PASSWORD=payme_dev -e POSTGRES_DB=payme -p 5432:5432 -d postgres:16
   ```
3. **Cloud** — Supabase, Neon, or Railway all offer free PostgreSQL tiers.

The connection string format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

For local Docker: `postgresql://payme:payme_dev@localhost:5432/payme`

---

## Step-by-Step Implementation Guide

### Step 1: Initialize PayloadCMS + Next.js Project

**What:** Scaffold a new PayloadCMS project using the official CLI, which creates a Next.js 16 application with PayloadCMS pre-configured.

**Why:** `create-payload-app` handles all the wiring between Next.js and PayloadCMS — route handlers, admin panel files, TypeScript config paths, and the `withPayload` Next.js plugin. Doing this manually is error-prone and undocumented.

#### Commands

```bash
# Navigate to the projects directory
cd projects/

# Create the PayMe project using PayloadCMS CLI
pnpx create-payload-app@latest payme
```

When prompted:
- **Project name:** `payme`
- **Template:** Choose `blank` (we don't want their demo content — we're building from scratch)
- **Database:** Choose `PostgreSQL`
- **Package manager:** `pnpm`

#### After Scaffolding

The CLI creates a project structure like this:

```
payme/
├── app/
│   ├── (payload)/
│   │   ├── admin/
│   │   │   └── [[...segments]]/
│   │   │       └── page.tsx          ← Admin panel catch-all route
│   │   └── api/
│   │       └── [...slug]/
│   │           └── route.ts          ← REST API catch-all route
│   ├── layout.tsx                    ← Root layout
│   └── page.tsx                      ← Home page
├── collections/                      ← PayloadCMS collections (we'll reorganize)
├── payload.config.ts                 ← Main PayloadCMS configuration
├── payload-types.ts                  ← Auto-generated types (do NOT edit)
├── tsconfig.json
├── next.config.mjs
├── package.json
└── .env                              ← Environment variables
```

#### TypeScript Strict Mode

Open `tsconfig.json` and verify (or add) strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@payload-config": ["./payload.config.ts"]
    }
  }
}
```

**Why strict mode?** This is a payment application. TypeScript strict mode catches null pointer errors, implicit `any` types, and other bugs at compile time. In a financial app, a runtime crash because `invoice.total` was `undefined` is unacceptable.

#### Verify It Works

```bash
cd payme
pnpm dev
```

- Frontend: `http://localhost:3000` — Should show the default Next.js page
- Admin: `http://localhost:3000/admin` — Should show PayloadCMS first-user registration
- Create your first admin user through the admin panel

---

### Step 2: Configure PostgreSQL Database Adapter

**What:** Ensure the PostgreSQL adapter is properly configured with connection pooling and migration support.

**Why:** `create-payload-app` sets up the basic connection, but we need to verify the configuration and understand what's happening under the hood.

#### The Database Configuration

In `payload.config.ts`, the database adapter should already be configured:

```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  // ... rest of config
})
```

#### Important Details

1. **Connection Pooling:** The `pool` option uses `node-postgres` connection pooling under the hood. For local development, the defaults are fine. For production, you'd tune `max` (default 10), `idleTimeoutMillis`, etc.

2. **Migrations:** PayloadCMS auto-generates and runs database migrations. When you modify a collection schema and restart the dev server, Payload detects the changes and creates/runs migrations. Migration files are stored in `src/migrations/` (or the project root, depending on your config).

3. **The `.env` Connection String:** Never hardcode the connection string. It must come from `DATABASE_URL` in `.env`.

#### Verify Database Connection

After running `pnpm dev`, check the terminal output. You should see:

```
[payload] Connected to PostgreSQL
[payload] Migrations applied successfully
```

If you see connection errors, verify:
- PostgreSQL is running (`pg_isready` command)
- The `DATABASE_URL` in `.env` is correct
- The database exists (`createdb payme` if needed)

---

### Step 3: Configure Environment Variables with Zod Validation

**What:** Create a centralized environment variable validation system that fails fast at application startup if any required variable is missing or malformed.

**Why:** Without validation, a missing `STRIPE_SECRET_KEY` only surfaces when a user tries to pay — potentially hours or days after deployment. With Zod validation at startup, the app refuses to start with a clear error message telling you exactly which variable is missing.

#### Create the Env Validation File

Create `src/lib/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string'),

  // PayloadCMS
  PAYLOAD_SECRET: z
    .string()
    .min(32, 'PAYLOAD_SECRET must be at least 32 characters for security'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Must start with sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'Must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Must start with whsec_'),

  // PayPal
  PAYPAL_CLIENT_ID: z.string().min(1, 'PayPal Client ID is required'),
  PAYPAL_CLIENT_SECRET: z.string().min(1, 'PayPal Client Secret is required'),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),

  // Resend (Email)
  RESEND_API_KEY: z.string().startsWith('re_', 'Must start with re_'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// Validate and export
function validateEnv() {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    const formatted = parsed.error.format()
    for (const [key, value] of Object.entries(formatted)) {
      if (key === '_errors') continue
      const errors = (value as any)?._errors
      if (errors?.length) {
        console.error(`  ${key}: ${errors.join(', ')}`)
      }
    }
    throw new Error('Invalid environment variables. See above for details.')
  }

  return parsed.data
}

export const env = validateEnv()

// Type export for use throughout the app
export type Env = z.infer<typeof envSchema>
```

#### Why This Pattern Works

1. **`safeParse` instead of `parse`:** We use `safeParse` so we can collect ALL errors and display them at once. With `parse`, Zod throws on the first error — the developer would have to fix one variable, restart, see the next error, fix it, restart... That's a terrible developer experience.

2. **Prefix validation:** Stripe keys always start with `sk_` / `pk_`, Resend keys start with `re_`. Validating prefixes catches the common mistake of swapping test/live keys or putting the wrong service's key in the wrong variable.

3. **`PAYLOAD_SECRET` length check:** PayloadCMS uses this to sign JWTs. A short secret is a security vulnerability. 32+ characters ensures a reasonable entropy level.

4. **Optional variables with defaults:** `PAYPAL_MODE` defaults to `sandbox` and `NEXT_PUBLIC_APP_URL` defaults to `localhost:3000`. This means development works out of the box without setting every single variable.

#### Create `.env` and `.env.example`

Create `.env` (actual secrets — never commit):

```env
# Database
DATABASE_URL=postgresql://payme:payme_dev@localhost:5432/payme

# PayloadCMS
PAYLOAD_SECRET=your-super-secret-key-that-is-at-least-32-chars-long-change-me

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# PayPal (Sandbox)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=
PAYPAL_MODE=sandbox

# Resend
RESEND_API_KEY=re_your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env.example` (committed to git — placeholders only):

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payme

# PayloadCMS
PAYLOAD_SECRET=generate-a-random-string-at-least-32-characters

# Stripe (Test Mode — get keys from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (Sandbox — get keys from https://developer.paypal.com)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=
PAYPAL_MODE=sandbox

# Resend (get key from https://resend.com)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### Verify `.gitignore`

Ensure `.gitignore` includes:

```gitignore
.env
.env.local
.env.*.local
```

#### Wire It Into the App

Import `env` at the top of `payload.config.ts` to trigger validation on startup:

```typescript
import { env } from './src/lib/env'
import { buildConfig } from 'payload'
// ...

export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
  secret: env.PAYLOAD_SECRET,
  // ...
})
```

Now if someone starts the app without a valid `DATABASE_URL`, they see:

```
❌ Invalid environment variables:
  DATABASE_URL: Must be a PostgreSQL connection string
  STRIPE_SECRET_KEY: Must start with sk_
```

Instead of a cryptic Postgres connection error 5 minutes into debugging.

---

### Step 4: Set Up Project Folder Structure

**What:** Reorganize the scaffolded project into a clean, scalable folder structure that separates concerns and scales as we add 14 features.

**Why:** The default `create-payload-app` structure puts everything flat. That works for a demo, but we're building a production app with collections, custom hooks, API routes, email templates, and 50+ components. Without organization, you'll be scrolling through a single `components/` folder with 80 files.

#### Target Folder Structure

```
payme/
├── app/
│   ├── (frontend)/                    ← Your app's pages (route group)
│   │   ├── (auth)/                    ← Auth pages (login, register, etc.)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx             ← Auth layout (centered card)
│   │   ├── (dashboard)/               ← Protected dashboard pages
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx           ← Invoice list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       ← Create invoice
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       ← Invoice detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx   ← Edit invoice
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx             ← Dashboard layout (sidebar + main)
│   │   ├── pay/                       ← Public payment pages (no auth)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx           ← Payment link landing page
│   │   │       ├── success/
│   │   │       │   └── page.tsx
│   │   │       └── cancel/
│   │   │           └── page.tsx
│   │   ├── layout.tsx                 ← Frontend root layout
│   │   └── page.tsx                   ← Landing page
│   ├── (payload)/                     ← PayloadCMS admin (DO NOT EDIT)
│   │   ├── admin/
│   │   │   └── [[...segments]]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── [...slug]/
│   │           └── route.ts
│   ├── api/                           ← Custom API routes (non-Payload)
│   │   ├── payments/
│   │   │   ├── stripe/
│   │   │   │   └── create-session/
│   │   │   │       └── route.ts
│   │   │   └── paypal/
│   │   │       ├── create-order/
│   │   │       │   └── route.ts
│   │   │       └── capture-order/
│   │   │           └── route.ts
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   │   └── route.ts
│   │   │   └── paypal/
│   │   │       └── route.ts
│   │   ├── invoices/
│   │   │   └── [id]/
│   │   │       └── pdf/
│   │   │           └── route.ts
│   │   └── user/
│   │       ├── export-data/
│   │       │   └── route.ts
│   │       └── delete-account/
│   │           └── route.ts
│   ├── layout.tsx                     ← Root layout (wraps everything)
│   └── globals.css                    ← Global styles + Tailwind directives
│
├── src/
│   ├── collections/                   ← PayloadCMS collection configs
│   │   ├── Users.ts
│   │   ├── Invoices.ts
│   │   ├── Payments.ts
│   │   ├── AuditLogs.ts
│   │   └── Clients.ts
│   │
│   ├── components/                    ← React components
│   │   ├── ui/                        ← shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/                    ← Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/                 ← Dashboard-specific components
│   │   │   ├── StatsCards.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── invoices/                  ← Invoice-related components
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoiceTable.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   └── LineItemRow.tsx
│   │   ├── payments/                  ← Payment-related components
│   │   │   ├── StripeCheckoutButton.tsx
│   │   │   ├── PayPalButton.tsx
│   │   │   └── PaymentStatus.tsx
│   │   └── shared/                    ← Shared/generic components
│   │       ├── LoadingSkeleton.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── CurrencyDisplay.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── lib/                           ← Core libraries and service clients
│   │   ├── env.ts                     ← Environment variable validation
│   │   ├── stripe.ts                  ← Stripe client singleton
│   │   ├── paypal.ts                  ← PayPal client singleton
│   │   ├── email.ts                   ← Resend email client
│   │   ├── payload.ts                 ← Payload client helper for frontend
│   │   └── logger.ts                  ← Structured logging utility
│   │
│   ├── hooks/                         ← React hooks (client-side)
│   │   ├── useAuth.ts
│   │   ├── useInvoices.ts
│   │   └── useDebounce.ts
│   │
│   ├── payload-hooks/                 ← PayloadCMS collection hooks (server-side)
│   │   ├── invoices/
│   │   │   ├── beforeChange.ts
│   │   │   ├── afterChange.ts
│   │   │   └── beforeDelete.ts
│   │   └── payments/
│   │       ├── afterChange.ts
│   │       └── beforeChange.ts
│   │
│   ├── utils/                         ← Utility functions
│   │   ├── currency.ts                ← Currency formatting, toCents()
│   │   ├── calculations.ts            ← Invoice math (subtotal, tax, total)
│   │   ├── audit.ts                   ← Audit logging helper
│   │   ├── validation.ts              ← Shared Zod schemas
│   │   └── sanitize.ts                ← Input sanitization
│   │
│   ├── types/                         ← Shared TypeScript interfaces
│   │   ├── invoice.ts
│   │   ├── payment.ts
│   │   ├── api.ts                     ← API request/response types
│   │   └── index.ts                   ← Re-exports
│   │
│   ├── emails/                        ← Email templates (React Email)
│   │   ├── BaseTemplate.tsx
│   │   ├── PaymentReceived.tsx
│   │   ├── InvoiceSent.tsx
│   │   └── PaymentReminder.tsx
│   │
│   ├── providers/                     ← React context providers
│   │   ├── AuthProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   └── admin/                         ← PayloadCMS admin customizations
│       ├── graphics/
│       │   ├── Logo.tsx               ← Custom admin login logo
│       │   └── Icon.tsx               ← Custom admin sidebar icon
│       └── dashboard/
│           └── MetricsWidget.tsx      ← Custom admin dashboard widget
│
├── public/                            ← Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── logo-icon.svg
│
├── payload.config.ts                  ← Main PayloadCMS configuration
├── payload-types.ts                   ← Auto-generated (DO NOT EDIT)
├── next.config.mjs
├── tailwind.config.ts
├── components.json                    ← shadcn/ui configuration
├── tsconfig.json
├── .env                               ← Secrets (gitignored)
├── .env.example                       ← Template (committed)
├── .gitignore
└── package.json
```

#### Key Decisions Explained

| Decision | Why |
|----------|-----|
| `app/(frontend)/` route group | Separates frontend routes from PayloadCMS routes cleanly. Route groups don't affect the URL — `/dashboard` works, not `/(frontend)/dashboard`. |
| `src/hooks/` vs `src/payload-hooks/` | React hooks (client) and PayloadCMS hooks (server) are fundamentally different things. Separating them prevents confusion. |
| `src/components/ui/` for shadcn | shadcn/ui convention. The CLI installs components here. Don't fight the convention. |
| `src/lib/` for service clients | Each external service (Stripe, PayPal, Resend) gets a singleton client. Importing from `@/lib/stripe` is clean and prevents creating multiple Stripe instances. |
| `src/types/` separate from `payload-types.ts` | `payload-types.ts` is auto-generated. Our custom types (API shapes, form states) go in `src/types/`. Never edit `payload-types.ts` — it gets overwritten. |
| `src/admin/` for admin customizations | Keeps PayloadCMS admin-specific React components separate from frontend components. The admin panel and frontend have different styling contexts. |

---

### Step 5: Configure Tailwind CSS + shadcn/ui

**What:** Set up Tailwind CSS with a custom design system and install base shadcn/ui components.

**Why:** Every UI component we build in the next 13 features depends on this foundation. Getting the design tokens right now means consistent, professional UI throughout.

#### Tailwind Should Already Be Installed

`create-payload-app` with the blank template may or may not include Tailwind. If it's not installed:

```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss
```

#### Configure Custom Theme

Update `tailwind.config.ts` with PayMe's design tokens:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Professional blue (trustworthy for payments)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Secondary — Slate gray
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Status colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

#### Initialize shadcn/ui

```bash
pnpx shadcn@latest init
```

When prompted:
- **Style:** Default
- **Base color:** Slate
- **CSS variables for colors:** Yes

This creates a `components.json` file configuring shadcn/ui for your project.

#### Install Base Components

Install the components we'll need across multiple features:

```bash
pnpx shadcn@latest add button input card dialog toast table badge select textarea tabs avatar dropdown-menu sheet separator skeleton switch label
```

These install into `src/components/ui/` as actual TypeScript files you own.

#### Global Styles

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.625rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

#### Install the Inter Font

Install the `Inter` font via `next/font` in your root layout:

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

### Step 6: Customize PayloadCMS Admin Panel Branding

**What:** Replace the default PayloadCMS branding with PayMe's own logo, favicon, and title.

**Why:** The admin panel is a tool you'll use daily. Branded admin panels feel more professional, are easier to distinguish when you have multiple Payload projects, and reinforce that this is *your* product — not a generic CMS.

#### Create Admin Graphics Components

Create `src/admin/graphics/Logo.tsx`:

```tsx
// This component renders on the admin login/signup page
// It replaces the default PayloadCMS logo
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
```

Create `src/admin/graphics/Icon.tsx`:

```tsx
// This smaller icon appears in the admin sidebar navigation
import React from 'react'

export default function Icon() {
  return (
    <img
      src="/logo-icon.svg"
      alt="PayMe"
      style={{ maxHeight: '28px', width: 'auto' }}
    />
  )
}
```

#### Configure in payload.config.ts

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { env } from './src/lib/env'

export default buildConfig({
  // Admin panel configuration
  admin: {
    // Graphics customization
    components: {
      graphics: {
        Logo: '/src/admin/graphics/Logo',
        Icon: '/src/admin/graphics/Icon',
      },
    },
    // Metadata customization
    meta: {
      titleSuffix: '— PayMe Admin',
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/favicon.ico',
        },
      ],
    },
  },

  // Editor
  editor: lexicalEditor(),

  // Database
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),

  // Secret for JWT signing
  secret: env.PAYLOAD_SECRET,

  // TypeScript auto-generation
  typescript: {
    outputFile: 'payload-types.ts',
  },

  // Image processing
  sharp,
})
```

#### Important Notes on Component Paths

In PayloadCMS 3, admin component paths are specified as **string import paths** relative to your project root — not as imported React components. PayloadCMS resolves them at build time. This is a common source of confusion.

```typescript
// CORRECT — string path
graphics: {
  Logo: '/src/admin/graphics/Logo',
}

// WRONG — imported component (does NOT work in Payload 3 config)
// import Logo from './src/admin/graphics/Logo'
// graphics: {
//   Logo: Logo,  // This will fail
// }
```

---

### Step 7: Configure Admin Panel Navigation Groups

**What:** Organize PayloadCMS collections into logical navigation groups in the admin sidebar.

**Why:** We'll eventually have 5+ collections (Users, Invoices, Payments, AuditLogs, Clients). Without groups, they appear as a flat list. Groups like "Invoices," "Payments," "Users," and "System" make the admin panel navigable.

#### How Collection Groups Work

Navigation groups are configured **per collection**, not globally. Each collection can specify which group it belongs to via the `admin.group` property:

```typescript
// Example: src/collections/Invoices.ts
import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    group: 'Invoices',         // ← This creates/joins the "Invoices" group
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'client', 'total', 'status', 'dueDate'],
  },
  fields: [
    // ... fields defined in Epic 3
  ],
}
```

#### Planned Navigation Groups

When all collections are built (Epics 2-3), the admin sidebar will look like:

```
📄 Invoices
    ├── Invoices
    └── Clients

💳 Payments
    └── Payments

👤 Users
    └── Users

⚙️ System
    └── Audit Logs
```

Each collection config will include:

```typescript
// Users.ts
admin: { group: 'Users' }

// Invoices.ts
admin: { group: 'Invoices' }

// Clients.ts
admin: { group: 'Invoices' }

// Payments.ts
admin: { group: 'Payments' }

// AuditLogs.ts
admin: { group: 'System' }
```

#### For Now (Epic 1 Scope)

Since we only have the default `Users` collection at this point, we'll configure the group on Users and leave a comment for future collections:

```typescript
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    group: 'Users',
    useAsTitle: 'email',
  },
  fields: [
    // Additional fields will be added in Epic 2 (Authentication)
  ],
}
```

Register it in `payload.config.ts`:

```typescript
import { Users } from './src/collections/Users'

export default buildConfig({
  collections: [Users],
  // ... rest of config
})
```

---

## Folder Structure (Final)

After completing all 7 steps, the minimal scaffolded project (before implementing features 2-14) should look like:

```
payme/
├── app/
│   ├── (frontend)/
│   │   ├── layout.tsx                 ← Frontend root layout
│   │   └── page.tsx                   ← Landing page (placeholder)
│   ├── (payload)/                     ← PayloadCMS admin (generated, DO NOT EDIT)
│   │   ├── admin/[[...segments]]/page.tsx
│   │   └── api/[...slug]/route.ts
│   ├── api/                           ← Custom API routes (empty, ready for future epics)
│   ├── layout.tsx                     ← Root layout (Inter font, globals)
│   └── globals.css                    ← Tailwind + CSS variables
├── src/
│   ├── admin/graphics/
│   │   ├── Logo.tsx
│   │   └── Icon.tsx
│   ├── collections/
│   │   └── Users.ts
│   ├── components/ui/                 ← shadcn/ui components (installed)
│   ├── lib/
│   │   └── env.ts                     ← Zod env validation
│   ├── hooks/                         ← (empty, ready)
│   ├── payload-hooks/                 ← (empty, ready)
│   ├── utils/                         ← (empty, ready)
│   ├── types/                         ← (empty, ready)
│   ├── emails/                        ← (empty, ready)
│   └── providers/                     ← (empty, ready)
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── logo-icon.svg
├── payload.config.ts
├── payload-types.ts
├── next.config.mjs
├── tailwind.config.ts
├── components.json
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## Environment Variables Reference

| Variable | Required | Example | Used By |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/payme` | PayloadCMS (DB connection) |
| `PAYLOAD_SECRET` | Yes | `a-random-string-at-least-32-chars` | PayloadCMS (JWT signing) |
| `STRIPE_SECRET_KEY` | Yes | `sk_test_51...` | Stripe SDK (server) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_51...` | Stripe.js (client) |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_...` | Stripe webhook verification |
| `PAYPAL_CLIENT_ID` | Yes | `AX...` | PayPal SDK (server) |
| `PAYPAL_CLIENT_SECRET` | Yes | `EK...` | PayPal SDK (server) |
| `PAYPAL_WEBHOOK_ID` | No | `WH-...` | PayPal webhook verification |
| `PAYPAL_MODE` | No | `sandbox` | PayPal environment toggle |
| `RESEND_API_KEY` | Yes | `re_...` | Resend email service |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Payment link generation |
| `NODE_ENV` | No | `development` | Runtime environment |

**Note on `NEXT_PUBLIC_` prefix:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle. Never put secret keys behind this prefix. Only the Stripe *publishable* key needs this — it's designed to be public.

---

## Common Mistakes & Pitfalls

### 1. Editing Files in `app/(payload)/`

**The mistake:** Modifying the admin panel or API route files inside `(payload)/`.

**Why it's wrong:** These files are generated by PayloadCMS and may be overwritten by updates. All customization goes through `payload.config.ts` and custom components in `src/admin/`.

**The fix:** Never touch `app/(payload)/`. If you need to customize the admin, use the config's `admin.components` option.

### 2. Importing Environment Variables Without Validation

**The mistake:** Using `process.env.STRIPE_SECRET_KEY` directly throughout the codebase.

**Why it's wrong:** `process.env` values are `string | undefined`. Every usage requires a null check, and there's no startup validation. You'll get cryptic runtime errors.

**The fix:** Always import from `@/lib/env`:
```typescript
// WRONG
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// RIGHT
import { env } from '@/lib/env'
const stripe = new Stripe(env.STRIPE_SECRET_KEY)
```

### 3. Committing `.env` to Git

**The mistake:** Forgetting to add `.env` to `.gitignore` or accidentally staging it.

**Why it's wrong:** API keys in git history are permanent — even if you remove the file later, the keys are in the commit history. Stripe will detect leaked keys and may disable them.

**The fix:** Verify `.gitignore` has `.env` listed. Use `git status` before every commit. Consider using `git-secrets` or a pre-commit hook that scans for key patterns.

### 4. Using the Wrong Next.js Version

**The mistake:** Installing a Next.js version that PayloadCMS doesn't support.

**Why it's wrong:** PayloadCMS 3.73.0+ requires Next.js `16.2.6+` (the current stable is 16.3.x). Older Next.js 16 releases (16.0.x, 16.1.x) are explicitly unsupported. Next.js 15 is on maintenance-only and won't receive future Payload support.

**The fix:** Use `create-payload-app` which installs the correct Next.js version. If upgrading Next.js later, check PayloadCMS compatibility first at the [Payload releases page](https://github.com/payloadcms/payload/releases).

### 5. Creating Stripe/PayPal Clients in Multiple Files

**The mistake:** Writing `new Stripe(env.STRIPE_SECRET_KEY)` in every file that needs Stripe.

**Why it's wrong:** Each instantiation creates a new HTTP client with its own connection pool. Multiple instances waste resources and make it harder to change configuration globally (e.g., switching API version).

**The fix:** Create a singleton in `src/lib/stripe.ts` and import it everywhere:
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'
import { env } from './env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

### 6. Putting PayloadCMS Hooks in `src/hooks/`

**The mistake:** Mixing React hooks (`useAuth`, `useDebounce`) with PayloadCMS collection hooks (`beforeChange`, `afterDelete`) in the same directory.

**Why it's wrong:** They're completely different concepts. React hooks run in the browser. PayloadCMS hooks run on the server during database operations. Mixing them causes confusion about execution context.

**The fix:** React hooks go in `src/hooks/`. PayloadCMS hooks go in `src/payload-hooks/`.

### 7. Not Setting `PAYLOAD_SECRET` to a Strong Value

**The mistake:** Using a short or predictable `PAYLOAD_SECRET` like `"secret"` or `"12345"`.

**Why it's wrong:** PayloadCMS uses this to sign JWT tokens. A weak secret means attackers can forge authentication tokens and access any user's account — including admin accounts that can see all invoices and payment data.

**The fix:** Generate a proper secret: `openssl rand -base64 48` gives you a 64-character random string.

### 8. Running `create-payload-app` Inside an Existing Next.js Project

**The mistake:** Trying to run `create-payload-app` inside a directory that already has a `package.json`.

**Why it's wrong:** The CLI creates a new project directory. Running it inside an existing project creates a nested project with conflicting configs.

**The fix:** Run `create-payload-app` in the *parent* directory (e.g., `projects/`) and let it create the `payme/` subdirectory.

---

## Production Considerations

While this is a learning project running locally, understanding these considerations now prepares you for real-world payment applications:

### Database

- **Connection pooling:** In production with serverless (Vercel), use a connection pooler like PgBouncer or Neon's pooler. Serverless functions can overwhelm PostgreSQL with too many direct connections.
- **Backups:** Financial data requires regular automated backups. PostgreSQL supports `pg_dump` and continuous archiving.
- **Encryption at rest:** Production databases should have encryption enabled (AWS RDS, Supabase, and Neon do this by default).

### Security

- **HTTPS only:** Never run a payment application over HTTP in production. Stripe will reject API calls from insecure origins.
- **Secret rotation:** Have a plan for rotating API keys. Store them in a secrets manager (AWS Secrets Manager, Doppler, Infisical), not directly in hosting env vars.
- **Access logging:** Log all admin panel access. PayloadCMS's audit capabilities help, but also log at the infrastructure level.

### Performance

- **Image optimization:** PayloadCMS uses `sharp` for image processing. Ensure it's installed as a production dependency, not devDependency.
- **Build caching:** PayloadCMS 3 generates types and runs migrations at build time. Ensure your CI/CD caches `node_modules` and `.next/` appropriately.

---

## Verification Checklist

After implementation, verify each of the following:

- [ ] `pnpm dev` starts without errors
- [ ] Admin panel loads at `http://localhost:3000/admin`
- [ ] Admin panel shows "PayMe" branding (logo on login, icon in sidebar)
- [ ] Admin page title includes "PayMe Admin" suffix
- [ ] Custom favicon appears in browser tab
- [ ] Frontend loads at `http://localhost:3000`
- [ ] PostgreSQL connection works (can create first admin user)
- [ ] Removing a required env var from `.env` and restarting causes a clear error message
- [ ] `payload-types.ts` auto-generates after first run
- [ ] shadcn/ui components import correctly (test with a `<Button>` on the home page)
- [ ] Dark mode CSS variables are present in `globals.css`
- [ ] Tailwind custom colors work (test with `bg-primary-500` class)
- [ ] `.env` is NOT tracked by git (`git status` confirms)
- [ ] `.env.example` IS tracked by git
- [ ] TypeScript strict mode is enabled (add a type error to confirm it catches it)
- [ ] All empty directories exist (`src/hooks/`, `src/utils/`, etc.)
- [ ] Users collection appears in admin sidebar under "Users" group

---

## References

- [PayloadCMS Installation Guide](https://payloadcms.com/docs/getting-started/installation) — Official setup instructions for Payload 3
- [PayloadCMS + Next.js Guide](https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload) — How Payload integrates with Next.js App Router
- [PayloadCMS 3.0 Announcement](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app) — Understanding what's new in v3
- [PayloadCMS Collection Configs](https://payloadcms.com/docs/configuration/collections) — Collection admin options including groups
- [PayloadCMS Admin Metadata](https://payloadcms.com/docs/admin/metadata) — Title, favicon, OG image configuration
- [PayloadCMS Root Components](https://payloadcms.com/docs/custom-components/root-components) — Custom Logo and Icon components
- [PayloadCMS White-Label Guide](https://payloadcms.com/posts/blog/white-label-admin-ui) — Admin panel branding walkthrough
- [PayloadCMS PostgreSQL Adapter](https://payloadcms.com/docs/database/postgres) — Database adapter docs
- [shadcn/ui Installation for Next.js](https://ui.shadcn.com/docs/installation/next) — Component library setup
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration) — Custom theme setup
- [Zod Documentation](https://zod.dev/) — Schema validation library
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) — How `NEXT_PUBLIC_` prefix works
