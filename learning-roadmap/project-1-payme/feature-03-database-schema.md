# Feature 03: Database Schema & Data Layer

> **Project:** PayMe — Personal Invoice & Payment Link Generator
> **Epic:** 3 of 14
> **Phase:** Feature Documentation
> **Status:** Draft — Awaiting Approval

---

## Table of Contents

1. [What We Are Building](#what-we-are-building)
2. [Why We Are Building It This Way](#why-we-are-building-it-this-way)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
   - [Invoices Collection](#invoices-collection)
   - [Payments Collection](#payments-collection)
   - [Audit Logs Collection](#audit-logs-collection)
5. [Relationships & Data Flow](#relationships--data-flow)
6. [API Contracts](#api-contracts)
7. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
   - [Step 1: Create Invoices Collection Schema](#step-1-create-invoices-collection-schema)
   - [Step 2: Create Invoice Hooks (Auto-Generation, Calculations, Soft Delete)](#step-2-create-invoice-hooks)
   - [Step 3: Create Invoice Access Control](#step-3-create-invoice-access-control)
   - [Step 4: Create Payments Collection Schema](#step-4-create-payments-collection-schema)
   - [Step 5: Create Payment Hooks (Invoice Status Sync)](#step-5-create-payment-hooks)
   - [Step 6: Create Audit Logs Collection Schema](#step-6-create-audit-logs-collection-schema)
   - [Step 7: Create Audit Logging Utility](#step-7-create-audit-logging-utility)
   - [Step 8: Wire Up Audit Logging in Existing Hooks](#step-8-wire-up-audit-logging)
   - [Step 9: Register Collections and Verify](#step-9-register-collections-and-verify)
8. [Common Mistakes & Pitfalls](#common-mistakes--pitfalls)
9. [Production Considerations](#production-considerations)
10. [Verification Checklist](#verification-checklist)
11. [PayloadCMS Collection Config Structure](#payloadcms-collection-config-structure)
12. [References](#references)

---

## What We Are Building

This feature creates the three core data collections that power PayMe's invoicing and payment system:

1. **Invoices** — The main business object. Freelancers create invoices with client details, line items, tax/discount calculations, and a shareable payment link slug. Invoices follow a status lifecycle: `draft → sent → viewed → paid → overdue → cancelled → refunded`. Each invoice auto-generates a unique invoice number (per-user serialized: `INV-2026-0001`) and a cryptographically random payment link slug.

2. **Payments** — Transaction records created when a client pays an invoice via Stripe or PayPal. Each payment links to an invoice, stores the gateway transaction ID, payer info, and an idempotency key to prevent duplicate processing. When a payment succeeds, it automatically updates the related invoice's status to "paid."

3. **Audit Logs** — An append-only trail of every financially relevant event: invoice created, invoice updated, payment received, payment failed, etc. Each entry captures who did what, when, from where (IP/user-agent), and what changed (before/after data snapshots). Admin-only, read-only — no one can edit or delete these.

**What we are NOT building in this feature:**
- Invoice CRUD UI (that's Feature 05)
- Payment link landing page (Feature 06)
- Stripe/PayPal integration (Features 07-08)
- PDF generation (Feature 09)
- Email notifications (Feature 10)

This feature is strictly the **data layer** — collections, fields, hooks, access control, and the audit utility. Later features build on top of these collections.

---

## Why We Are Building It This Way

### Why PayloadCMS Collections (not raw Prisma models)?

PayloadCMS collections give us a lot for free:
- **Admin panel UI** — every collection automatically gets a list view, create/edit form, filters, and search in the admin panel. We've already customized these in Feature 01.5 (custom list view, edit view). The new collections inherit that work.
- **Access control** — per-operation permission functions (`create`, `read`, `update`, `delete`) built into the collection config. No separate middleware layer.
- **Hooks** — `beforeChange`, `afterChange`, `beforeDelete`, `afterDelete` run server-side on every operation, whether it comes from the admin panel, the REST API, the GraphQL API, or the Local API. One place to put business logic.
- **Type generation** — `payload generate:types` creates TypeScript interfaces from your collection schemas. No manual type maintenance.
- **REST + GraphQL + Local API** — all three come free. The frontend uses REST (`/api/invoices`), admin uses the Local API (`payload.find()`), and webhooks use the Local API too.

### Why Per-User Serialized Invoice Numbers?

Global sequential numbers (INV-0001, INV-0002...) leak information — a client receiving INV-8472 knows you've sent 8,472 invoices. Per-user numbers start from 0001 for each user:
- User A's first invoice: `INV-2026-0001`
- User B's first invoice: `INV-2026-0001`
- User A's second invoice: `INV-2026-0002`

This is the standard approach in tools like FreshBooks, Wave, and Zoho Invoice. The number is unique *per user per year*, and the combination of `owner + invoiceNumber` is globally unique.

**Implementation:** A `beforeChange` hook queries the user's highest invoice number for the current year and increments. To handle race conditions (two invoices created simultaneously), we use a unique compound index on `(owner, invoiceNumber)` — if a duplicate sneaks through, the database rejects it and the hook retries with the next number.

### Why Soft Delete (not Hard Delete)?

Financial records should never be physically deleted:
- **Legal compliance** — tax authorities may require invoice records for 3-7 years depending on jurisdiction.
- **Audit trail** — hard-deleting an invoice that had payments creates orphaned payment records with no parent.
- **User error recovery** — "I accidentally deleted my invoice" is not recoverable with hard delete.

Instead, deleting an invoice sets its status to `cancelled`. The `beforeDelete` hook intercepts the delete operation and converts it to a status update. Cancelled invoices are hidden from the default list view but can be shown with a filter.

### Why a Separate Payments Collection (not fields on the Invoice)?

Storing payment info directly on the invoice seems simpler, but it breaks down quickly:
- **Failed attempts** — a client might fail to pay 3 times before succeeding. Each attempt is a separate record worth tracking.
- **Partial refunds** — refunding 50% of an invoice creates a new payment record with negative amount, while the original payment record stays intact.
- **Multiple gateways** — if a client starts with PayPal, cancels, then pays with Stripe, those are separate payment events.
- **Idempotency** — webhook events can arrive multiple times. Checking "does a payment with this gateway transaction ID exist?" is a simple query on a dedicated collection. Embedded fields would need complex array searches.

The Invoice still has convenience fields (`paidAt`, `paidVia`, `stripePaymentIntentId`, `paypalOrderId`) that get set when a payment succeeds — these are denormalized for quick display without joining.

### Why an Audit Log Collection (not just console.log)?

Console logs disappear when the process restarts. A database-backed audit trail:
- **Survives restarts** — persistent, queryable, filterable
- **Shows to admins** — visible in the admin panel with filters by action, entity, user, date range
- **Captures context** — IP address, user agent, before/after data snapshots for forensic analysis
- **Required for compliance** — PCI-DSS and GDPR both expect audit trails for financial and personal data operations

### Why Non-Blocking Audit Logging?

Audit logging should never slow down or break the main operation. If writing an audit log fails (database hiccup, disk full), the invoice should still be created. We use fire-and-forget: the `logAuditEvent()` utility awaits the write but catches errors silently (logs to console as fallback). The main operation doesn't wait for or depend on audit success.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     PayloadCMS                          │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Invoices │───▶│ Payments │    │   Audit Logs     │   │
│  │          │    │          │    │ (append-only)     │   │
│  └────┬─────┘    └────┬─────┘    └──────────────────┘   │
│       │               │                   ▲              │
│       │               │                   │              │
│       │    ┌──────────┘        logAuditEvent()           │
│       │    │                              │              │
│       ▼    ▼                              │              │
│  ┌──────────┐         ┌──────────────────────────────┐  │
│  │  Users   │         │         Hooks Layer          │  │
│  │(existing)│         │  beforeChange (calculate,    │  │
│  └──────────┘         │    generate invoice#, slug)  │  │
│                       │  afterChange (sync status,   │  │
│                       │    log audit events)         │  │
│                       │  beforeDelete (soft delete)  │  │
│                       └──────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              PostgreSQL (via Payload)              │  │
│  │  Tables: invoices, payments, audit_logs, users     │  │
│  │  Indexes: owner+invoiceNumber, status, dueDate,   │  │
│  │           gatewayTransactionId, idempotencyKey     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Data flow for a payment:**
1. Client clicks "Pay with Stripe" on payment page → Stripe Checkout session created
2. Client pays → Stripe fires `checkout.session.completed` webhook
3. Webhook handler creates a Payment record (`status: succeeded`)
4. Payment `afterChange` hook detects `status === 'succeeded'`
5. Hook updates the related Invoice: `status → paid`, `paidAt → now`, `paidVia → stripe`
6. Both the payment creation and invoice update trigger `logAuditEvent()` calls

---

## Database Schema

### Invoices Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceNumber` | text | auto | Per-user serialized: `INV-2026-0001`. Generated by `beforeChange` hook on create. Read-only after creation. |
| `status` | select | yes | `draft` (default), `sent`, `viewed`, `paid`, `overdue`, `cancelled`, `refunded` |
| `client` | group | — | Nested group (see below) |
| `client.name` | text | yes | Client's full name or company name |
| `client.email` | email | yes | Client's email for sending invoice |
| `client.phone` | text | no | Client's phone number |
| `client.address` | textarea | no | Client's full address |
| `client.taxId` | text | no | Client's tax/GST/VAT number |
| `lineItems` | array | yes (min 1) | Array of line item rows |
| `lineItems.description` | text | yes | What was delivered/sold |
| `lineItems.quantity` | number | yes | Qty (min 1) |
| `lineItems.unitPrice` | number | yes | Price per unit (min 0.01) |
| `lineItems.amount` | number | auto | `quantity × unitPrice` — calculated in hook |
| `subtotal` | number | auto | Sum of all `lineItems.amount` — calculated in hook |
| `taxRate` | number | no | Tax percentage (0-100, 2 decimal places) |
| `taxLabel` | text | no | e.g. "GST", "VAT", "Sales Tax" |
| `taxAmount` | number | auto | Calculated: `subtotal × taxRate / 100` |
| `discountType` | select | no | `percentage` or `fixed` |
| `discountValue` | number | no | Discount amount or percentage |
| `discountAmount` | number | auto | Calculated based on type |
| `total` | number | auto | `subtotal - discountAmount + taxAmount` |
| `currency` | select | yes | Enum: USD, EUR, GBP, INR, CAD, AUD, JPY, BRL, MXN, SGD, CHF, SEK, NOK, DKK, NZD, ZAR, HKD, KRW, CNY, PLN |
| `notes` | textarea | no | Payment terms, thank you message |
| `issueDate` | date | yes | Defaults to today |
| `dueDate` | date | yes | When payment is expected |
| `paymentLink` | text | auto | Unique slug for public payment page (e.g. `pay_a1b2c3d4e5f6`). Generated by hook on create. |
| `paidAt` | date | no | Timestamp when payment was received |
| `paidVia` | select | no | `stripe` or `paypal` |
| `stripePaymentIntentId` | text | no | Stripe's payment intent ID |
| `paypalOrderId` | text | no | PayPal's order ID |
| `owner` | relationship | yes | Relationship to Users collection. Auto-set to current user on create. |

**Admin config:**
- `useAsTitle`: `invoiceNumber`
- `defaultColumns`: `invoiceNumber`, `client.name`, `total`, `status`, `dueDate`
- Access: users see only their own invoices, admins see all
- Position `owner` in sidebar

**Indexes:**
- Unique compound: `(owner, invoiceNumber)` — prevents duplicate numbers per user
- `status` — filter by status is the most common query
- `owner` — every query filters by owner
- `dueDate` — for overdue detection

### Payments Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoice` | relationship | yes | Relationship to Invoices collection |
| `gateway` | select | yes | `stripe` or `paypal` |
| `gatewayTransactionId` | text | yes | Stripe payment intent ID or PayPal order ID |
| `amount` | number | yes | Amount paid (in the invoice's currency) |
| `currency` | text | yes | Currency code (matches invoice currency) |
| `status` | select | yes | `pending`, `succeeded`, `failed`, `refunded`, `partially_refunded` |
| `payerEmail` | email | no | Email of the person who paid |
| `payerName` | text | no | Name of the person who paid |
| `metadata` | json | no | Raw gateway response for debugging |
| `idempotencyKey` | text | yes | Unique key to prevent duplicate processing |
| `processedAt` | date | no | When the payment was processed |
| `refundedAt` | date | no | When a refund was issued |
| `refundAmount` | number | no | Partial or full refund amount |

**Admin config:**
- `useAsTitle`: `gatewayTransactionId`
- `defaultColumns`: `invoice`, `gateway`, `amount`, `status`, `processedAt`
- Access: owner of the related invoice or admin
- Read-only for non-admins (payments are created by webhooks, not users)

**Indexes:**
- Unique: `gatewayTransactionId` — no duplicate transactions
- Unique: `idempotencyKey` — prevents duplicate webhook processing
- `invoice` — find all payments for an invoice

### Audit Logs Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | select | yes | e.g. `invoice.created`, `invoice.updated`, `invoice.sent`, `invoice.paid`, `invoice.cancelled`, `payment.received`, `payment.failed`, `payment.refunded`, `user.login`, `user.logout`, `user.updated` |
| `entity` | text | yes | `invoice`, `payment`, or `user` |
| `entityId` | text | yes | ID of the affected record |
| `user` | relationship | no | Who performed the action. Null for webhook-triggered events. |
| `ipAddress` | text | no | Request IP address |
| `userAgent` | text | no | Browser/client user agent string |
| `previousData` | json | no | Snapshot of data before the change |
| `newData` | json | no | Snapshot of data after the change |

**Admin config:**
- `useAsTitle`: `action`
- `defaultColumns`: `action`, `entity`, `entityId`, `user`, `createdAt`
- Access: admin only — read-only, no create/update/delete from the admin panel
- Labels: "Audit Log" (singular), "Audit Logs" (plural)

**Note:** `createdAt` is auto-generated by PayloadCMS (`timestamps: true` is the default). We rely on it as the event timestamp.

---

## Relationships & Data Flow

```
Users (1) ──────────────▶ Invoices (many)
                              │
                              │ (1 invoice → many payments)
                              ▼
                          Payments (many)

Users (1) ──────────────▶ Audit Logs (many)
Invoices (1) ───────────▶ Audit Logs (many)  (via entity + entityId)
Payments (1) ───────────▶ Audit Logs (many)  (via entity + entityId)
```

**Key relationships:**
- `Invoice.owner` → `Users` (many-to-one, required)
- `Payment.invoice` → `Invoices` (many-to-one, required)
- `AuditLog.user` → `Users` (many-to-one, optional — null for system/webhook actions)
- Audit logs reference entities by `entity` (collection name) + `entityId` (record ID) rather than a formal relationship. This avoids circular dependencies and keeps audit logs independent.

**Cascade behavior:**
- Deleting a user: not implemented (admin-only, and we'd need to handle their invoices/payments). For now, users can't be deleted — only admins can, and they should know the implications.
- Deleting an invoice: intercepted by `beforeDelete` hook → converts to `status: cancelled`.
- Deleting a payment: not allowed (payments are immutable financial records).
- Deleting an audit log: not allowed (append-only).

---

## API Contracts

PayloadCMS auto-generates REST endpoints for each collection. These are the ones our frontend and webhooks will use:

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/invoices` | List user's invoices (filtered by access control) |
| `GET` | `/api/invoices/:id` | Get single invoice |
| `POST` | `/api/invoices` | Create new invoice (draft) |
| `PATCH` | `/api/invoices/:id` | Update invoice (only if draft/sent) |
| `DELETE` | `/api/invoices/:id` | Soft delete (hooks convert to status: cancelled) |

**Create Invoice — Request Body:**
```json
{
  "client": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0100",
    "address": "456 Oak Ave, Portland, OR 97201",
    "taxId": "87-6543210"
  },
  "lineItems": [
    {
      "description": "Website redesign",
      "quantity": 1,
      "unitPrice": 2500
    },
    {
      "description": "Monthly maintenance",
      "quantity": 3,
      "unitPrice": 500
    }
  ],
  "taxRate": 10,
  "taxLabel": "Sales Tax",
  "discountType": "percentage",
  "discountValue": 5,
  "currency": "USD",
  "notes": "Payment due within 30 days. Thank you for your business!",
  "issueDate": "2026-09-14",
  "dueDate": "2026-10-14"
}
```

**Response (auto-populated fields):**
```json
{
  "id": "abc123",
  "invoiceNumber": "INV-2026-0001",
  "status": "draft",
  "client": { "..." },
  "lineItems": [
    { "description": "Website redesign", "quantity": 1, "unitPrice": 2500, "amount": 2500 },
    { "description": "Monthly maintenance", "quantity": 3, "unitPrice": 500, "amount": 1500 }
  ],
  "subtotal": 4000,
  "taxRate": 10,
  "taxLabel": "Sales Tax",
  "taxAmount": 380,
  "discountType": "percentage",
  "discountValue": 5,
  "discountAmount": 200,
  "total": 4180,
  "currency": "USD",
  "notes": "Payment due within 30 days...",
  "issueDate": "2026-09-14",
  "dueDate": "2026-10-14",
  "paymentLink": "pay_x7k9m2n4p8q1",
  "paidAt": null,
  "paidVia": null,
  "owner": "user123",
  "createdAt": "2026-09-14T10:30:00.000Z",
  "updatedAt": "2026-09-14T10:30:00.000Z"
}
```

**Calculation order (important):**
```
subtotal     = sum(lineItems[].quantity × lineItems[].unitPrice)
discountAmount = discountType === 'percentage'
                 ? subtotal × discountValue / 100
                 : min(discountValue, subtotal)
taxAmount    = (subtotal - discountAmount) × taxRate / 100
total        = subtotal - discountAmount + taxAmount
```

Note: discount is applied *before* tax. This is the standard approach — you tax the discounted amount, not the full amount.

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments` | List payments (filtered by access) |
| `GET` | `/api/payments/:id` | Get single payment |
| `POST` | `/api/payments` | Create payment (webhook handlers only) |

Payments are created programmatically by webhook handlers, not directly by users. The access control reflects this — users can read payments for their invoices but cannot create/update/delete them through the API.

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit-logs` | List audit logs (admin only) |
| `GET` | `/api/audit-logs/:id` | Get single log entry (admin only) |

No create/update/delete via API. Logs are created only through the `logAuditEvent()` utility using the Local API.

---

## Step-by-Step Implementation Guide

### Step 1: Create Invoices Collection Schema

Create `src/collections/Invoices.ts` with the full field schema.

**What to build:**
- All fields from the schema table above
- Tab layout for admin: "Details" (client + line items), "Financials" (tax, discount, totals), "Payment" (payment link, paid status, gateway IDs)
- `invoiceNumber`, `subtotal`, `taxAmount`, `discountAmount`, `total`, `paymentLink` fields are read-only in admin (generated by hooks)
- `owner` field auto-set to current user and positioned in sidebar
- `status` field in sidebar with colored display
- Currency field with all 20 supported currencies as enum options

**Currency enum values:**
```
USD (US Dollar), EUR (Euro), GBP (British Pound), INR (Indian Rupee),
CAD (Canadian Dollar), AUD (Australian Dollar), JPY (Japanese Yen),
BRL (Brazilian Real), MXN (Mexican Peso), SGD (Singapore Dollar),
CHF (Swiss Franc), SEK (Swedish Krona), NOK (Norwegian Krone),
DKK (Danish Krone), NZD (New Zealand Dollar), ZAR (South African Rand),
HKD (Hong Kong Dollar), KRW (South Korean Won), CNY (Chinese Yuan),
PLN (Polish Zloty)
```

**Fields that are admin read-only (set `admin.readOnly: true`):**
- `invoiceNumber` — auto-generated
- `subtotal`, `taxAmount`, `discountAmount`, `total` — auto-calculated
- `paymentLink` — auto-generated
- `paidAt`, `paidVia`, `stripePaymentIntentId`, `paypalOrderId` — set by payment hooks

### Step 2: Create Invoice Hooks

Create `src/collections/hooks/invoiceHooks.ts` (or separate files per hook).

**Hook 1: `generateInvoiceNumber` (beforeChange, on create only)**
```
Logic:
1. Skip if this is an update (not a create)
2. Get the current year: YYYY
3. Query invoices where owner === current user AND invoiceNumber starts with "INV-{YYYY}-"
4. Sort by invoiceNumber descending, limit 1
5. Extract the counter from the last number (e.g., "INV-2026-0042" → 42)
6. Increment: newCounter = lastCounter + 1
7. Format: "INV-{YYYY}-{counter padded to 4 digits}"
8. Set data.invoiceNumber = formatted number
```

**Hook 2: `calculateTotals` (beforeChange, on create and update)**
```
Logic:
1. For each lineItem: amount = quantity × unitPrice (round to 2 decimals)
2. subtotal = sum of all amounts
3. discountAmount:
   - if discountType === 'percentage': subtotal × discountValue / 100
   - if discountType === 'fixed': min(discountValue, subtotal)
   - if no discount: 0
4. taxAmount = (subtotal - discountAmount) × (taxRate || 0) / 100
5. total = subtotal - discountAmount + taxAmount
6. Round all monetary values to 2 decimal places
```

**Hook 3: `generatePaymentLink` (beforeChange, on create only)**
```
Logic:
1. Skip if this is an update
2. Generate a cryptographically random slug using crypto.randomBytes(9).toString('base64url')
   → produces 12 URL-safe characters
3. Prefix with "pay_": "pay_x7k9m2n4p8q1"
4. Set data.paymentLink = slug
```

**Hook 4: `preventHardDelete` (beforeDelete)**
```
Logic:
1. Check if the invoice has status 'paid' — if yes, throw an error: "Cannot delete paid invoices"
2. Otherwise, update the invoice status to 'cancelled' via payload.update()
3. Throw a Forbidden error to prevent the actual delete
   (The status has already been changed — we just stop the delete from completing)
```

**Why throw after updating?** PayloadCMS's `beforeDelete` hook can cancel the delete by throwing. But we still want the status change, so we update first, then throw. The update persists because it's a separate operation.

### Step 3: Create Invoice Access Control

```
create: authenticated users only (req.user exists)
read:   owner's invoices only (where: owner === req.user.id), admin reads all
update: owner only, AND status must be 'draft' or 'sent' (cannot edit paid/cancelled invoices)
delete: owner only (but beforeDelete hook converts to soft delete)
```

**The update access control is interesting:**
For field-level operations, PayloadCMS access control returns `true/false` or a where-clause. But we also need to check the *current document's status* — you can't update a paid invoice. This requires a function that:
1. Returns a where-clause filtering to the user's own records
2. ALSO checks the document's current status in a `beforeChange` hook (throw if status isn't editable)

Access control filters *which* records you can update. The hook validates *whether* the update is allowed on that specific record.

### Step 4: Create Payments Collection Schema

Create `src/collections/Payments.ts` with:
- All fields from the Payments schema table
- Relationship to Invoices collection
- `gatewayTransactionId` and `idempotencyKey` both unique
- `metadata` as a JSON field for raw gateway response
- Read-only admin config for non-admin users

### Step 5: Create Payment Hooks

Create `src/collections/hooks/paymentHooks.ts`.

**Hook: `syncInvoiceStatus` (afterChange)**
```
Logic:
1. If payment status changed to 'succeeded':
   a. Get the related invoice
   b. Update invoice: status → 'paid', paidAt → now, paidVia → payment.gateway
   c. If gateway is 'stripe': set invoice.stripePaymentIntentId = payment.gatewayTransactionId
   d. If gateway is 'paypal': set invoice.paypalOrderId = payment.gatewayTransactionId
2. If payment status changed to 'refunded':
   a. Update invoice: status → 'refunded'
3. If payment status is 'failed':
   a. Do NOT change invoice status (client can retry)
   b. Log the failure for audit
```

### Step 6: Create Audit Logs Collection Schema

Create `src/collections/AuditLogs.ts` with:
- All fields from the Audit Logs schema table
- Access: admin-only read, no create/update/delete via admin panel or API
- The `action` field uses a select with all event types
- `previousData` and `newData` are JSON fields
- `user` relationship is optional (null for webhook/system events)

### Step 7: Create Audit Logging Utility

Create `src/lib/audit.ts`.

```typescript
// Signature:
async function logAuditEvent(payload: PayloadInstance, params: {
  action: AuditAction       // 'invoice.created' | 'invoice.updated' | ...
  entity: string            // 'invoice' | 'payment' | 'user'
  entityId: string           // ID of the affected record
  user?: string              // User ID (null for system events)
  ipAddress?: string
  userAgent?: string
  previousData?: Record<string, any>
  newData?: Record<string, any>
}): Promise<void>
```

**Key design decisions:**
- Uses `payload.create()` (Local API) to write directly to the audit-logs collection, bypassing access control (since create is disabled for everyone via API)
- Wraps in try/catch — never throws. Audit failures are logged to `console.error` as fallback.
- `overrideAccess: true` flag on the `payload.create()` call since no user has API create access to audit logs.

### Step 8: Wire Up Audit Logging in Existing Hooks

Add `logAuditEvent()` calls to:
- Invoice `afterChange` hook: log `invoice.created` (on create) or `invoice.updated` (on update)
- Invoice `beforeDelete` hook: log `invoice.cancelled` (when soft-deleting)
- Payment `afterChange` hook: log `payment.received` (on succeeded) or `payment.failed` (on failed)

**Getting IP and user agent from hooks:**
PayloadCMS hooks receive `req` (the request object). Extract:
- `req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'`
- `req.headers.get('user-agent') || 'unknown'`

### Step 9: Register Collections and Verify

1. Import all three collections in `payload.config.ts` and add to the `collections` array
2. Run `pnpm dev` — PayloadCMS auto-creates the database tables (or runs migrations)
3. Run `pnpm payload generate:types` to update `payload-types.ts`
4. Verify in admin panel:
   - Invoices, Payments, Audit Logs appear in navigation
   - Create a test invoice — check that `invoiceNumber`, `paymentLink`, calculated fields all populate
   - Check access control — regular user can't see admin-only audit logs
5. Update admin navigation groups if needed

---

## Common Mistakes & Pitfalls

### 1. Floating-Point Arithmetic in Money Calculations

**The bug:** `0.1 + 0.2 === 0.30000000000000004` in JavaScript. If your line item is `qty: 3, price: 19.99`, the amount should be `59.97`, not `59.97000000000001`.

**The fix:** Round all monetary calculations to 2 decimal places:
```typescript
const amount = Math.round(quantity * unitPrice * 100) / 100
```

Do this for every calculated field: `amount`, `subtotal`, `discountAmount`, `taxAmount`, `total`. Never compare floating-point money values with `===` — always round first.

**Even better (production):** Use integer cents internally and only format for display. But for this project, rounding to 2 decimals is sufficient.

### 2. Race Condition on Invoice Number Generation

**The bug:** Two requests to create an invoice arrive simultaneously. Both query the database, both see the last number is `INV-2026-0042`, both try to create `INV-2026-0043`. One fails with a unique constraint violation.

**The fix:** The unique compound index on `(owner, invoiceNumber)` catches this at the database level. But we should also handle the error gracefully — catch the unique violation error and retry with the next number (query again, increment, try again). In practice, this is extremely rare for a single-user tool, but it's good to handle.

### 3. Forgetting `overrideAccess: true` on Internal Operations

**The bug:** The payment `afterChange` hook tries to update the invoice status when payment succeeds. But the hook runs in the context of the webhook request, which has no authenticated user. PayloadCMS access control blocks the update.

**The fix:** All internal operations (hook-to-hook updates, audit logging) must use `overrideAccess: true`:
```typescript
await payload.update({
  collection: 'invoices',
  id: invoiceId,
  data: { status: 'paid', paidAt: new Date().toISOString() },
  overrideAccess: true, // ← critical
})
```

### 4. Letting Users Edit Paid Invoices

**The bug:** A user edits an invoice after a client has already paid. Now the invoice shows different amounts than what was actually paid. This is a financial discrepancy.

**The fix:** The `beforeChange` hook checks the *current* document status (not the incoming data's status). If the current status is `paid`, `cancelled`, or `refunded`, throw an error: "Cannot edit an invoice with status: {status}."

### 5. Hard-Deleting Financial Records

**The bug:** A user deletes an invoice. The payment records still reference it. The audit trail says "invoice.paid" for an invoice that no longer exists. Tax reporting is broken.

**The fix:** The `beforeDelete` hook intercepts all deletes and converts them to status changes. If the invoice is paid, deletion is blocked entirely.

### 6. Duplicate Webhook Processing

**The bug:** Stripe sends the `checkout.session.completed` webhook, your server is slow to respond (takes >5 seconds), Stripe sends it again. Your handler creates two Payment records and tries to update the invoice twice.

**The fix:** The `idempotencyKey` field (unique index) prevents duplicate Payment records. Before processing any webhook, check if a payment with this `gatewayTransactionId` already exists. If it does with the same status, return 200 (already processed). The Payments collection hooks handle the rest.

### 7. Not Validating Currency Consistency

**The bug:** An invoice is in EUR, but the Stripe payment comes back in USD (because the Stripe account is USD-based). The invoice shows "€100 paid" but actually $100 was charged.

**The fix:** When creating a Stripe Checkout session (Feature 07), explicitly pass the invoice's currency. When processing the webhook, verify the payment currency matches the invoice currency. Log a warning if they don't match.

### 8. Tax After Discount vs Tax Before Discount

**The bug:** The calculation order matters. Tax on $100 with 10% discount and 10% tax:
- Discount first: $100 - $10 = $90, tax = $9, total = $99 ✓
- Tax first: $100 + $10 = $110, discount = $11, total = $99 ✓ (same here, but...)
- With percentage discount: results differ depending on order

**The fix:** Always: **Subtotal → Discount → Tax → Total**. This is the standard accounting approach. Document it in the code and in the invoice display.

---

## Production Considerations

### Zero-Decimal Currencies

Some currencies don't use decimal places (JPY, KRW). When integrating with Stripe (Feature 07), amounts for these currencies are already in the smallest unit — `¥1000` means 1000 yen, not 10.00 yen. The `toCents()` utility in Feature 07 will need to handle this. For now in the data layer, all amounts are stored as-is (e.g., `1000` for ¥1000, `19.99` for $19.99).

### Invoice Number Gaps

If an invoice creation fails after the number was generated (e.g., validation error on another field), the number is "used" but no invoice exists with it. The next invoice skips that number. This is normal and acceptable — tax authorities care that numbers are unique and sequential-ish, not that there are zero gaps. Accounting software like QuickBooks has the same behavior.

### Audit Log Volume

Without cleanup, audit logs grow indefinitely. For a portfolio project this is fine. In production, you'd add:
- A PayloadCMS scheduled job (cron) that deletes logs older than 90 days
- Or archive old logs to cold storage (S3, etc.)
- Index on `createdAt` for efficient cleanup queries

We've decided to skip the cleanup job for now and document it as a production concern.

### Multi-Currency Support

The currency is set per-invoice, not per-account. A user can create invoices in different currencies. However, the dashboard analytics (Feature 04) will need to handle multi-currency aggregation — you can't simply sum USD and EUR invoices. That's a Feature 04 concern, not Feature 03.

### Timezone Handling

All dates (`issueDate`, `dueDate`, `paidAt`) are stored as ISO 8601 strings in UTC by PayloadCMS. The frontend displays them in the user's local timezone. The "overdue" check (Feature 04 or a scheduled job) compares `dueDate` against the current UTC date.

---

## Verification Checklist

After implementation, verify each item:

- [ ] **Invoices collection** appears in admin panel with correct fields
- [ ] **Create invoice** — `invoiceNumber` auto-generated in `INV-YYYY-XXXX` format
- [ ] **Create invoice** — `paymentLink` slug auto-generated
- [ ] **Create invoice** — `owner` auto-set to current user
- [ ] **Create invoice** — calculated fields (`subtotal`, `taxAmount`, `discountAmount`, `total`) are correct
- [ ] **Calculation order** — discount applied before tax
- [ ] **Update invoice** — recalculates totals on line item changes
- [ ] **Update invoice** — blocked if status is `paid`, `cancelled`, or `refunded`
- [ ] **Delete invoice** — converts to `status: cancelled` (soft delete)
- [ ] **Delete invoice** — blocked entirely if status is `paid`
- [ ] **Access control** — User A cannot see User B's invoices
- [ ] **Access control** — admin can see all invoices
- [ ] **Payments collection** appears in admin panel
- [ ] **Payments** — `gatewayTransactionId` is unique (try creating a duplicate)
- [ ] **Payments** — `idempotencyKey` is unique
- [ ] **Payment hook** — when status changes to `succeeded`, related invoice updates to `paid`
- [ ] **Audit logs** appear in admin panel (admin only)
- [ ] **Audit logs** — regular users cannot access audit logs
- [ ] **Audit logs** — created when invoices are created/updated/deleted
- [ ] **Audit logs** — created when payments are recorded
- [ ] **No admin CRUD** for audit logs — only viewable, not editable/deletable
- [ ] **Type generation** — `pnpm payload generate:types` succeeds with new collections

---

## PayloadCMS Collection Config Structure

> A reference for understanding how the config keys compose together to define a collection.

### The Collection Shell

A `CollectionConfig` is a JavaScript object that tells PayloadCMS: "create a database table, a REST API, and an admin UI panel — all from this one config."

| Key | What it does |
|-----|-------------|
| `slug` | The unique identifier. Becomes the **database table name**, the **API endpoint** (`/api/{slug}`), and the **admin URL** (`/admin/collections/{slug}`). Everything flows from this one string. |
| `labels` | Human-readable names for the admin UI (`singular`, `plural`). Without this, Payload auto-generates from slug. |
| `admin` | Controls how this collection *looks and behaves* in the admin panel. Not stored in the database — purely UI config. |
| `fields` | The actual data structure. Each object in this array becomes a **database column** + a **form input** + an **API field**. |
| `access` | Per-operation permission functions (`create`, `read`, `update`, `delete`). |
| `hooks` | Code that runs before/after CRUD operations (`beforeChange`, `afterChange`, `beforeDelete`, etc.). |

### Collection-Level `admin` Keys

| Key | What it does |
|-----|-------------|
| `useAsTitle` | Which field's value to display as the document's "name" in list views, relationship selectors, and breadcrumbs. Without it, Payload shows the raw document ID. |
| `defaultColumns` | Which columns appear in the collection's list view. Without this, Payload shows all fields. Supports dot notation for nested fields (e.g. `client.name`). |

### Field Types — What `type` Determines

Every field has a `type` key that simultaneously determines three things: **database column type**, **admin UI widget**, and **API validation**.

| `type` | Database | Admin UI | Example |
|--------|----------|----------|---------|
| `text` | `varchar` | Single-line text input | `invoiceNumber`, `paymentLink` |
| `email` | `varchar` + email validation | Text input with email format check | `client.email` |
| `number` | `numeric` | Number input with increment arrows | `quantity`, `total` |
| `textarea` | `text` (long) | Multi-line text box | `notes`, `address` |
| `select` | `varchar` (stores the `value`) | Dropdown menu | `status`, `currency` |
| `date` | `timestamp` | Date/time picker calendar | `issueDate`, `paidAt` |
| `relationship` | `integer` (foreign key) | Searchable dropdown of related docs | `owner` → `users` |
| `json` | `jsonb` | JSON code editor | `metadata`, `previousData` |
| `checkbox` | `boolean` | Toggle/checkbox | `_verified` |
| `upload` | `integer` (foreign key to media) | File picker with preview | `logo` |

### Container Types — `group`, `array`, `row`

These types organize other fields rather than creating their own database column.

**`group`** — Nests fields under a prefix:
- **Database:** creates prefixed columns (`client_name`, `client_email`)
- **API:** creates a nested object `{ client: { name: "...", email: "..." } }`
- **Admin UI:** renders a labeled section grouping related fields visually

**`array`** — Repeatable rows:
- **Database:** creates a *separate table* with a foreign key back to the parent
- **API:** returns an array of objects `[{ description: "...", quantity: 1 }, ...]`
- **Admin UI:** shows "Add" button, each row can be added/removed/reordered

**`row`** — Layout only (no database or API effect):
- Has **no `name` key** — purely cosmetic
- **Admin UI:** places fields side by side horizontally instead of stacked vertically
- Fields inside a `row` are accessed directly at the top level, not nested

### Field Properties

| Property | What it does | Database effect? |
|----------|-------------|-----------------|
| `name` | The field's identifier — becomes column name, API key, form field name | Yes — column name |
| `type` | What kind of field (see table above) | Yes — column type |
| `required` | Must have a value to save. Adds `NOT NULL` + red asterisk in UI | Yes — `NOT NULL` |
| `unique` | No two documents can share this value. Adds a unique index | Yes — unique index |
| `defaultValue` | Pre-fills on create. Can be static (`'USD'`) or a function (`() => new Date()`) | No — applied at creation time |
| `label` | Overrides auto-generated UI label (`taxId` → "Tax ID / GST / VAT") | No — UI only |
| `min` / `max` | Value bounds for numbers | Yes — validation |
| `minLength` / `maxLength` | Character limits for text | Yes — validation |
| `minRows` | Minimum entries for array fields | Yes — validation |
| `options` | For `select` fields: `{ label: "Draft", value: "draft" }[]`. `value` is stored; `label` is displayed | Yes — enum constraint |
| `relationTo` | For `relationship` fields: which collection slug this links to | Yes — foreign key |

### The Field-Level `admin` Object

Controls how a field looks and behaves in the admin panel only. Zero database effect.

| Property | What it does |
|----------|-------------|
| `readOnly` | Visible but not editable in the UI. Hooks/code can still write to it. Used for calculated fields (`total`) and auto-generated ones (`invoiceNumber`). |
| `position: 'sidebar'` | Moves the field from the main content area to the right sidebar. Used for metadata fields like `status`, `owner`. |
| `placeholder` | Ghost text shown when the field is empty. |
| `description` | Small help text below the field. |
| `width` | Inside a `row`, controls horizontal space (e.g. `'25%'`). Without it, fields split equally. |
| `date.pickerAppearance` | For `date` fields: `'dayOnly'` hides time, `'dayAndTime'` shows both. |
| `date.displayFormat` | For `date` fields: how dates display (e.g. `'MMM d, yyyy'` → "Sep 14, 2026"). |
| `components.Cell` | Custom React component for rendering this field in list view columns. |

### How It All Composes

One field config with every layer:

```typescript
{
  name: 'status',           // → DB column name, API key
  type: 'select',           // → DB stores a string, UI shows a dropdown
  required: true,           // → DB: NOT NULL, UI: red asterisk
  defaultValue: 'draft',    // → new invoices start as "draft"
  options: [                // → the dropdown choices
    { label: 'Draft', value: 'draft' },   // label = UI text, value = stored in DB
    { label: 'Paid', value: 'paid' },
  ],
  admin: {                  // → UI-only settings (zero DB effect)
    position: 'sidebar',    // → renders in the sidebar, not main area
    description: 'Invoice lifecycle status.',  // → help text below the field
  },
}
```

One config object → one database column + one API field + one UI widget + validation rules + layout positioning.

---

## References

- [PayloadCMS Collections Config](https://payloadcms.com/docs/configuration/collections)
- [PayloadCMS Fields Overview](https://payloadcms.com/docs/fields/overview)
- [PayloadCMS Hooks](https://payloadcms.com/docs/hooks/overview)
- [PayloadCMS Access Control](https://payloadcms.com/docs/access-control/overview)
- [PayloadCMS Local API](https://payloadcms.com/docs/local-api/overview)
- [PayloadCMS Relationship Field](https://payloadcms.com/docs/fields/relationship)
- [PayloadCMS JSON Field](https://payloadcms.com/docs/fields/json)
- [Node.js crypto.randomBytes](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)
- [IEEE 754 Floating Point Issues](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
- [Stripe Zero-Decimal Currencies](https://docs.stripe.com/currencies#zero-decimal)
