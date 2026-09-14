# PayMe — Customer Journey

> **Purpose:** This document explains how PayMe works from the perspective of the people using it. Read this before diving into any feature doc — it gives you the "why" behind every screen, API, and database record we build.

---

## Table of Contents

1. [Who Uses PayMe](#who-uses-payme)
2. [The Two User Journeys](#the-two-user-journeys)
3. [Journey A: The Freelancer (Invoice Creator)](#journey-a-the-freelancer)
   - [A1. Signing Up](#a1-signing-up)
   - [A2. Setting Up Their Business Profile](#a2-setting-up-their-business-profile)
   - [A3. Creating an Invoice](#a3-creating-an-invoice)
   - [A4. Sending the Invoice](#a4-sending-the-invoice)
   - [A5. Tracking Payment Status](#a5-tracking-payment-status)
   - [A6. Getting Paid](#a6-getting-paid)
   - [A7. Reviewing Their Dashboard](#a7-reviewing-their-dashboard)
   - [A8. Managing Invoices Over Time](#a8-managing-invoices-over-time)
4. [Journey B: The Client (Invoice Payer)](#journey-b-the-client)
   - [B1. Receiving the Invoice](#b1-receiving-the-invoice)
   - [B2. Viewing the Payment Page](#b2-viewing-the-payment-page)
   - [B3. Paying with Stripe](#b3-paying-with-stripe)
   - [B4. Paying with PayPal](#b4-paying-with-paypal)
   - [B5. After Payment](#b5-after-payment)
5. [Journey C: The Admin](#journey-c-the-admin)
6. [The Complete Flow Diagram](#the-complete-flow-diagram)
7. [How Each Feature Fits In](#how-each-feature-fits-in)
8. [What Happens Behind the Scenes](#what-happens-behind-the-scenes)

---

## Who Uses PayMe

PayMe has **three types of users**:

| User | Who they are | What they do | Auth required? |
|------|-------------|-------------|----------------|
| **Freelancer** | A freelancer, consultant, or small business owner | Creates invoices, sends payment links to clients, tracks payments, reviews revenue | Yes — email/password account |
| **Client** | The freelancer's customer (the person being invoiced) | Receives a payment link, views the invoice, pays via Stripe or PayPal | No — public page, no account needed |
| **Admin** | System administrator | Manages users, views all invoices/payments, reviews audit logs | Yes — admin role in PayloadCMS |

The **Freelancer** is the primary user. Everything we build revolves around making their invoicing workflow fast, professional, and trustworthy.

The **Client** is a secondary user. They interact with exactly one page — the payment link landing page. They never create an account. Their experience must be clean, professional, and trust-inspiring (they're handing over money).

The **Admin** lives in the PayloadCMS admin panel. They see everything.

---

## The Two User Journeys

```
FREELANCER JOURNEY                          CLIENT JOURNEY
==================                          ==============

Sign Up                                     
    |                                       
Set Up Business Profile                     
    |                                       
Create Invoice                              
    |                                       
Send Invoice -------- email with link ------> Receives Email
    |                                              |
    |                                        Opens Payment Page
    |                                              |
Track Status <--- "viewed" status update ---  Views Invoice Details
    |                                              |
    |                                        Pays with Stripe/PayPal
    |                                              |
Get Paid <------- webhook notification ----  Payment Confirmed
    |                                              |
Dashboard Analytics                          Gets Receipt Email
    |
Download PDF / Send Reminders
```

---

## Journey A: The Freelancer

### A1. Signing Up

**What happens:**
The freelancer visits PayMe, clicks "Get Started", and creates an account with their email and password. They receive a verification email and click the link to confirm their address.

**Screens involved:**
- `/register` — Registration form (email, password, confirm password, first name, last name)
- `/verify-email?token=xxx` — Email verification landing page
- `/login` — Login form for returning users
- `/forgot-password` and `/reset-password` — Password recovery flow

**What we build:** Feature 02 (Authentication & User Management)

**Why it matters:** The freelancer needs an account so their invoices are tied to them. Email verification prevents someone from creating invoices under a fake email. Password requirements and lockout after 5 failed attempts protect their financial data.

---

### A2. Setting Up Their Business Profile

**What happens:**
After first login, the freelancer lands on the dashboard. They go to Settings and fill in their business details: business name, tax ID, address, and optionally upload a logo. This information auto-populates on every invoice they create.

**Screens involved:**
- `/dashboard/settings` — Settings page with tabs:
  - **Profile** — First name, last name, phone, email
  - **Business** — Business name, tax ID, address (street, city, state, zip, country)
  - **Security** — Change password, change email

**What we build:** Feature 02, Steps 9-11 (already done)

**Why it matters:** Clients see the freelancer's business name, address, and logo on invoices and on the payment page. A professional-looking invoice with proper business details builds trust and makes the client more likely to pay promptly.

---

### A3. Creating an Invoice

**What happens:**
The freelancer clicks "New Invoice" from the dashboard or invoices list. They fill in:

1. **Client details** — Who are they billing? Name, email, phone, address, tax ID.
2. **Line items** — What work did they do? Each row has a description, quantity, and unit price. The amount per row is auto-calculated.
3. **Currency** — What currency is this invoice in? (USD, EUR, INR, etc.)
4. **Dates** — Issue date (defaults to today) and due date (when payment is expected).
5. **Tax** — Optional tax rate (e.g., 10% GST) with a label.
6. **Discount** — Optional discount (percentage or fixed amount).
7. **Notes** — Payment terms, thank-you message, or other notes.

**What happens automatically (hooks):**
- `invoiceNumber` is generated: `INV-2026-0001` (per-user, per-year, sequential)
- `paymentLink` slug is generated: `pay_x7k9m2n4p8q1` (cryptographically random)
- `subtotal`, `discountAmount`, `taxAmount`, and `total` are calculated
- `owner` is set to the current user
- An audit log entry is created: `invoice.created`
- The invoice starts in `draft` status

**Screens involved:**
- `/dashboard/invoices/new` — Invoice creation form

**What we build:** Feature 03 (data layer, done), Feature 05 (CRUD UI, upcoming)

**Why it matters:** This is the core action. The form must be fast (no unnecessary steps), smart (auto-calculations update instantly), and forgiving (draft status means nothing is final until they explicitly send it).

---

### A4. Sending the Invoice

**What happens:**
The freelancer reviews the invoice and clicks "Send". This:
1. Changes the invoice status from `draft` to `sent`
2. Sends an email to the client with the invoice details and a "Pay Now" button
3. The "Pay Now" button links to: `{APP_URL}/pay/{paymentLink}`
4. A PDF of the invoice is attached to the email
5. An audit log entry is created: `invoice.sent`

Alternatively, the freelancer can just copy the payment link and share it via WhatsApp, Slack, or any other channel.

**Screens involved:**
- `/dashboard/invoices/[id]` — Invoice detail page with "Send" and "Copy Link" buttons

**What we build:** Feature 05 (invoice actions), Feature 06 (payment link), Feature 09 (PDF), Feature 10 (email)

**Why it matters:** The freelancer chose PayMe because they don't want to chase payments manually. "Send Invoice" should be one click — the system handles the email, the link, and the PDF.

---

### A5. Tracking Payment Status

**What happens:**
After sending, the freelancer can see the invoice's journey through these statuses:

```
draft → sent → viewed → paid
                  ↘ overdue (if past due date)
                  ↘ cancelled (if freelancer deletes)
         paid → refunded (if payment is refunded)
```

- **Viewed**: When the client opens the payment link page, the status updates to `viewed` and the freelancer sees "Viewed on Sep 15, 2026" on the invoice detail page
- **Overdue**: If the due date passes without payment, a scheduled job marks it as `overdue`
- **Paid**: When the client pays, the webhook updates the status automatically

**Screens involved:**
- `/dashboard/invoices` — Invoice list with status badges (color-coded)
- `/dashboard/invoices/[id]` — Invoice detail showing current status + timeline

**What we build:** Feature 03 (status field, done), Feature 05 (list UI), Feature 06 (viewed tracking)

**Why it matters:** The freelancer needs to know at a glance: has the client seen it? Have they paid? Is it overdue? This status tracking replaces the mental load of remembering who owes what.

---

### A6. Getting Paid

**What happens:**
The freelancer doesn't do anything here — this happens automatically via webhooks:

1. Client pays via Stripe or PayPal (see Journey B)
2. The payment gateway sends a webhook to our server
3. Our webhook handler:
   - Verifies the webhook signature (security)
   - Creates a `Payment` record in the database
   - Updates the `Invoice` status to `paid`, sets `paidAt` and `paidVia`
   - Logs audit events: `payment.received` and `invoice.paid`
4. The freelancer gets an email: "You received $2,500.00 for Invoice INV-2026-0003 from Jane Smith"

**Screens involved:**
- The freelancer sees the update on their dashboard and invoice list — no action needed

**What we build:** Feature 07 (Stripe), Feature 08 (PayPal), Feature 10 (payment notification email)

**Why it matters:** The freelancer's money shows up without them doing anything. The webhook-driven architecture means no polling, no manual checking, no "mark as paid" button. The payment gateway is the source of truth.

---

### A7. Reviewing Their Dashboard

**What happens:**
The freelancer visits their dashboard to see the big picture:

- **Stats cards**: Total Revenue, Pending Amount, Paid Invoices, Overdue Invoices
- **Revenue chart**: Line chart showing earnings over time (daily/weekly/monthly)
- **Gateway breakdown**: Pie chart showing Stripe vs PayPal split
- **Recent activity**: Timeline of recent events (invoice created, payment received, etc.)

They can filter by time period (this month, last month, this year, all time).

**Screens involved:**
- `/dashboard` — Main dashboard with widgets

**What we build:** Feature 04 (Dashboard & Analytics, next up)

**Why it matters:** The dashboard answers the question "How is my business doing?" without the freelancer needing to open a spreadsheet. Revenue trends, overdue tracking, and activity feeds give them confidence and control.

---

### A8. Managing Invoices Over Time

**What happens over weeks and months:**

- **Editing**: Freelancer realizes they forgot a line item → edits the invoice (only if `draft` or `sent`, never `paid`)
- **Duplicating**: Monthly retainer client → duplicate last month's invoice, adjust dates
- **Deleting**: Made a test invoice → "deletes" it (actually sets status to `cancelled`, hidden from default view)
- **Reminders**: Client hasn't paid and it's overdue → freelancer clicks "Send Reminder" (sends a polite overdue email)
- **Downloading PDF**: Client requests a PDF copy → freelancer downloads or emails it
- **Refunds**: Client disputes → freelancer processes refund through gateway → webhook updates invoice to `refunded`

**What we build:** Feature 05 (CRUD), Feature 09 (PDF), Feature 10 (reminders)

**Why it matters:** Invoicing is not a one-time action. The freelancer will come back daily/weekly to manage their invoices. Every action must be intuitive and every state transition must be obvious.

---

## Journey B: The Client

The client **never creates an account**. They interact with PayMe through exactly one URL: the payment link.

### B1. Receiving the Invoice

**What happens:**
The client receives an email (or a link via WhatsApp/Slack/etc.) with:
- Subject: "Invoice #INV-2026-0003 from Ravi's Design Studio"
- Body: Amount due, due date, and a prominent "Pay Now" button
- Attachment: PDF of the invoice
- The "Pay Now" button links to: `https://payme.app/pay/pay_x7k9m2n4p8q1`

**What we build:** Feature 10 (invoice email)

---

### B2. Viewing the Payment Page

**What happens:**
The client clicks the link and lands on a public page showing:

- **From**: Business name, logo, address (the freelancer's info)
- **To**: Client name, email, address
- **Invoice details**: Invoice number, issue date, due date
- **Line items table**: Description, Qty, Unit Price, Amount
- **Totals**: Subtotal, Discount (-), Tax (+), **Total Due**
- **Two payment buttons**: "Pay with Stripe" and "Pay with PayPal"

If the invoice is already paid: "This invoice has been paid on Sep 20, 2026"
If the invoice is cancelled: "This invoice is no longer active"
If the link is expired: "This payment link has expired. Contact the sender."

**Behind the scenes:**
- The invoice status updates to `viewed` on first access
- View count and viewer IP/user-agent are tracked (audit)
- The page is rate-limited (10 loads/min per IP)
- No sensitive data is exposed (no internal IDs, no freelancer's personal email)

**Screens involved:**
- `/pay/[slug]` — Public payment landing page

**What we build:** Feature 06 (payment link page)

**Why it matters:** This is the moment of trust. The client is about to give their money. The page must look professional, load fast, show clear amounts, and present familiar payment options (Stripe/PayPal logos). Any friction or doubt here means lost revenue for the freelancer.

---

### B3. Paying with Stripe

**What happens:**
1. Client clicks "Pay with Stripe"
2. Our server creates a Stripe Checkout Session with the invoice's line items, amount, and currency
3. Client is redirected to Stripe's hosted checkout page (stripe.com domain — trusted)
4. Client enters their card details on Stripe's page (card data **never touches our server**)
5. Payment succeeds → Stripe redirects to `/pay/[slug]/success`
6. Stripe sends a `checkout.session.completed` webhook to our server
7. Our webhook handler creates a Payment record and updates the Invoice

```
Client clicks "Pay with Stripe"
    |
    v
Our API: POST /api/payments/stripe/create-session
    |  (creates Stripe Checkout Session with invoice details)
    v
Redirect to Stripe Checkout (hosted on stripe.com)
    |  (client enters card details — we NEVER see the card number)
    v
Payment succeeds
    |
    +--> Redirect to /pay/[slug]/success  (client sees "Payment Successful!")
    |
    +--> Stripe fires webhook: checkout.session.completed
              |
              v
         Our webhook handler:
           1. Verify signature
           2. Create Payment record (status: succeeded)
           3. Update Invoice (status: paid, paidAt, paidVia: stripe)
           4. Log audit events
           5. Send email to freelancer
           6. Send receipt to client
```

**What we build:** Feature 07 (Stripe Checkout)

---

### B4. Paying with PayPal

**What happens:**
1. Client clicks "Pay with PayPal"
2. Our server creates a PayPal Order
3. Client is redirected to PayPal's approval page (or uses the PayPal popup)
4. Client logs into their PayPal account and approves the payment
5. Our server captures the payment
6. PayPal sends a `PAYMENT.CAPTURE.COMPLETED` webhook

The flow is similar to Stripe but uses PayPal's API and UI instead.

**What we build:** Feature 08 (PayPal Integration)

---

### B5. After Payment

**What happens:**
- Client sees a success page: "Payment of $2,500.00 received. Thank you!"
- Client receives a receipt email with a PDF attached
- The payment link page now shows "This invoice has been paid" if visited again
- The freelancer sees the payment on their dashboard

**What we build:** Feature 07/08 (success pages), Feature 10 (receipt email), Feature 09 (PDF)

---

## Journey C: The Admin

The admin operates entirely within the PayloadCMS admin panel at `/admin`.

**What they can do:**
- View all users, invoices, payments, and audit logs (across all freelancers)
- Edit user roles (promote to admin)
- View the audit trail for any event
- Cannot create invoices or payments (those are user/webhook operations)
- Cannot edit or delete audit logs (append-only)

**What we build:** The admin panel is largely built-in with PayloadCMS. We customized it in Features 01, 01.5, and 03.

---

## The Complete Flow Diagram

```
+------------------+         +------------------+         +------------------+
|   FREELANCER     |         |     PAYME        |         |     CLIENT       |
+------------------+         +------------------+         +------------------+
|                  |         |                  |         |                  |
| 1. Sign up  -----|-------->| Create account   |         |                  |
|                  |         | Send verify email|-------->| (email inbox)    |
|                  |         |                  |         |                  |
| 2. Setup biz ----|-------->| Save profile     |         |                  |
|                  |         |                  |         |                  |
| 3. Create inv ---|-------->| Generate:        |         |                  |
|                  |         |  - Invoice #     |         |                  |
|                  |         |  - Payment link  |         |                  |
|                  |         |  - Calculations  |         |                  |
|                  |         |  - Audit log     |         |                  |
|                  |         |                  |         |                  |
| 4. Send inv  ----|-------->| Send email + PDF |-------->| 5. Opens email   |
|                  |         | Status: sent     |         |                  |
|                  |         |                  |         | 6. Clicks link   |
|                  |         | Status: viewed <-|---------|    /pay/[slug]   |
|                  |         |                  |         |                  |
|                  |         |                  |         | 7. Pays (Stripe) |
|                  |         |                  |         |        |         |
|                  |         |        Stripe Checkout     |        |         |
|                  |         |             |              |        v         |
|                  |         |        Webhook fires       |   Success page   |
|                  |         |             |              |                  |
|                  |         | 8. Process payment:       |                  |
|                  |         |  - Create Payment rec      |                  |
|                  |         |  - Invoice → paid          |                  |
|                  |         |  - Audit log               |                  |
|                  |         |  - Email freelancer|       |                  |
| 9. Gets notified |<--------|  - Email client   |------>| Gets receipt     |
|                  |         |                  |         |                  |
| 10. Dashboard ---|-------->| Stats, charts,   |         |                  |
|                  |         | activity feed    |         |                  |
+------------------+         +------------------+         +------------------+
```

---

## How Each Feature Fits In

This maps every feature to the specific user journey step it enables:

| Feature | What It Builds | Journey Step |
|---------|---------------|-------------|
| **01. Project Setup** | Next.js + PayloadCMS + Tailwind + DB | Foundation — no user-facing flow |
| **01.5. Theming & Admin Shell** | Admin panel customization, nav, theme | Admin experience (Journey C) |
| **02. Authentication** | Sign up, login, verify email, settings | A1 (Sign Up), A2 (Business Profile) |
| **03. Database Schema** | Invoices, Payments, AuditLogs collections, hooks | A3 (data layer behind Create Invoice), A6 (data layer behind Get Paid) |
| **04. Dashboard & Analytics** | Stats cards, revenue charts, activity feed | A7 (Review Dashboard) |
| **05. Invoice Management** | Create/edit/list/detail/delete invoice UI | A3 (Create), A4 (Send), A5 (Track), A8 (Manage) |
| **06. Payment Link** | Payment link page, viewed tracking, link expiry | A4 (Send), B2 (View Payment Page) |
| **07. Stripe Checkout** | Stripe session creation, webhook handling | B3 (Pay with Stripe), A6 (Get Paid) |
| **08. PayPal Integration** | PayPal order creation, webhook handling | B4 (Pay with PayPal), A6 (Get Paid) |
| **09. PDF Generation** | Invoice PDF template, download, email attachment | A4 (Send), A8 (Download), B5 (Receipt) |
| **10. Email Notifications** | Invoice sent, payment received, reminders | A4 (Send), A6 (Notification), A8 (Reminders), B1 (Receive), B5 (Receipt) |
| **11. Security & Compliance** | CSP, GDPR, rate limiting, input sanitization | Cross-cutting — protects all journeys |
| **12. Error Monitoring** | Structured logging, error boundaries | Cross-cutting — reliability for all journeys |
| **13. Testing** | Unit, integration, E2E tests | Cross-cutting — confidence for all journeys |
| **14. UI/UX Polish** | Responsive design, loading states, dark mode | Cross-cutting — polish for all journeys |

---

## What Happens Behind the Scenes

These are the invisible processes that no user sees, but that make everything work:

### Webhook Processing
When Stripe or PayPal processes a payment, they send an HTTP POST (webhook) to our server. This is how we know a payment happened — we never trust the client-side redirect alone. The webhook is verified (signature check), processed idempotently (duplicate detection via `idempotencyKey`), and triggers all downstream effects (Payment record, Invoice status update, audit log, emails).

### Audit Logging
Every financially relevant action creates an audit log entry: who did what, when, from where, and what changed. This runs as fire-and-forget (never blocks the main operation). Admin can review the complete trail in the admin panel.

### Invoice Number Generation
Each freelancer gets their own sequential number series per year. User A's invoices: INV-2026-0001, INV-2026-0002. User B's invoices: INV-2026-0001, INV-2026-0002. A compound unique index on `(owner, invoiceNumber)` prevents collisions.

### Auto-Calculations
Every time an invoice is created or updated, the `calculateTotals` hook runs: line item amounts, subtotal, discount (applied before tax), tax, and total — all rounded to 2 decimal places to avoid floating-point issues.

### Soft Delete
Deleting an invoice doesn't remove it from the database. The `beforeDelete` hook intercepts the delete, changes the status to `cancelled`, and then throws an error to cancel the actual deletion. Paid invoices cannot be deleted at all. Financial records must be preserved for legal and auditing purposes.

### Status Guards
Paid, cancelled, and refunded invoices cannot be edited. The `guardStatus` hook checks the current status before allowing any update. This prevents financial discrepancies (e.g., changing the amount after payment).

### Overdue Detection
A scheduled job (or dashboard query) checks invoices where `status === 'sent'` and `dueDate < today`. These get marked as `overdue`. The freelancer sees them highlighted on their dashboard and can send reminder emails.
