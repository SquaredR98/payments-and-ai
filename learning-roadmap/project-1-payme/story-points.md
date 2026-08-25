# Project 1: PayMe — Personal Invoice & Payment Link Generator

## Project Overview

**What it is:** A professional invoicing tool where freelancers and small businesses create invoices, generate shareable payment links, and collect payments via Stripe or PayPal. Think a simplified version of Stripe Invoicing or Razorpay Payment Links — but self-hosted and white-label ready.

**Tech Stack:**
- **Backend/CMS:** PayloadCMS (TypeScript-native, self-hosted, built on Next.js)
- **Frontend:** Next.js 16 (App Router)
- **Database:** PostgreSQL (via PayloadCMS's database adapter)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe Checkout (one-time), PayPal Standard
- **Email:** Resend
- **PDF:** @react-pdf/renderer or jsPDF
- **Deployment:** Local development only

**What You Will Learn:**
1. PayloadCMS fundamentals — collections, fields, hooks, access control, admin panel customization
2. Stripe Checkout flow — creating sessions, handling redirects, processing webhooks
3. PayPal Orders API — creating orders, capturing payments, webhook verification
4. Webhook architecture — receiving, verifying, processing, and idempotency
5. PDF generation server-side
6. Transactional email patterns
7. Production security patterns (CSP, CORS, rate limiting, input sanitization)
8. GDPR and PCI-DSS awareness for payment applications

---

## Feature List Summary

1. PayloadCMS setup with custom collections and admin panel
2. Authentication (email/password + Google OAuth via PayloadCMS auth)
3. User profile management
4. Invoice CRUD (create, read, update, soft-delete)
5. Invoice line items with tax and discount calculations
6. Shareable payment link generation
7. Payment link landing page (public, no auth required)
8. Stripe Checkout integration (one-time payments)
9. PayPal Orders API integration
10. Webhook handling (Stripe + PayPal)
11. Payment status tracking and reconciliation
12. PDF invoice generation and download
13. Email notifications (payment received, invoice sent, reminders)
14. Dashboard with stats (total earned, pending, paid, overdue)
15. Revenue charts and analytics
16. Audit logging for all financial events
17. Rate limiting on payment and public endpoints
18. Input sanitization and validation (Zod)
19. Security headers (CSP, HSTS, X-Frame-Options)
20. GDPR compliance (cookie consent, data export, data deletion)
21. PCI-DSS compliance awareness (understanding what Stripe handles vs. your responsibility)
22. Error boundaries and structured logging
23. Responsive UI with dark mode
24. Testing (unit, integration, e2e)

---

## Epic 1: Project Setup & PayloadCMS Configuration

### Story 1.1: Initialize Next.js + PayloadCMS Project

**Task 1.1.1: Create PayloadCMS project with Next.js**
- Acceptance Criteria:
  - Project initialized using `create-payload-app` with Next.js template
  - TypeScript configured with strict mode
  - Project runs locally on `localhost:3000`
  - PayloadCMS admin panel accessible at `/admin`

**Task 1.1.2: Configure PostgreSQL database adapter**
- Acceptance Criteria:
  - `@payloadcms/db-postgres` installed and configured
  - Local PostgreSQL database created for the project
  - Database connection string stored in `.env` (never committed to git)
  - Migrations run successfully on first start

**Task 1.1.3: Configure environment variables**
- Acceptance Criteria:
  - `.env` file created with all required variables (DB URL, Stripe keys, PayPal keys, Resend key)
  - `.env.example` file created with placeholder values (no real secrets)
  - `.gitignore` includes `.env`
  - Environment variables validated at startup using Zod schema (fail fast if missing)

**Task 1.1.4: Setup project folder structure**
- Acceptance Criteria:
  - Folder structure follows convention: `src/collections/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/utils/`, `src/emails/`
  - Shared types directory created for TypeScript interfaces
  - Clear separation between PayloadCMS config and frontend code

**Task 1.1.5: Configure Tailwind CSS + shadcn/ui**
- Acceptance Criteria:
  - Tailwind CSS installed and configured with custom theme (colors, fonts)
  - shadcn/ui initialized with project's design tokens
  - Base components installed (Button, Input, Card, Dialog, Toast, Table, Badge)
  - Global styles set (font family, base colors, dark mode CSS variables)

### Story 1.2: PayloadCMS Admin Panel Customization

**Task 1.2.1: Customize admin panel branding**
- Acceptance Criteria:
  - Admin panel shows "PayMe" logo and branding
  - Custom favicon set
  - Admin meta title set to "PayMe Admin"

**Task 1.2.2: Configure admin panel navigation**
- Acceptance Criteria:
  - Navigation groups organized: "Invoices", "Payments", "Users", "System"
  - Dashboard widget shows key metrics (total invoices, total revenue)
  - Unnecessary default nav items hidden

---

## Epic 2: Authentication & User Management

### Story 2.1: Email/Password Authentication

**Task 2.1.1: Configure PayloadCMS Users collection with auth**
- Acceptance Criteria:
  - Users collection created with `auth: true` config
  - Fields: email, firstName, lastName, businessName, phone, address, logo
  - Email field is unique and required
  - Password meets minimum strength requirements (8+ chars, mixed case, number)

**Task 2.1.2: Build registration page**
- Acceptance Criteria:
  - Registration form at `/register` with fields: email, password, confirm password, first name, last name
  - Client-side validation with Zod (email format, password match, required fields)
  - Server-side validation via PayloadCMS hooks
  - Error messages displayed inline per field
  - Success redirects to dashboard
  - Loading state on submit button

**Task 2.1.3: Build login page**
- Acceptance Criteria:
  - Login form at `/login` with email and password fields
  - "Remember me" checkbox
  - "Forgot password" link
  - Error message for invalid credentials (generic — don't reveal if email exists)
  - Success redirects to dashboard
  - Rate limiting: max 5 failed attempts per 15 minutes per IP

**Task 2.1.4: Implement email verification**
- Acceptance Criteria:
  - Verification email sent on registration via Resend
  - Email contains unique verification token (expires in 24 hours)
  - `/verify-email?token=xxx` endpoint processes verification
  - Unverified users see a banner prompting them to verify
  - Resend verification email button available

**Task 2.1.5: Implement password reset flow**
- Acceptance Criteria:
  - "Forgot password" page at `/forgot-password`
  - Sends reset email with unique token (expires in 1 hour)
  - Reset page at `/reset-password?token=xxx` with new password form
  - Old sessions invalidated after password reset
  - Success message and redirect to login

### Story 2.2: Google OAuth Authentication

**Task 2.2.1: Configure Google OAuth provider**
- Acceptance Criteria:
  - Google Cloud Console project created with OAuth credentials
  - Client ID and Secret stored in environment variables
  - PayloadCMS OAuth strategy configured for Google
  - Redirect URI configured correctly

**Task 2.2.2: Build OAuth login button**
- Acceptance Criteria:
  - "Continue with Google" button on login and registration pages
  - Initiates OAuth flow correctly
  - Handles callback and creates/links user account
  - Extracts name and email from Google profile
  - Handles edge case: user registered with email/password tries Google OAuth with same email

### Story 2.3: Session Management & Route Protection

**Task 2.3.1: Configure session handling**
- Acceptance Criteria:
  - JWT-based sessions via PayloadCMS auth
  - Token expiry set to reasonable duration (e.g., 7 days)
  - Refresh token rotation implemented
  - Tokens stored in httpOnly cookies (not localStorage)
  - Secure flag set in production

**Task 2.3.2: Create auth middleware for protected routes**
- Acceptance Criteria:
  - Middleware checks for valid session on all `/dashboard/*` routes
  - Unauthenticated users redirected to `/login`
  - Auth state available in React context/provider
  - Loading state while checking auth (prevent flash of wrong content)

**Task 2.3.3: Create auth context provider**
- Acceptance Criteria:
  - React context provides: `user`, `isLoading`, `isAuthenticated`, `login()`, `logout()`, `refresh()`
  - Available throughout the app via `useAuth()` hook
  - Handles token refresh automatically
  - Clears state on logout

### Story 2.4: User Profile Management

**Task 2.4.1: Build profile settings page**
- Acceptance Criteria:
  - Profile page at `/dashboard/settings/profile`
  - Edit: first name, last name, business name, phone, address
  - Upload business logo (image validation: max 2MB, jpg/png only)
  - Save button with loading state
  - Success toast on save

**Task 2.4.2: Build business details section**
- Acceptance Criteria:
  - Fields: business name, tax ID/GST number, business address (street, city, state, zip, country)
  - These details auto-populate on invoices
  - Country selector with proper dropdown
  - Address validation (required fields based on country)

**Task 2.4.3: Build account security section**
- Acceptance Criteria:
  - Change password form (current password required)
  - Change email (sends verification to new email)
  - Active sessions list with "revoke" option
  - Two-factor authentication setup (TOTP — optional stretch goal)

---

## Epic 3: Database Schema & Data Layer

### Story 3.1: Design Invoice Collection (PayloadCMS)

**Task 3.1.1: Create Invoice collection schema**
- Acceptance Criteria:
  - Collection: `invoices`
  - Fields:
    - `invoiceNumber` (auto-generated, unique, format: INV-YYYY-XXXX)
    - `status` (enum: draft, sent, viewed, paid, overdue, cancelled, refunded)
    - `client` (group: name, email, phone, address, taxId)
    - `lineItems` (array of: description, quantity, unitPrice, amount)
    - `subtotal` (calculated, virtual field)
    - `taxRate` (percentage)
    - `taxAmount` (calculated)
    - `discountType` (enum: percentage, fixed)
    - `discountValue` (number)
    - `discountAmount` (calculated)
    - `total` (calculated)
    - `currency` (enum: USD, EUR, GBP, INR, etc.)
    - `notes` (rich text — payment terms, thank you message)
    - `dueDate` (date)
    - `issueDate` (date, defaults to today)
    - `paymentLink` (auto-generated unique slug)
    - `paidAt` (timestamp, null until paid)
    - `paidVia` (enum: stripe, paypal, null)
    - `stripePaymentIntentId` (string, null)
    - `paypalOrderId` (string, null)
    - `owner` (relationship to Users collection)
  - Access control: users can only see their own invoices
  - Indexes on: invoiceNumber, status, owner, dueDate

**Task 3.1.2: Create PayloadCMS hooks for Invoice collection**
- Acceptance Criteria:
  - `beforeChange` hook: auto-generate invoiceNumber on create
  - `beforeChange` hook: recalculate subtotal, taxAmount, discountAmount, total on every save
  - `beforeChange` hook: generate unique paymentLink slug on create
  - `afterChange` hook: log to audit trail on status changes
  - `beforeDelete` hook: prevent hard delete — soft delete by setting status to "cancelled"

**Task 3.1.3: Create Invoice collection access control**
- Acceptance Criteria:
  - `create`: authenticated users only
  - `read`: owner of the invoice OR admin
  - `update`: owner only, and only if status is draft or sent (cannot edit paid invoices)
  - `delete`: owner only (soft delete via hook)
  - Admin can read/update all invoices

### Story 3.2: Design Payment Records Collection

**Task 3.2.1: Create Payments collection schema**
- Acceptance Criteria:
  - Collection: `payments`
  - Fields:
    - `invoice` (relationship to Invoices)
    - `gateway` (enum: stripe, paypal)
    - `gatewayTransactionId` (string — Stripe payment intent ID or PayPal order ID)
    - `amount` (number)
    - `currency` (string)
    - `status` (enum: pending, succeeded, failed, refunded, partially_refunded)
    - `payerEmail` (string)
    - `payerName` (string)
    - `metadata` (JSON — raw gateway response data for debugging)
    - `idempotencyKey` (unique string — prevents duplicate processing)
    - `processedAt` (timestamp)
    - `refundedAt` (timestamp, null)
    - `refundAmount` (number, null)
  - Access control: owner of related invoice OR admin
  - Indexes on: gatewayTransactionId, idempotencyKey, invoice

**Task 3.2.2: Create Payments collection hooks**
- Acceptance Criteria:
  - `afterChange` hook: when payment status changes to "succeeded", update related invoice status to "paid"
  - `afterChange` hook: log all payment events to audit trail
  - `beforeChange` hook: validate idempotencyKey uniqueness

### Story 3.3: Design Audit Log Collection

**Task 3.3.1: Create AuditLog collection schema**
- Acceptance Criteria:
  - Collection: `auditLogs`
  - Fields:
    - `action` (enum: invoice.created, invoice.updated, invoice.sent, invoice.paid, payment.received, payment.failed, payment.refunded, user.login, user.logout, user.updated)
    - `entity` (string — "invoice", "payment", "user")
    - `entityId` (string — ID of the affected record)
    - `user` (relationship to Users, nullable for webhook-triggered events)
    - `ipAddress` (string)
    - `userAgent` (string)
    - `previousData` (JSON — snapshot of data before change)
    - `newData` (JSON — snapshot of data after change)
    - `timestamp` (auto-generated)
  - Access control: admin only (read-only, no update/delete)
  - Retention: configurable (e.g., 90 days) — PayloadCMS scheduled job to clean old logs

**Task 3.3.2: Create audit logging utility function**
- Acceptance Criteria:
  - Reusable `logAuditEvent()` function that writes to AuditLog collection
  - Accepts: action, entity, entityId, userId, ipAddress, previousData, newData
  - Called from collection hooks and API handlers
  - Non-blocking (use `process.nextTick` or fire-and-forget — audit logging should never block the main request)

---

## Epic 4: Dashboard & Analytics

### Story 4.1: Dashboard Layout & Navigation

**Task 4.1.1: Create dashboard shell layout**
- Acceptance Criteria:
  - Layout at `/dashboard` with sidebar navigation and main content area
  - Sidebar contains: Dashboard, Invoices, Payments, Settings
  - Top bar with user avatar, notification bell, and logout
  - Mobile responsive: sidebar collapses to hamburger menu
  - Active nav item highlighted

**Task 4.1.2: Create breadcrumb navigation**
- Acceptance Criteria:
  - Breadcrumbs shown on all dashboard pages
  - Auto-generated based on current route
  - Clickable for navigation

### Story 4.2: Dashboard Statistics Cards

**Task 4.2.1: Build stats API endpoint**
- Acceptance Criteria:
  - API route returns: totalRevenue, pendingAmount, paidCount, overdueCount, totalInvoices
  - Filtered by current authenticated user
  - Supports date range filter (this month, last month, this year, all time)
  - Results cached for 5 minutes (invalidated on payment/invoice change)

**Task 4.2.2: Build stats cards UI**
- Acceptance Criteria:
  - 4 cards displayed in a grid: Total Revenue, Pending Amount, Paid Invoices, Overdue Invoices
  - Each card shows: value, percentage change from previous period, trend icon (up/down)
  - Skeleton loading state while data loads
  - Cards are responsive (2x2 grid on mobile, 4x1 on desktop)

### Story 4.3: Revenue Charts

**Task 4.3.1: Build revenue chart API endpoint**
- Acceptance Criteria:
  - Returns revenue data grouped by day/week/month
  - Supports date range selection
  - Breakdown by payment gateway (Stripe vs PayPal)
  - Returns data in chart-ready format

**Task 4.3.2: Build revenue line chart component**
- Acceptance Criteria:
  - Line chart showing revenue over time (using Recharts or Chart.js)
  - Toggle between daily, weekly, monthly views
  - Hover tooltip shows exact amount and date
  - Responsive sizing

**Task 4.3.3: Build payment gateway breakdown pie chart**
- Acceptance Criteria:
  - Pie/donut chart showing percentage split between Stripe and PayPal
  - Color-coded legend
  - Click to filter dashboard by gateway

### Story 4.4: Recent Activity Feed

**Task 4.4.1: Build recent activity API**
- Acceptance Criteria:
  - Returns last 20 audit log entries for the current user
  - Includes: invoice created, invoice paid, payment received, payment failed
  - Paginated

**Task 4.4.2: Build activity feed UI**
- Acceptance Criteria:
  - Vertical timeline showing recent events
  - Each entry shows: icon (based on type), description, timestamp (relative — "2 hours ago")
  - Click to navigate to related invoice/payment
  - "View all" link to full audit log page

---

## Epic 5: Invoice Management (CRUD)

### Story 5.1: Create Invoice Form

**Task 5.1.1: Build invoice creation page**
- Acceptance Criteria:
  - Page at `/dashboard/invoices/new`
  - Multi-section form: Client Details, Line Items, Tax & Discounts, Notes, Settings
  - Form state managed with React Hook Form + Zod validation
  - Auto-save draft every 30 seconds

**Task 5.1.2: Build client details section**
- Acceptance Criteria:
  - Fields: client name (required), email (required, valid format), phone, address (street, city, state, zip, country)
  - "Save client for reuse" checkbox — stores in a Clients collection
  - Client autocomplete dropdown from saved clients
  - Tax ID / GST field for client

**Task 5.1.3: Build currency selector**
- Acceptance Criteria:
  - Dropdown with supported currencies (USD, EUR, GBP, INR, CAD, AUD, etc.)
  - Currency symbol displayed next to all monetary fields
  - Default currency from user profile settings
  - Cannot change currency after line items are added (or show warning)

### Story 5.2: Invoice Line Items Management

**Task 5.2.1: Build line items dynamic form**
- Acceptance Criteria:
  - Add/Remove line item rows dynamically
  - Each row: description (text), quantity (number, min 1), unit price (number, min 0.01), amount (auto-calculated: qty × price)
  - Minimum 1 line item required
  - "Add line item" button at the bottom
  - Drag-to-reorder line items (optional, nice-to-have)
  - Running subtotal displayed below the list

**Task 5.2.2: Validate line item inputs**
- Acceptance Criteria:
  - Description required (min 3 chars, max 200 chars)
  - Quantity must be positive integer
  - Unit price must be positive number with max 2 decimal places
  - Amount field is read-only (auto-calculated)
  - Inline error messages per field
  - Prevent submission if any line item is invalid

### Story 5.3: Tax & Discount Calculations

**Task 5.3.1: Build tax configuration**
- Acceptance Criteria:
  - Tax rate input (percentage, 0-100, supports 2 decimal places)
  - Tax label field (e.g., "GST", "VAT", "Sales Tax")
  - Tax amount auto-calculated: subtotal × taxRate / 100
  - Option: "Tax inclusive" toggle (tax is part of the price vs added on top)
  - Multiple tax rates support (e.g., CGST + SGST in India) — array of tax entries

**Task 5.3.2: Build discount configuration**
- Acceptance Criteria:
  - Discount type toggle: Percentage or Fixed Amount
  - Discount value input
  - Discount calculated correctly:
    - Percentage: subtotal × discountValue / 100
    - Fixed: discountValue (cannot exceed subtotal)
  - Discount applied before tax
  - Order of calculation: Subtotal → Discount → Tax → Total

**Task 5.3.3: Build invoice total calculation**
- Acceptance Criteria:
  - Calculation summary displayed:
    - Subtotal (sum of all line item amounts)
    - Discount (-X)
    - Subtotal after discount
    - Tax (+Y)
    - **Total**
  - All calculations happen client-side for instant feedback
  - Same calculation verified server-side in PayloadCMS hook (never trust client)
  - Currency formatting correct (e.g., $1,234.56)

### Story 5.4: Invoice List View with Filters

**Task 5.4.1: Build invoice list page**
- Acceptance Criteria:
  - Page at `/dashboard/invoices`
  - Table view with columns: Invoice #, Client Name, Amount, Status, Issue Date, Due Date, Actions
  - Status shown as colored badge (green=paid, yellow=pending, red=overdue, gray=draft)
  - Pagination (10/25/50 per page)
  - Sorted by most recent first

**Task 5.4.2: Build filter and search functionality**
- Acceptance Criteria:
  - Search by invoice number or client name
  - Filter by status (dropdown multi-select)
  - Filter by date range (issue date or due date)
  - Filter by payment gateway
  - Clear all filters button
  - URL query params reflect active filters (shareable/bookmarkable)

**Task 5.4.3: Build bulk actions**
- Acceptance Criteria:
  - Checkbox selection on table rows
  - "Select all" checkbox in header
  - Bulk actions: Send (mark as sent), Delete (soft delete), Export as CSV
  - Confirmation dialog before destructive actions
  - Progress indicator for bulk operations

### Story 5.5: Invoice Detail View

**Task 5.5.1: Build invoice detail page**
- Acceptance Criteria:
  - Page at `/dashboard/invoices/[id]`
  - Professional invoice preview (looks like a real printed invoice)
  - Shows all invoice details: business info, client info, line items, totals, notes
  - Payment status prominently displayed
  - If paid: show payment details (gateway, transaction ID, paid date)

**Task 5.5.2: Build invoice action buttons**
- Acceptance Criteria:
  - Actions bar with: Edit (if draft/sent), Send (email to client), Download PDF, Copy Payment Link, Mark as Sent, Delete
  - Actions conditional on invoice status (can't edit a paid invoice)
  - Confirmation dialogs for destructive actions

### Story 5.6: Edit Invoice

**Task 5.6.1: Build invoice edit functionality**
- Acceptance Criteria:
  - Edit page at `/dashboard/invoices/[id]/edit`
  - Pre-populates form with existing invoice data
  - Only allowed if status is "draft" or "sent"
  - Paid/cancelled invoices show "View Only" mode with edit button disabled
  - Saves as draft until explicitly sent
  - Audit log entry on edit (captures previous data for diff)

**Task 5.6.2: Build duplicate invoice functionality**
- Acceptance Criteria:
  - "Duplicate" button creates a new invoice with same line items, client, and settings
  - New invoice gets new invoice number and today's date
  - Status set to "draft"
  - Redirect to edit page of the new invoice

### Story 5.7: Delete Invoice (Soft Delete)

**Task 5.7.1: Implement soft delete**
- Acceptance Criteria:
  - Delete sets status to "cancelled" (not physical deletion)
  - Cancelled invoices hidden from default list view
  - "Show cancelled" filter option to view them
  - Cancelled invoices cannot be edited or have payments processed
  - Audit log entry on deletion
  - If invoice has been paid, prevent deletion entirely (show error: "Cannot delete paid invoices")

---

## Epic 6: Payment Link Generation

### Story 6.1: Generate Shareable Payment Links

**Task 6.1.1: Create payment link generation logic**
- Acceptance Criteria:
  - Each invoice gets a unique payment link slug (e.g., `pay_a1b2c3d4e5`)
  - Slug generated using nanoid or UUID (URL-safe, 12+ characters)
  - Payment link URL format: `{APP_URL}/pay/{slug}`
  - Link generated automatically on invoice creation
  - Link can be regenerated (invalidates old link)

**Task 6.1.2: Build "Copy Link" UI**
- Acceptance Criteria:
  - "Copy Payment Link" button on invoice detail page
  - Copies full URL to clipboard
  - Toast notification: "Payment link copied!"
  - Also shown as a QR code (optional nice-to-have)

### Story 6.2: Payment Link Landing Page

**Task 6.2.1: Build public payment page**
- Acceptance Criteria:
  - Page at `/pay/[slug]` — publicly accessible (no auth required)
  - Shows invoice details: from (business), to (client), line items, total, due date
  - Professional, clean design — this is what clients see
  - Two payment buttons: "Pay with Stripe" and "Pay with PayPal"
  - If invoice is already paid, show "This invoice has been paid" with payment date
  - If invoice is cancelled/expired, show appropriate message

**Task 6.2.2: Add security measures to payment page**
- Acceptance Criteria:
  - Rate limited: max 10 loads per minute per IP
  - No sensitive data exposed (no internal IDs, no owner email details beyond business name)
  - CSRF protection on payment initiation
  - Payment slug is not guessable (cryptographically random)

### Story 6.3: Link Expiry & Access Control

**Task 6.3.1: Implement link expiry**
- Acceptance Criteria:
  - Optional expiry date on payment links (default: due date of invoice)
  - Expired links show "This payment link has expired. Please contact the sender."
  - Link expiry checked on every access
  - Owner can extend/remove expiry from invoice settings

**Task 6.3.2: Implement link viewing tracking**
- Acceptance Criteria:
  - Track when payment link is first viewed (update invoice status to "viewed")
  - Track view count
  - Show "Viewed on {date}" on invoice detail page
  - Track IP and user-agent of viewer (for audit purposes)

---

## Epic 7: Stripe Checkout Integration

### Story 7.1: Stripe Account Setup & API Key Management

**Task 7.1.1: Configure Stripe in the project**
- Acceptance Criteria:
  - `stripe` npm package installed
  - Stripe instance created with API version pinned (e.g., `2024-06-20`)
  - Secret key loaded from environment variable `STRIPE_SECRET_KEY`
  - Publishable key exposed to frontend via `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Separate test and live key variables
  - Stripe instance created in a singleton utility file (`src/lib/stripe.ts`)

**Task 7.1.2: Understand test vs live mode**
- Acceptance Criteria:
  - Documentation in code comments explaining test mode
  - Test mode keys used for development (start with `sk_test_` and `pk_test_`)
  - Test card numbers documented in a comment (4242... for success, 4000... for decline)
  - Clear flag/indicator in UI when running in test mode

### Story 7.2: Create Checkout Session API

**Task 7.2.1: Build Stripe Checkout Session API route**
- Acceptance Criteria:
  - API route: `POST /api/payments/stripe/create-session`
  - Accepts: invoiceId
  - Validates: invoice exists, belongs to the current user, status is "sent" or "viewed" (not already paid)
  - Creates Stripe Checkout Session with:
    - `mode: 'payment'` (one-time)
    - `line_items` mapped from invoice line items (name, quantity, unit_amount in cents)
    - `success_url` with `{CHECKOUT_SESSION_ID}` placeholder
    - `cancel_url` back to payment page
    - `metadata: { invoiceId, paymentLinkSlug }` — critical for webhook processing
    - `customer_email` set to client's email
    - `payment_intent_data.metadata` — same metadata on the payment intent
  - Returns: `{ sessionId, url }` — redirect URL for client

**Task 7.2.2: Handle currency conversion for Stripe**
- Acceptance Criteria:
  - Stripe expects amounts in smallest currency unit (cents for USD, paise for INR)
  - Utility function: `toCents(amount, currency)` handles conversion
  - Zero-decimal currencies handled correctly (JPY, KRW — no conversion needed)
  - Currency code validated against Stripe's supported currencies

**Task 7.2.3: Implement idempotency for session creation**
- Acceptance Criteria:
  - Generate idempotency key based on invoiceId + timestamp
  - Pass idempotency key to `stripe.checkout.sessions.create()`
  - Prevent creating multiple sessions for the same invoice within a short window
  - If session already exists and is not expired, return existing session URL

### Story 7.3: Checkout Success & Cancel Handling

**Task 7.3.1: Build checkout success page**
- Acceptance Criteria:
  - Page at `/pay/[slug]/success?session_id=xxx`
  - Retrieves session from Stripe to verify payment
  - Shows: "Payment Successful!" with amount, invoice number, transaction ID
  - "Download Receipt" button
  - Does NOT rely solely on this page for payment confirmation (webhooks are the source of truth)

**Task 7.3.2: Build checkout cancel page**
- Acceptance Criteria:
  - Page at `/pay/[slug]/cancel`
  - Shows: "Payment was cancelled" with option to try again
  - "Return to Invoice" button
  - Does NOT mark anything in the database (user might retry)

### Story 7.4: Stripe Webhook Setup

**Task 7.4.1: Create webhook endpoint**
- Acceptance Criteria:
  - API route: `POST /api/webhooks/stripe`
  - Raw body parsing (not JSON parsed — required for signature verification)
  - Webhook secret stored in `STRIPE_WEBHOOK_SECRET` environment variable
  - Signature verified using `stripe.webhooks.constructEvent(body, signature, secret)`
  - Returns 200 immediately, processes asynchronously
  - Returns 400 if signature verification fails

**Task 7.4.2: Register webhook in Stripe Dashboard**
- Acceptance Criteria:
  - Webhook registered in Stripe Dashboard (or via CLI for local dev)
  - Events subscribed: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
  - For local development: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - Document the CLI command in README

### Story 7.5: Handle checkout.session.completed Event

**Task 7.5.1: Process successful checkout**
- Acceptance Criteria:
  - Extract `invoiceId` from session metadata
  - Verify session payment status is "paid"
  - Check idempotency: if payment already recorded for this session, skip (return 200)
  - Create Payment record in database with all details
  - Update Invoice status to "paid", set `paidAt`, `paidVia: 'stripe'`, `stripePaymentIntentId`
  - Log audit event: "payment.received"
  - Trigger email notification to invoice owner

**Task 7.5.2: Handle edge cases**
- Acceptance Criteria:
  - If invoice not found in metadata, log error and return 200 (don't retry)
  - If invoice already paid, log warning and return 200 (idempotent)
  - If any database operation fails, return 500 (Stripe will retry)
  - All errors logged with full context (session ID, invoice ID, error message)

### Story 7.6: Handle payment_intent.payment_failed Event

**Task 7.6.1: Process failed payment**
- Acceptance Criteria:
  - Extract invoice ID from payment intent metadata
  - Log failed payment attempt with reason (e.g., "card_declined", "insufficient_funds")
  - Create Payment record with status "failed"
  - Do NOT change invoice status (it's still "sent" — client can retry)
  - Log audit event: "payment.failed"
  - Optionally: send email to invoice owner about failed payment attempt

### Story 7.7: Idempotency & Retry Logic

**Task 7.7.1: Implement webhook idempotency**
- Acceptance Criteria:
  - Before processing any webhook event, check if a Payment record with this `gatewayTransactionId` already exists
  - If exists with same status, skip processing (return 200)
  - If exists with different status, update status (e.g., failed → succeeded)
  - Use database transaction for atomic read-check-write

**Task 7.7.2: Handle Stripe retry behavior**
- Acceptance Criteria:
  - Understand: Stripe retries webhooks up to 3 days with exponential backoff
  - Return 200 for successfully processed events (even if already processed)
  - Return 200 for events we don't handle (ignore gracefully)
  - Return 500 only for transient errors (DB down, network issues)
  - Never return 400/404 for missing data (Stripe will keep retrying pointlessly)

### Story 7.8: Stripe Error Handling & Logging

**Task 7.8.1: Create Stripe error handler utility**
- Acceptance Criteria:
  - Utility function wraps all Stripe API calls in try-catch
  - Categorizes errors: `StripeCardError`, `StripeInvalidRequestError`, `StripeAPIError`, `StripeConnectionError`, `StripeAuthenticationError`
  - Returns user-friendly error messages per category
  - Logs full error details server-side (never expose Stripe error details to client)

**Task 7.8.2: Implement Stripe connection health check**
- Acceptance Criteria:
  - Health check endpoint tests Stripe API connectivity
  - Verifies API key is valid (makes a simple API call like `stripe.balance.retrieve()`)
  - Returns status: healthy/unhealthy
  - Used in application startup to fail fast if Stripe is misconfigured

---

## Epic 8: PayPal Integration

### Story 8.1: PayPal Developer Account & API Setup

**Task 8.1.1: Configure PayPal SDK**
- Acceptance Criteria:
  - PayPal developer account created with sandbox environment
  - `@paypal/checkout-server-sdk` or PayPal REST API client configured
  - Client ID and Secret stored in environment variables
  - Sandbox vs Production mode configurable via env var
  - PayPal client singleton created in `src/lib/paypal.ts`

**Task 8.1.2: Create PayPal sandbox test accounts**
- Acceptance Criteria:
  - Sandbox buyer account created (for testing payments)
  - Sandbox merchant account created
  - Test credentials documented in `.env.example`

### Story 8.2: PayPal Order Creation API

**Task 8.2.1: Build PayPal Create Order endpoint**
- Acceptance Criteria:
  - API route: `POST /api/payments/paypal/create-order`
  - Accepts: invoiceId
  - Validates: invoice exists, status is payable, not already paid
  - Creates PayPal Order with:
    - `intent: 'CAPTURE'`
    - `purchase_units` with: amount, currency, description, invoice_id in custom_id
    - `application_context` with return_url and cancel_url
  - Returns: `{ orderId, approvalUrl }`

**Task 8.2.2: Handle PayPal currency formatting**
- Acceptance Criteria:
  - PayPal expects amounts as strings with 2 decimal places (e.g., "19.99")
  - Utility function: `toPayPalAmount(amount)` formats correctly
  - Currency code validated against PayPal's supported currencies
  - Handle currencies that PayPal doesn't support (show error, suggest Stripe)

### Story 8.3: PayPal Checkout Button Integration

**Task 8.3.1: Build PayPal button on payment page**
- Acceptance Criteria:
  - PayPal Smart Buttons rendered on `/pay/[slug]` page
  - Uses `@paypal/react-paypal-js` for client-side rendering
  - Button styled to match overall payment page design
  - createOrder callback calls your API to create the order
  - onApprove callback calls your API to capture the payment

### Story 8.4: PayPal Capture & Confirmation

**Task 8.4.1: Build PayPal Capture Order endpoint**
- Acceptance Criteria:
  - API route: `POST /api/payments/paypal/capture-order`
  - Accepts: orderId
  - Captures the approved PayPal order
  - Verifies capture status is "COMPLETED"
  - Extracts payer info (email, name)
  - Creates Payment record in database
  - Updates Invoice status to "paid", `paidVia: 'paypal'`, `paypalOrderId`
  - Returns success response
  - Idempotency: check if already captured before attempting

### Story 8.5: PayPal Webhook Setup

**Task 8.5.1: Create PayPal webhook endpoint**
- Acceptance Criteria:
  - API route: `POST /api/webhooks/paypal`
  - Verify webhook signature using PayPal's verification API
  - Handle events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
  - Process events idempotently (same as Stripe webhook pattern)
  - Return 200 for all received events

**Task 8.5.2: Configure PayPal webhooks**
- Acceptance Criteria:
  - Webhook URL registered in PayPal Developer Dashboard
  - Webhook ID stored in environment variable `PAYPAL_WEBHOOK_ID`
  - Events subscribed correctly
  - Local testing strategy documented (PayPal doesn't have a CLI like Stripe — use ngrok or sandbox webhooks)

### Story 8.6: PayPal Error Handling

**Task 8.6.1: Create PayPal error handler utility**
- Acceptance Criteria:
  - Handles PayPal-specific errors: INSTRUMENT_DECLINED, PAYER_ACTION_REQUIRED, ORDER_NOT_APPROVED
  - User-friendly error messages per error type
  - Server-side logging of full error details
  - Retry guidance for transient errors

---

## Epic 9: PDF Invoice Generation

### Story 9.1: Invoice PDF Template Design

**Task 9.1.1: Design PDF template layout**
- Acceptance Criteria:
  - Professional invoice PDF layout:
    - Header: Business logo + name + address on left, "INVOICE" on right
    - Invoice details: Invoice #, Issue Date, Due Date, Status
    - Client details: Name, Address, Email
    - Line items table: Description, Qty, Unit Price, Amount
    - Totals section: Subtotal, Discount, Tax, Total (bold)
    - Footer: Payment terms, notes, "Thank you for your business"
  - Consistent styling with color accent from user's brand settings
  - A4 size format

### Story 9.2: Server-Side PDF Generation

**Task 9.2.1: Implement PDF generation endpoint**
- Acceptance Criteria:
  - API route: `GET /api/invoices/[id]/pdf`
  - Generates PDF using `@react-pdf/renderer` or `jsPDF`
  - Pulls all invoice data from database
  - Renders PDF with designed template
  - Returns PDF as `Content-Type: application/pdf` with `Content-Disposition: attachment`
  - File named: `Invoice-{invoiceNumber}.pdf`

**Task 9.2.2: Handle PDF generation edge cases**
- Acceptance Criteria:
  - Long descriptions wrap correctly (no overflow)
  - Many line items paginate properly (table continues on next page)
  - Currency symbols render correctly for all supported currencies
  - Special characters in text don't break the PDF
  - Large logos are resized proportionally

### Story 9.3: PDF Storage & Download

**Task 9.3.1: Cache generated PDFs**
- Acceptance Criteria:
  - Generated PDFs cached (regenerated only when invoice data changes)
  - Cache invalidated on invoice update
  - Download button on invoice detail page triggers PDF download
  - PDF also attached to email when invoice is sent to client

---

## Epic 10: Email Notifications

### Story 10.1: Email Service Setup

**Task 10.1.1: Configure Resend email service**
- Acceptance Criteria:
  - Resend SDK installed and configured (`resend` npm package)
  - API key stored in environment variable
  - Default "from" address configured (e.g., `invoices@payme.local`)
  - Email sending utility function created in `src/lib/email.ts`
  - Domain verification documented (for production)

**Task 10.1.2: Create base email template**
- Acceptance Criteria:
  - Shared HTML email template with: header (logo), body (slot), footer (unsubscribe, company info)
  - Responsive email design (works in Gmail, Outlook, Apple Mail)
  - Using `@react-email/components` for template creation
  - Template supports dynamic content injection

### Story 10.2: Payment Received Email (to Invoice Owner)

**Task 10.2.1: Build payment received email**
- Acceptance Criteria:
  - Triggered when payment webhook confirms successful payment
  - Content: "You received a payment of {amount} for Invoice #{number} from {clientName}"
  - Includes: amount, payment method (Stripe/PayPal), transaction ID, link to invoice detail
  - Sent to invoice owner's email

### Story 10.3: Payment Confirmation Email (to Client/Payer)

**Task 10.3.1: Build payment confirmation email**
- Acceptance Criteria:
  - Triggered after successful payment
  - Sent to the payer's email (extracted from payment data)
  - Content: "Your payment of {amount} for Invoice #{number} has been received"
  - Includes: amount, receipt link, PDF attachment
  - Professional design matching business branding

### Story 10.4: Invoice Sent Email (to Client)

**Task 10.4.1: Build invoice email**
- Acceptance Criteria:
  - Triggered when invoice owner clicks "Send Invoice"
  - Sent to client's email
  - Content: subject "Invoice #{number} from {businessName}", body with amount, due date, payment link
  - Prominent "Pay Now" button linking to payment page
  - PDF invoice attached

### Story 10.5: Invoice Reminder Email

**Task 10.5.1: Build reminder email**
- Acceptance Criteria:
  - Manual trigger: "Send Reminder" button on overdue invoices
  - Content: "Reminder: Invoice #{number} is overdue"
  - Shows: amount due, original due date, days overdue, payment link
  - Polite but clear tone

**Task 10.5.2: Build automated reminders (stretch goal)**
- Acceptance Criteria:
  - PayloadCMS scheduled job (cron) checks for overdue invoices daily
  - Sends reminder at: due date, 3 days after, 7 days after, 14 days after
  - Tracks reminder count (stop after 4 reminders)
  - Owner can disable auto-reminders per invoice

---

## Epic 11: Security & Compliance

### Story 11.1: PCI-DSS Compliance Awareness

**Task 11.1.1: Understand PCI-DSS responsibility model**
- Acceptance Criteria:
  - Documentation comment in codebase explaining: "We use Stripe Checkout and PayPal hosted buttons — card data NEVER touches our server"
  - No card number, CVV, or expiry fields in our forms (ever)
  - Stripe.js and PayPal SDK handle all PCI-sensitive data client-side
  - Server only receives tokens/session IDs — never raw card data
  - SAQ-A compliance level documented

**Task 11.1.2: Ensure no sensitive payment data is logged**
- Acceptance Criteria:
  - Logging utility strips: card numbers, CVVs, full API keys
  - Stripe webhook payloads logged without sensitive fields
  - PayPal response logging excludes payer financial details
  - Audit logs never contain raw payment instrument data

### Story 11.2: GDPR Compliance

**Task 11.2.1: Implement cookie consent**
- Acceptance Criteria:
  - Cookie consent banner shown to all visitors
  - Three options: Essential Only, Accept All, Customize
  - Consent preference stored in cookie
  - Analytics/tracking only loaded if user consents
  - Consent state accessible via utility function

**Task 11.2.2: Implement data export (Right to Access)**
- Acceptance Criteria:
  - API endpoint: `POST /api/user/export-data`
  - Exports all user data as JSON: profile, invoices, payments, audit logs
  - Excludes system fields and internal IDs
  - Returns downloadable JSON file
  - Rate limited: max 1 export per 24 hours

**Task 11.2.3: Implement data deletion (Right to Erasure)**
- Acceptance Criteria:
  - API endpoint: `POST /api/user/delete-account`
  - Requires password confirmation
  - Soft deletes user account
  - Anonymizes personal data (replace name/email with "DELETED")
  - Retains financial records for legal compliance (but anonymized)
  - Sends confirmation email before deletion (72-hour grace period)
  - Cancels any active Stripe sessions

**Task 11.2.4: Privacy policy page**
- Acceptance Criteria:
  - Privacy policy page at `/privacy`
  - Covers: what data we collect, why, how long we keep it, who we share it with (Stripe, PayPal, Resend)
  - Cookie policy section
  - Contact information for data requests
  - Last updated date

### Story 11.3: Security Headers

**Task 11.3.1: Configure Content Security Policy (CSP)**
- Acceptance Criteria:
  - CSP header set via Next.js middleware or headers config
  - Allows: self, Stripe JS SDK domain (`js.stripe.com`), PayPal SDK domain, Resend tracking pixel
  - Blocks: inline scripts (except nonces for required inline), external frames (except Stripe/PayPal)
  - Report-only mode first, then enforce after testing

**Task 11.3.2: Configure other security headers**
- Acceptance Criteria:
  - `X-Frame-Options: DENY` (prevent clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - Configured in `next.config.js` headers section

### Story 11.4: Input Sanitization & Validation

**Task 11.4.1: Implement Zod validation on all API inputs**
- Acceptance Criteria:
  - Every API route validates request body with Zod schema
  - Validation happens before any business logic
  - Error responses include field-level error messages
  - Schemas reused between frontend and backend (shared types)

**Task 11.4.2: Sanitize user-generated content**
- Acceptance Criteria:
  - Invoice notes and descriptions sanitized to prevent XSS
  - Client names and business names sanitized
  - HTML tags stripped from text inputs
  - Rich text fields (if any) sanitized with DOMPurify server-side
  - Database queries parameterized (PayloadCMS/Prisma handles this, but verify)

### Story 11.5: Rate Limiting

**Task 11.5.1: Implement rate limiting**
- Acceptance Criteria:
  - Rate limit on auth endpoints: 5 requests/minute per IP
  - Rate limit on payment endpoints: 10 requests/minute per IP
  - Rate limit on webhook endpoints: 100 requests/minute per IP (Stripe sends bursts)
  - Rate limit on public payment page: 30 requests/minute per IP
  - Return 429 Too Many Requests with `Retry-After` header
  - Use in-memory store for development, Redis for production

### Story 11.6: Audit Logging

**Task 11.6.1: Implement comprehensive audit logging**
- Acceptance Criteria:
  - All invoice CRUD operations logged
  - All payment events logged
  - All auth events logged (login, logout, failed login, password reset)
  - All data export/deletion requests logged
  - Log entries include: action, userId, ipAddress, timestamp, entityType, entityId, changes
  - Audit logs are append-only (cannot be modified or deleted except by retention policy)

---

## Epic 12: Error Monitoring & Logging

### Story 12.1: Structured Logging Setup

**Task 12.1.1: Configure structured logger**
- Acceptance Criteria:
  - Logging utility created using `pino` or `winston`
  - Log levels: debug, info, warn, error
  - Structured JSON format in production
  - Pretty-print format in development
  - Request ID included in all log entries (correlation)
  - Sensitive fields redacted (passwords, API keys, card numbers)

**Task 12.1.2: Add request logging middleware**
- Acceptance Criteria:
  - Every API request logged: method, path, status code, duration, IP
  - Request ID generated and attached to request context
  - Response time tracked
  - Error responses include stack trace in logs (not in API response)

### Story 12.2: Error Boundary Components

**Task 12.2.1: Create React error boundaries**
- Acceptance Criteria:
  - Global error boundary wraps entire app
  - Granular error boundaries around: dashboard, invoice form, payment page
  - Error boundary UI shows friendly message: "Something went wrong" with "Try Again" button
  - Error details logged to console in development
  - Error reported to logging service in production

### Story 12.3: API Error Handling Middleware

**Task 12.3.1: Create global error handler**
- Acceptance Criteria:
  - All unhandled errors caught by global error handler
  - Error response format: `{ error: { message, code, details } }`
  - HTTP status codes used correctly (400 for validation, 401 for auth, 403 for forbidden, 404 for not found, 500 for server error)
  - Stack traces never sent to client in production
  - All errors logged with request context

### Story 12.4: Payment Error Tracking

**Task 12.4.1: Create payment error dashboard**
- Acceptance Criteria:
  - Track all failed payments with reason
  - Track webhook processing errors
  - Track Stripe API errors
  - Track PayPal API errors
  - Viewable in admin panel
  - Alert mechanism for critical failures (e.g., webhook endpoint returning 500s)

---

## Epic 13: Testing

### Story 13.1: Unit Tests for Payment Logic

**Task 13.1.1: Test invoice calculation logic**
- Acceptance Criteria:
  - Tests for: subtotal calculation, tax calculation, discount calculation, total calculation
  - Tests for: percentage discount, fixed discount, tax inclusive, tax exclusive
  - Tests for: zero amounts, negative amounts (rejected), currency precision
  - Tests for: multiple line items, empty line items

**Task 13.1.2: Test idempotency logic**
- Acceptance Criteria:
  - Test: processing same webhook event twice produces same result
  - Test: concurrent webhook processing doesn't create duplicate payments
  - Test: idempotency key generation is deterministic

### Story 13.2: Integration Tests for API Routes

**Task 13.2.1: Test invoice CRUD endpoints**
- Acceptance Criteria:
  - Test: create invoice, read invoice, update invoice, soft-delete invoice
  - Test: access control (user A can't see user B's invoices)
  - Test: validation errors return proper error messages
  - Test: unauthenticated requests return 401

**Task 13.2.2: Test payment endpoints**
- Acceptance Criteria:
  - Test: create Stripe checkout session with valid invoice
  - Test: create PayPal order with valid invoice
  - Test: reject payment for already-paid invoice
  - Test: reject payment for cancelled invoice

### Story 13.3: Stripe Test Mode & Test Cards

**Task 13.3.1: Document and test with Stripe test cards**
- Acceptance Criteria:
  - Test with: 4242424242424242 (success)
  - Test with: 4000000000000002 (decline)
  - Test with: 4000000000003220 (3D Secure required)
  - Test with: 4000000000009995 (insufficient funds)
  - Test webhook events using Stripe CLI
  - Verify all payment states are handled correctly

### Story 13.4: E2E Tests for Payment Flows

**Task 13.4.1: E2E test: complete Stripe payment flow**
- Acceptance Criteria:
  - Test: Create invoice → Generate link → Open link → Pay with Stripe → Verify invoice marked as paid
  - Uses Playwright or Cypress
  - Runs against Stripe test mode

**Task 13.4.2: E2E test: complete PayPal payment flow**
- Acceptance Criteria:
  - Test: Create invoice → Generate link → Open link → Pay with PayPal → Verify invoice marked as paid
  - Uses PayPal sandbox
  - Handles PayPal redirect flow

---

## Epic 14: UI/UX Polish & Responsive Design

### Story 14.1: Design System Setup

**Task 14.1.1: Configure design tokens**
- Acceptance Criteria:
  - Color palette defined (primary, secondary, success, warning, error, neutral)
  - Typography scale defined (heading sizes, body sizes, font weights)
  - Spacing scale defined (consistent padding/margin values)
  - Border radius and shadow values defined
  - Dark mode color palette defined
  - All tokens configured in Tailwind config

**Task 14.1.2: Build core UI components**
- Acceptance Criteria:
  - Components via shadcn/ui: Button, Input, Select, Textarea, Card, Dialog, Sheet, Toast, Badge, Table, Tabs, Avatar, Dropdown Menu
  - All components support dark mode
  - All components are accessible (ARIA attributes, keyboard navigation)

### Story 14.2: Responsive Layout

**Task 14.2.1: Implement responsive dashboard**
- Acceptance Criteria:
  - Desktop (1024px+): full sidebar + main content
  - Tablet (768-1023px): collapsible sidebar + main content
  - Mobile (< 768px): bottom nav or hamburger menu + full-width content
  - Tables convert to card layout on mobile
  - Forms stack vertically on mobile
  - All interactive elements meet minimum touch target size (44x44px)

### Story 14.3: Loading States & Skeletons

**Task 14.3.1: Implement skeleton loading**
- Acceptance Criteria:
  - Skeleton components for: stats cards, invoice table rows, invoice detail, chart
  - Shimmer animation on skeletons
  - Shown while data is being fetched
  - Matches the actual content layout to prevent layout shift

**Task 14.3.2: Implement action loading states**
- Acceptance Criteria:
  - All buttons show spinner when action is in progress
  - Buttons disabled during loading (prevent double-click)
  - Forms disabled during submission
  - Navigation prevented during unsaved changes (prompt: "You have unsaved changes")

### Story 14.4: Toast Notifications & Feedback

**Task 14.4.1: Implement toast notification system**
- Acceptance Criteria:
  - Toast component using shadcn/ui Sonner or Toast
  - Types: success (green), error (red), warning (yellow), info (blue)
  - Auto-dismiss after 5 seconds (configurable)
  - Dismissable by click
  - Stacks multiple toasts vertically
  - Used for: save success, payment received, error messages, copy-to-clipboard confirmation

### Story 14.5: Dark Mode

**Task 14.5.1: Implement dark mode toggle**
- Acceptance Criteria:
  - Toggle in header/settings
  - Persisted in localStorage
  - Respects system preference on first visit (`prefers-color-scheme`)
  - All components support dark mode colors
  - No flash of wrong theme on page load (SSR-safe)
  - Payment page also supports dark mode (important for professionalism)

---

## Production Checklist

### Security
- [ ] All API keys stored in environment variables, never in code
- [ ] Stripe webhook signatures verified on every request
- [ ] PayPal webhook signatures verified on every request
- [ ] No raw card data touches the server (PCI-DSS SAQ-A)
- [ ] CSP headers configured and enforced
- [ ] HSTS enabled
- [ ] X-Frame-Options set to DENY
- [ ] All user inputs validated with Zod schemas
- [ ] HTML content sanitized (XSS prevention)
- [ ] Rate limiting on all public and auth endpoints
- [ ] Passwords hashed with bcrypt (PayloadCMS handles this)
- [ ] JWT tokens in httpOnly cookies
- [ ] CORS configured to allow only known origins
- [ ] Sensitive data redacted from logs

### Payments
- [ ] Stripe Checkout creates sessions with metadata for traceability
- [ ] PayPal Orders created with proper reference IDs
- [ ] All webhook events processed idempotently
- [ ] Payment status in DB matches gateway status (reconciliation)
- [ ] Failed payments logged but don't change invoice status
- [ ] Refund flow implemented and tested
- [ ] Currency handling correct (cents conversion, zero-decimal currencies)
- [ ] Test mode vs Live mode clearly separated

### Data & Compliance
- [ ] GDPR cookie consent implemented
- [ ] Data export endpoint working
- [ ] Account deletion with data anonymization working
- [ ] Privacy policy page exists
- [ ] Audit log captures all financial events
- [ ] Audit logs are append-only
- [ ] Financial records retained even after account deletion (legal requirement)
- [ ] Data retention policy defined and documented

### Reliability
- [ ] Error boundaries prevent full-page crashes
- [ ] Structured logging captures all errors with context
- [ ] Webhook endpoint returns 200 for already-processed events
- [ ] Webhook endpoint returns 500 for transient errors (enables retry)
- [ ] Health check endpoint available
- [ ] Database connection pooling configured
- [ ] Application starts up with validation of all required env vars

### UX
- [ ] All forms have client-side AND server-side validation
- [ ] Loading skeletons prevent layout shift
- [ ] Buttons disabled during async operations
- [ ] Toast notifications for all user actions
- [ ] Responsive design tested on mobile, tablet, desktop
- [ ] Dark mode works across all pages
- [ ] Payment page is professional and trustworthy looking
- [ ] Error messages are user-friendly (no technical jargon)
