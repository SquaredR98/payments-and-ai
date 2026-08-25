# Project 4: GigBoard — Freelance Services Marketplace

## Project Overview

**What it is:** A Fiverr-like platform where freelancers list services (gigs), clients hire them, payments are held in escrow, and released on delivery approval. Uses Stripe Connect Express for freelancer onboarding with Stripe-hosted forms.

**Tech Stack:**
- **Backend:** Hono (lightweight, Web Standard API framework) on Bun runtime
- **Frontend:** TanStack Start (full-stack React framework with TanStack Router)
- **Database:** PostgreSQL + Prisma
- **Real-time:** WebSocket (via Hono's WebSocket support on Bun)
- **Styling:** Tailwind CSS + Ark UI (headless component library)
- **Payments:** Stripe Connect Express, Escrow pattern (manual capture), Separate Charges and Transfers
- **AI:** Claude API (Anthropic) — service description generator, smart tags, proposal writer
- **Deployment:** Local development only

**Why Hono + Bun:** Hono is a lightweight, fast web framework built on Web Standards (Request/Response/fetch). Bun is an all-in-one JS runtime that's significantly faster than Node.js. Learning these prepares you for the modern JS runtime landscape.

**Why TanStack Start:** TanStack Start is a full-stack React framework built on TanStack Router. It gives you type-safe routing, server functions, and SSR — a Next.js alternative in the TanStack ecosystem.

**What You Will Learn:**
1. Hono framework — routing, middleware, context, WebSocket, error handling
2. Bun runtime — package management, bundling, speed advantages
3. TanStack Start/Router — file-based routing, loaders, type-safe navigation
4. Stripe Connect Express — Stripe-hosted onboarding, Account Links
5. Escrow payments — manual capture (authorize then capture later)
6. Separate charges and transfers — charge buyer, hold funds, transfer to seller on approval
7. Order state machine — modeling complex workflows
8. WebSocket real-time chat
9. Claude API — text generation, structured output
10. Dispute resolution patterns

---

## Feature List Summary

1. Hono backend setup with Bun runtime
2. TanStack Start frontend setup
3. PostgreSQL + Prisma database layer
4. JWT authentication with role-based access (Client, Freelancer, Admin)
5. User registration with role selection
6. Freelancer profile with portfolio
7. Freelancer onboarding via Stripe Connect Express (Account Links)
8. Connected account capability monitoring
9. Gig/Service creation with tiered packages (Basic/Standard/Premium)
10. Gig discovery (search, filters, categories)
11. Order placement with package selection
12. Escrow payment (Payment Intent with manual capture)
13. Order lifecycle state machine (Paid → In Progress → Delivered → Review → Complete)
14. Payment capture and transfer on delivery approval
15. Revision request flow
16. Order cancellation and refund
17. Auto-complete timer (if client doesn't respond)
18. Dispute resolution system
19. Real-time chat (WebSocket) between client and freelancer
20. AI service description generator (Claude API)
21. AI smart tag suggestion
22. AI proposal writer for custom requests
23. Reviews and ratings (mutual: client ↔ freelancer)
24. Notification system (in-app + email)
25. Admin panel (users, gigs, orders, disputes, revenue)
26. Security (headers, CORS, rate limiting, validation)
27. GDPR compliance
28. PCI-DSS awareness
29. Audit logging
30. Testing
31. Responsive UI with dark mode

---

## Epic 1: Project Setup & Architecture

### Story 1.1: Initialize Hono Backend with Bun

**Task 1.1.1: Setup Bun project**
- Acceptance Criteria:
  - Bun installed globally
  - Project initialized with `bun init`
  - TypeScript configured with strict mode
  - `bun run dev` starts the server with hot reload

**Task 1.1.2: Configure Hono application**
- Acceptance Criteria:
  - Hono installed (`bun add hono`)
  - Main app created in `src/index.ts`
  - Server runs on `localhost:8000`
  - Base middleware: logger, cors, error handler
  - Route grouping: `/api/auth/*`, `/api/gigs/*`, `/api/orders/*`, `/api/payments/*`, `/api/chat/*`, `/api/ai/*`, `/api/admin/*`
  - Health check endpoint: `GET /api/health`

**Task 1.1.3: Configure PostgreSQL + Prisma with Bun**
- Acceptance Criteria:
  - Prisma installed and configured for PostgreSQL
  - Prisma Client generated (works with Bun)
  - Database connection string in `.env`
  - Initial migration created

**Task 1.1.4: Configure environment variables**
- Acceptance Criteria:
  - `.env` with: DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, ANTHROPIC_API_KEY, JWT_SECRET, FRONTEND_URL, RESEND_API_KEY
  - Bun reads `.env` natively (no dotenv needed)
  - Validation with Zod at startup

### Story 1.2: Initialize TanStack Start Frontend

**Task 1.2.1: Setup TanStack Start project**
- Acceptance Criteria:
  - TanStack Start project initialized
  - TypeScript configured
  - File-based routing configured
  - Dev server runs on `localhost:3000`
  - API proxy to Hono backend configured

**Task 1.2.2: Configure Tailwind CSS + Ark UI**
- Acceptance Criteria:
  - Tailwind CSS installed with custom theme
  - Ark UI installed (headless, accessible component primitives)
  - Base components styled: Button, Input, Dialog, Menu, Tabs, Toast, Select, Switch
  - Dark mode CSS variables configured

**Task 1.2.3: Configure TanStack Router**
- Acceptance Criteria:
  - Route tree defined:
    - Public: `/`, `/login`, `/register`, `/gigs`, `/gigs/$slug`, `/sellers/$username`
    - Protected: `/dashboard/`, `/dashboard/orders/`, `/dashboard/gigs/` (freelancer), `/dashboard/messages/`, `/dashboard/settings/`
    - Admin: `/admin/`
  - Layout routes for shared navigation
  - Type-safe route params
  - Auth guard on protected routes

---

## Epic 2: Authentication & Authorization

### Story 2.1: User Registration

**Task 2.1.1: Build registration endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/auth/register`
  - Accepts: email, password, firstName, lastName, username, role (client/freelancer)
  - Validates with Zod: email format, password (8+ chars, uppercase, number), username (alphanumeric, 3-20 chars, unique)
  - Hashes password with bcrypt (or Bun's built-in `Bun.password.hash()`)
  - Creates user in database
  - Returns JWT access token + refresh token
  - Rate limited: 3/hour per IP

**Task 2.1.2: Build registration form**
- Acceptance Criteria:
  - Page at `/register`
  - Role selection: "I want to hire" (client) / "I want to freelance" (freelancer) / "Both"
  - Fields based on role: basic for client, extended for freelancer (skills, bio, hourly rate)
  - Client-side validation
  - Loading state, error handling

### Story 2.2: Login & JWT Authentication

**Task 2.2.1: Build login endpoint**
- Acceptance Criteria:
  - `POST /api/auth/login`
  - Returns: access token (15 min), refresh token (7 days)
  - Refresh token stored in database
  - Rate limited: 5 attempts/15 min per IP
  - Audit log: login event

**Task 2.2.2: Build Hono JWT middleware**
- Acceptance Criteria:
  - Custom Hono middleware: `authMiddleware`
  - Extracts JWT from `Authorization: Bearer xxx` header
  - Verifies and decodes token
  - Attaches user to Hono context: `c.set('user', decodedUser)`
  - Returns 401 for invalid/expired token

**Task 2.2.3: Build role-based authorization middleware**
- Acceptance Criteria:
  - `requireRole('freelancer')` middleware
  - Checks `c.get('user').role` against required roles
  - Returns 403 if insufficient
  - Composable: `requireRole('freelancer', 'admin')` for multiple allowed roles

### Story 2.3: Refresh Token & Password Reset

**Task 2.3.1: Build refresh token endpoint**
- Acceptance Criteria:
  - `POST /api/auth/refresh`
  - Token rotation (old refresh token invalidated)
  - Replay detection
  - Returns new token pair

**Task 2.3.2: Build password reset flow**
- Acceptance Criteria:
  - `POST /api/auth/forgot-password` — sends reset email
  - `POST /api/auth/reset-password` — validates token, updates password
  - Invalidates all refresh tokens on password reset

---

## Epic 3: Database Schema Design

### Story 3.1: Core Models

**Task 3.1.1: Create User model**
- Acceptance Criteria:
  - Fields: id, email, username, hashedPassword, firstName, lastName, role (CLIENT/FREELANCER/BOTH/ADMIN), avatar, bio, isEmailVerified, stripeConnectedAccountId, createdAt, updatedAt
  - Unique constraints: email, username
  - Indexes on: email, username, role

**Task 3.1.2: Create FreelancerProfile model**
- Acceptance Criteria:
  - Fields: id, userId (unique, one-to-one), title (professional title), bio, skills (string array), hourlyRate, country, languages, responseTime, totalEarnings, completedOrders, averageRating, reviewCount, level (NEW/LEVEL_1/LEVEL_2/TOP_RATED), portfolioItems (JSON array)
  - Relation: belongs to User

**Task 3.1.3: Create Gig model**
- Acceptance Criteria:
  - Fields: id, freelancerId, title, slug (unique), description (rich text), categoryId, subcategoryId, tags (string array), status (DRAFT/PENDING_REVIEW/ACTIVE/PAUSED/ARCHIVED), images (string array — URLs), faqItems (JSON array of {question, answer}), totalOrders, averageRating, reviewCount, createdAt, updatedAt
  - Relation: belongs to FreelancerProfile, has many GigPackages

**Task 3.1.4: Create GigPackage model**
- Acceptance Criteria:
  - Fields: id, gigId, tier (BASIC/STANDARD/PREMIUM), title, description, price (decimal), deliveryDays (integer), revisions (integer, -1 for unlimited), features (string array — what's included)
  - Relation: belongs to Gig
  - Each gig has exactly 3 packages (one per tier)

**Task 3.1.5: Create Category and Subcategory models**
- Acceptance Criteria:
  - Category: id, name, slug, description, icon, sortOrder
  - Subcategory: id, categoryId, name, slug, description, sortOrder
  - Seed data: Programming & Tech, Design & Creative, Writing & Translation, Video & Animation, Music & Audio, Business, Marketing

### Story 3.2: Order & Payment Models

**Task 3.2.1: Create Order model**
- Acceptance Criteria:
  - Fields: id, orderNumber (unique, auto-generated: ORD-XXXXX), clientId (User), freelancerId (User), gigId, packageTier (BASIC/STANDARD/PREMIUM), status (enum: see state machine below), requirements (text — client's brief), deliveryDeadline (datetime), price (decimal), platformFee (decimal), freelancerAmount (decimal), currency, stripePaymentIntentId, stripeTransferId, deliveredAt, completedAt, cancelledAt, disputeId, revisionCount (integer), autoCompleteAt (datetime), createdAt, updatedAt
  - Order status state machine:
    ```
    PENDING_PAYMENT → PAID → IN_PROGRESS → DELIVERED → UNDER_REVIEW → COMPLETED
                                                ↓              ↓
                                          REVISION_REQUESTED   DISPUTED → RESOLVED
                                                ↓
                                          IN_PROGRESS (back to revision)
    PENDING_PAYMENT → CANCELLED
    PAID → CANCELLED (with refund)
    ```
  - Indexes on: orderNumber, clientId, freelancerId, status

**Task 3.2.2: Create Delivery model**
- Acceptance Criteria:
  - Fields: id, orderId, message (text), attachments (JSON array of file URLs), deliveredAt, revisionNumber (integer)
  - Relation: belongs to Order
  - Multiple deliveries per order (initial + revisions)

**Task 3.2.3: Create Payment model**
- Acceptance Criteria:
  - Fields: id, orderId, stripePaymentIntentId, amount, platformFee, freelancerAmount, currency, status (AUTHORIZED/CAPTURED/CANCELLED/REFUNDED), capturedAt, transferredAt, refundedAt, idempotencyKey (unique), metadata (JSON)
  - Indexes on: stripePaymentIntentId, orderId, idempotencyKey

**Task 3.2.4: Create Dispute model**
- Acceptance Criteria:
  - Fields: id, orderId, raisedBy (USER_ID), reason (enum: NOT_AS_DESCRIBED/MISSING_REQUIREMENTS/QUALITY_ISSUES/COMMUNICATION/OTHER), description (text), evidence (JSON array — file URLs), status (OPEN/UNDER_REVIEW/RESOLVED_REFUND/RESOLVED_PARTIAL_REFUND/RESOLVED_RELEASED/CLOSED), adminNotes (text), resolvedAt, resolution (text), refundAmount (decimal, nullable)
  - Relation: belongs to Order

### Story 3.3: Chat & Review Models

**Task 3.3.1: Create Conversation and Message models**
- Acceptance Criteria:
  - Conversation: id, orderId (nullable — can chat before ordering), participantIds (User array), lastMessageAt, createdAt
  - Message: id, conversationId, senderId, content (text), attachments (JSON), messageType (TEXT/FILE/SYSTEM), readAt (nullable), createdAt
  - Indexes on: conversationId + createdAt (for chronological loading)

**Task 3.3.2: Create Review model**
- Acceptance Criteria:
  - Fields: id, orderId, reviewerId, revieweeId, rating (1-5), title, comment, type (CLIENT_TO_FREELANCER/FREELANCER_TO_CLIENT), createdAt
  - Constraint: one review per user per order
  - Relation: belongs to Order

**Task 3.3.3: Create AuditLog model**
- Acceptance Criteria:
  - Fields: id, action, entity, entityId, userId, ipAddress, details (JSON), createdAt
  - Append-only
  - Indexed on: entity + entityId, userId, createdAt

---

## Epic 4: Freelancer Onboarding (Stripe Connect Express)

### Story 4.1: Create Express Connected Account

**Task 4.1.1: Build Connect Express onboarding endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/stripe/connect/onboard`
  - Requires: authenticated freelancer
  - Creates Stripe Express account: `stripe.accounts.create({ type: 'express', capabilities: { card_payments: {requested: true}, transfers: {requested: true} }, metadata: { userId } })`
  - Stores `stripeConnectedAccountId` on user record
  - Returns: account ID for next step

**Task 4.1.2: Generate Account Link for onboarding**
- Acceptance Criteria:
  - Hono route: `POST /api/stripe/connect/account-link`
  - Creates Account Link: `stripe.accountLinks.create({ account: connectedAccountId, refresh_url, return_url, type: 'account_onboarding' })`
  - `refresh_url`: user comes back here if link expires → regenerate
  - `return_url`: user comes back here after completing onboarding
  - Returns: `{ url }` — redirect user to this Stripe-hosted onboarding page

**Task 4.1.3: Understand Express vs Standard vs Custom**
- Acceptance Criteria:
  - Code comments explaining:
    - **Express**: Stripe hosts the onboarding forms (identity verification, bank account, etc.). You generate an Account Link, user completes on Stripe's site. You get back a verified account. Balance of control vs simplicity.
    - vs Standard (Project 3): User connects existing Stripe account via OAuth
    - vs Custom (Project 6): You build the entire onboarding UI yourself

### Story 4.2: Handle Onboarding Return

**Task 4.2.1: Build onboarding return handler**
- Acceptance Criteria:
  - Return URL page: `/dashboard/settings/stripe/return`
  - On mount: fetches account status from backend
  - Backend endpoint: `GET /api/stripe/connect/status`
  - Checks: `account.charges_enabled`, `account.payouts_enabled`, `account.details_submitted`
  - If fully onboarded: show success, redirect to dashboard
  - If not complete: show "Please complete your Stripe setup" with new Account Link

**Task 4.2.2: Build refresh URL handler**
- Acceptance Criteria:
  - Refresh URL page: `/dashboard/settings/stripe/refresh`
  - Generates new Account Link automatically
  - Redirects user back to Stripe to continue onboarding
  - Handles case where link expired

### Story 4.3: Monitor Account Status

**Task 4.3.1: Build account.updated webhook handler**
- Acceptance Criteria:
  - Webhook event: `account.updated`
  - Checks updated account capabilities
  - Updates local records (chargesEnabled, payoutsEnabled)
  - If charges became disabled: pause freelancer's active gigs (can't receive payments)
  - Notify freelancer if action required
  - Log audit event

**Task 4.3.2: Build onboarding status UI**
- Acceptance Criteria:
  - Seller settings shows Stripe connection status:
    - Not connected: "Connect Stripe" button
    - Onboarding incomplete: "Complete Setup" button (generates new Account Link)
    - Fully connected: green badge, country, "View Stripe Dashboard" link
  - Stripe Express Dashboard link: `stripe.accounts.createLoginLink(connectedAccountId)`

---

## Epic 5: Gig/Service Management (Freelancer Side)

### Story 5.1: Create Gig

**Task 5.1.1: Build gig creation form**
- Acceptance Criteria:
  - Multi-step form at `/dashboard/gigs/new`:
    - Step 1: Title, Category, Subcategory
    - Step 2: Description (rich text editor), FAQ items
    - Step 3: Packages (Basic/Standard/Premium — price, delivery days, revisions, features)
    - Step 4: Images (upload up to 5), Tags
    - Step 5: Review and Submit
  - Progress indicator showing current step
  - Each step saves as draft (resume later)

**Task 5.1.2: Build package configuration**
- Acceptance Criteria:
  - Three-column layout: Basic | Standard | Premium
  - Each column: title (editable), description, price ($5-$10,000), delivery time (days), revisions (number or unlimited), features checklist
  - Standard pre-populated based on Basic (1.5x price)
  - Premium pre-populated based on Standard (2x price)
  - Real-time comparison table preview

**Task 5.1.3: Implement gig image upload**
- Acceptance Criteria:
  - Upload images to local storage or S3-compatible store
  - Image validation: max 5MB, jpg/png/webp
  - Image resizing on upload (thumbnail + full size)
  - Drag to reorder images
  - First image becomes the gig card thumbnail

### Story 5.2: Edit & Manage Gigs

**Task 5.2.1: Build gig management dashboard**
- Acceptance Criteria:
  - Page at `/dashboard/gigs`
  - Table: title, status, orders, rating, actions
  - Actions: edit, pause/activate, archive, view analytics
  - Filter by status

**Task 5.2.2: Build gig editing**
- Acceptance Criteria:
  - Same multi-step form, pre-populated
  - Price changes don't affect existing orders
  - Status transitions: Draft → Submit for Review → Active → Paused → Active → Archived

---

## Epic 6: Gig Discovery (Client Side)

### Story 6.1: Browse & Search

**Task 6.1.1: Build marketplace page**
- Acceptance Criteria:
  - Page at `/gigs`
  - Gig cards in responsive grid: thumbnail, title, seller avatar+name, rating, starting price
  - Category sidebar/top nav
  - Infinite scroll or pagination

**Task 6.1.2: Build search and filters**
- Acceptance Criteria:
  - Text search (title, description, tags)
  - Filters: category, subcategory, price range, delivery time, seller rating, seller level
  - Sort: best selling, newest, price low/high
  - URL params for shareable filters

### Story 6.2: Gig Detail Page

**Task 6.2.1: Build gig detail page**
- Acceptance Criteria:
  - Page at `/gigs/$slug`
  - Image gallery/carousel
  - Description with rich text rendering
  - Package comparison table (Basic/Standard/Premium side by side)
  - "Select Package" → "Continue" button per package
  - Seller info sidebar (avatar, name, rating, response time, "Contact Me" button)
  - FAQ section (accordion)
  - Reviews section
  - Related gigs

---

## Epic 7: Order Flow & Escrow Payments

### Story 7.1: Order Placement

**Task 7.1.1: Build order placement endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/create`
  - Accepts: gigId, packageTier, requirements (client's brief)
  - Validates: gig is active, package exists, freelancer has active Stripe account, client is not the freelancer
  - Creates Order record with status PENDING_PAYMENT
  - Calculates: price, platformFee (15%), freelancerAmount (price - fee)
  - Sets deliveryDeadline based on package deliveryDays
  - Returns: orderId for payment step

### Story 7.2: Escrow Payment (Manual Capture)

**Task 7.2.1: Build payment authorization endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/:orderId/pay`
  - Creates Stripe Payment Intent with:
    - `amount`: order price in cents
    - `currency`: order currency
    - `capture_method: 'manual'` — THIS IS THE ESCROW KEY: funds are authorized (held) but NOT captured (charged) yet
    - `metadata`: { orderId, clientId, freelancerId, gigId }
    - `application_fee_amount`: platform fee in cents
    - `transfer_data: { destination: freelancerStripeAccountId }` — when captured, funds transfer to freelancer
  - Returns: `{ clientSecret }` for Stripe Elements on frontend
  - Code comment explaining: "Manual capture = bank puts a hold on client's funds. Money hasn't moved yet. We capture (actually charge) only when client approves delivery."

**Task 7.2.2: Build payment form on frontend**
- Acceptance Criteria:
  - Payment page at `/dashboard/orders/$orderId/pay`
  - Stripe Elements (card input) using `clientSecret`
  - Shows order summary: gig title, package, price, delivery time
  - "Pay & Start Order" button
  - On payment confirmation: order status → PAID → IN_PROGRESS
  - Payment creates a hold on the card (manual capture)

**Task 7.2.3: Understand manual capture vs automatic**
- Acceptance Criteria:
  - Code comments explaining:
    - **Automatic capture** (default): charge happens immediately. Money moves from buyer to platform.
    - **Manual capture**: charge is authorized (buyer's bank holds funds). Capture must happen within 7 days (Stripe limit for card payments). If not captured, authorization expires and funds are released back.
    - **Why escrow**: Protects both parties. Client's money is guaranteed (authorized), but freelancer only receives it after delivering work. If something goes wrong, we can cancel instead of refunding.

### Story 7.3: Order In Progress

**Task 7.3.1: Build order tracking page**
- Acceptance Criteria:
  - Page at `/dashboard/orders/$orderId`
  - Timeline showing order stages: Paid → In Progress → Delivered → Completed
  - Current stage highlighted
  - Delivery deadline countdown
  - Chat section (embedded or linked)
  - Action buttons based on status and role

### Story 7.4: Delivery Submission

**Task 7.4.1: Build delivery submission endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/:orderId/deliver`
  - Freelancer only
  - Accepts: message, attachments (file URLs)
  - Creates Delivery record (with revision number if this is a redelivery)
  - Updates order status to DELIVERED
  - Sets autoCompleteAt to 3 days from now (auto-accept timer)
  - Notifies client via WebSocket + email
  - Log audit event

**Task 7.4.2: Build delivery submission form**
- Acceptance Criteria:
  - Form on order page (freelancer view)
  - Message textarea (describe what was delivered)
  - File upload area (deliverables)
  - "Deliver Order" button with confirmation dialog

### Story 7.5: Client Review & Approval

**Task 7.5.1: Build delivery approval endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/:orderId/accept`
  - Client only
  - Updates order status to COMPLETED
  - Triggers: payment capture + transfer (Story 7.6)
  - Sets completedAt timestamp
  - Notifies freelancer
  - Log audit event

**Task 7.5.2: Build revision request endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/:orderId/request-revision`
  - Client only
  - Accepts: revisionNote (what needs to change)
  - Checks: revisionCount < package.revisions (or unlimited)
  - Updates order status to REVISION_REQUESTED → IN_PROGRESS
  - Increments revisionCount
  - Clears autoCompleteAt timer
  - Notifies freelancer
  - If no revisions remaining: show message "You've used all revisions. You can accept or open a dispute."

### Story 7.6: Payment Capture & Transfer

**Task 7.6.1: Capture payment on delivery approval**
- Acceptance Criteria:
  - After client accepts delivery:
  - `stripe.paymentIntents.capture(paymentIntentId)` — actually charges the client's card
  - Because we used `transfer_data.destination`, Stripe automatically transfers `freelancerAmount` to the connected account minus the `application_fee_amount`
  - Update Payment record: status AUTHORIZED → CAPTURED, capturedAt timestamp
  - Update Order: status COMPLETED
  - Log audit event: "payment.captured"

**Task 7.6.2: Understand separate charges and transfers (alternative)**
- Acceptance Criteria:
  - Code comment explaining the alternative pattern:
    - Instead of `transfer_data` on PaymentIntent (destination charge), you could:
    1. Create PaymentIntent without transfer_data (charge goes to platform)
    2. Capture the charge
    3. Manually create transfer: `stripe.transfers.create({ amount, destination, source_transaction })`
    - This gives more control (e.g., delayed transfers, partial transfers)
    - We use destination charges here for simplicity

### Story 7.7: Order Cancellation

**Task 7.7.1: Build cancellation endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/:orderId/cancel`
  - Allowed by: client (before delivery) or admin
  - If payment was authorized but not captured: `stripe.paymentIntents.cancel(paymentIntentId)` — releases the hold, client's card is never charged
  - If payment was captured: `stripe.refunds.create({ payment_intent, reverse_transfer: true, refund_application_fee: true })` — refund client and reverse transfer from freelancer
  - Update order status to CANCELLED
  - Log audit event

### Story 7.8: Auto-Complete Timer

**Task 7.8.1: Implement auto-complete logic**
- Acceptance Criteria:
  - After freelancer delivers: `autoCompleteAt` set to 3 days from now
  - Background job (Bun setInterval or cron) checks every hour
  - If current time > autoCompleteAt AND order is DELIVERED: automatically accept delivery
  - Triggers same capture + transfer flow as manual acceptance
  - Client receives email warning: "Your order will auto-complete in 24 hours. Review the delivery now."
  - Email sent at 24 hours and 6 hours before auto-complete

### Story 7.9: Webhook Handling

**Task 7.9.1: Build Stripe webhook handler for order events**
- Acceptance Criteria:
  - Hono route: `POST /api/webhooks/stripe`
  - Signature verification
  - Handle events:
    - `payment_intent.amount_capturable_updated`: payment authorized successfully
    - `payment_intent.succeeded`: payment captured
    - `payment_intent.canceled`: authorization cancelled
    - `payment_intent.payment_failed`: authorization failed
    - `transfer.created`: transfer to connected account succeeded
    - `charge.refunded`: refund processed
    - `charge.dispute.created`: chargeback initiated
  - Idempotent processing
  - All events logged to audit trail

---

## Epic 8: Dispute Resolution System

### Story 8.1: Open Dispute

**Task 8.1.1: Build dispute creation endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/orders/:orderId/dispute`
  - Client only (after delivery, within 7 days)
  - Accepts: reason (enum), description, evidence (file uploads)
  - Creates Dispute record with status OPEN
  - Pauses autoCompleteAt timer
  - Does NOT cancel or refund payment yet
  - Notifies: freelancer + admin
  - Order status → DISPUTED

**Task 8.1.2: Build dispute form UI**
- Acceptance Criteria:
  - Form on order page
  - Reason dropdown: Not as Described, Missing Requirements, Quality Issues, Communication Issues, Other
  - Description textarea (required, min 50 chars)
  - Evidence upload (screenshots, files)
  - "I understand this will be reviewed by an admin" checkbox

### Story 8.2: Dispute Resolution

**Task 8.2.1: Build freelancer response endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/disputes/:disputeId/respond`
  - Freelancer only
  - Accepts: response text, counter-evidence
  - Updates dispute record
  - Notifies admin

**Task 8.2.2: Build admin resolution endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/disputes/:disputeId/resolve`
  - Admin only
  - Accepts: resolution (enum), adminNotes, refundAmount (if partial refund)
  - Resolutions:
    - RESOLVED_REFUND: full refund to client (cancel + refund payment)
    - RESOLVED_PARTIAL_REFUND: partial refund (refund portion, release rest to freelancer)
    - RESOLVED_RELEASED: release full payment to freelancer (dispute dismissed)
  - Executes appropriate Stripe action (refund/capture/transfer)
  - Updates order status to RESOLVED
  - Notifies both parties
  - Log audit event

**Task 8.2.3: Build admin dispute dashboard**
- Acceptance Criteria:
  - Page at `/admin/disputes`
  - List of open disputes: order #, client, freelancer, reason, opened date
  - Detail view: full dispute timeline, both parties' evidence, order details, chat history
  - Resolution action buttons

---

## Epic 9: Real-Time Chat (WebSocket)

### Story 9.1: WebSocket Server

**Task 9.1.1: Setup WebSocket with Hono + Bun**
- Acceptance Criteria:
  - Hono WebSocket route: `GET /api/chat/ws`
  - Bun's native WebSocket support (performant)
  - JWT authentication on WebSocket upgrade (token passed as query param or header)
  - Connection management: track active connections per userId
  - Heartbeat/ping-pong to detect dead connections

**Task 9.1.2: Build message handling**
- Acceptance Criteria:
  - Message types: TEXT, FILE, SYSTEM (automated messages like "Order started")
  - On message received: validate, persist to database, forward to other participant(s)
  - If recipient is offline: message stored, delivered when they connect
  - Message format: `{ type, conversationId, content, attachments, timestamp }`

### Story 9.2: Chat Frontend

**Task 9.2.1: Build chat UI**
- Acceptance Criteria:
  - Chat page at `/dashboard/messages`
  - Left panel: conversation list (sorted by last message)
  - Right panel: active conversation with message bubbles
  - Message input with send button and file attachment
  - Unread message count per conversation
  - "Typing..." indicator

**Task 9.2.2: Build chat within order page**
- Acceptance Criteria:
  - Chat embedded in order detail page
  - Only order participants can access (client + freelancer)
  - System messages for order events (status changes, deliveries)
  - Chat history persisted and loadable

### Story 9.3: Chat Security

**Task 9.3.1: Implement chat access control**
- Acceptance Criteria:
  - Users can only access conversations they participate in
  - WebSocket connection rejected if user not in conversation
  - File attachments scanned for size limits
  - Message content sanitized (no XSS via chat)
  - Rate limiting: max 30 messages per minute per user

---

## Epic 10: AI-Powered Features (Claude API)

### Story 10.1: Claude API Setup

**Task 10.1.1: Configure Anthropic SDK**
- Acceptance Criteria:
  - `@anthropic-ai/sdk` installed
  - Anthropic client singleton in `src/utils/claude.ts`
  - API key in `ANTHROPIC_API_KEY` env var
  - Server-side only usage
  - Model selection: claude-3-haiku for fast tasks, claude-3-sonnet for quality tasks

### Story 10.2: AI Service Description Generator

**Task 10.2.1: Build description generator endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/ai/generate-description`
  - Accepts: title, category, keywords, targetAudience
  - System prompt: "You are a professional copywriter for a freelance marketplace. Generate a compelling gig description..."
  - Returns: generated description (500-1000 words), SEO tags
  - Token tracking: record tokens used per request
  - Rate limited: 10 generations per day per user

**Task 10.2.2: Build description generator UI**
- Acceptance Criteria:
  - Button "Generate with AI" on gig creation form
  - Modal: input basic info (title, category, key skills)
  - "Generate" button with loading spinner
  - Preview generated description
  - "Use this" button inserts into form
  - "Regenerate" button for a new version
  - Shows tokens used / remaining quota

### Story 10.3: AI Smart Tags

**Task 10.3.1: Build tag suggestion endpoint**
- Acceptance Criteria:
  - Hono route: `POST /api/ai/suggest-tags`
  - Accepts: gig title, description
  - Claude generates relevant tags (10-15 suggestions)
  - Returns: `{ tags: string[] }`
  - Uses claude-3-haiku (fast, cheap)

### Story 10.4: AI Proposal Writer

**Task 10.4.1: Build proposal generator**
- Acceptance Criteria:
  - Hono route: `POST /api/ai/generate-proposal`
  - For custom order requests: freelancer gets AI help writing a response
  - Accepts: clientRequest, freelancerSkills, previousWork
  - Returns: professional proposal text
  - Token tracking and rate limiting

### Story 10.5: Token Management

**Task 10.5.1: Build AI usage tracking**
- Acceptance Criteria:
  - Every AI API call tracked: userId, endpoint, model, inputTokens, outputTokens, cost
  - Daily/monthly usage dashboard for users
  - Admin can see total AI costs
  - Hard limit per user per day (prevent abuse)
  - Cost calculation based on Claude pricing (per input/output token)

---

## Epic 11: Reviews & Ratings

### Story 11.1: Mutual Review System

**Task 11.1.1: Build review submission**
- Acceptance Criteria:
  - After order completed: both client and freelancer can review each other
  - Reviews revealed simultaneously (blind review — neither sees the other's until both submit or 14 days pass)
  - Fields: rating (1-5), title, comment
  - Updates averageRating and reviewCount on FreelancerProfile/User

**Task 11.1.2: Build review display**
- Acceptance Criteria:
  - Reviews shown on: gig page, freelancer profile, client profile
  - Star rating distribution chart
  - "As Buyer" and "As Seller" tabs on user profiles

---

## Epic 12: Notification System

### Story 12.1: In-App Notifications

**Task 12.1.1: Build notification system**
- Acceptance Criteria:
  - Notification model: id, userId, type, title, message, link, isRead, createdAt
  - WebSocket push for real-time notifications
  - Bell icon with unread count
  - Notification dropdown with list
  - Mark as read on click
  - "Mark all as read" button

### Story 12.2: Email Notifications

**Task 12.2.1: Build email notification templates**
- Acceptance Criteria:
  - New order (freelancer)
  - Order paid (client + freelancer)
  - Delivery submitted (client)
  - Revision requested (freelancer)
  - Order completed (both)
  - Dispute opened (both + admin)
  - Auto-complete warning (client)
  - Stripe onboarding reminder (freelancer)

---

## Epic 13: Admin Panel

### Story 13.1: Admin Dashboard

**Task 13.1.1: Build admin overview**
- Acceptance Criteria:
  - Stats: total users, active gigs, active orders, revenue (platform fees), dispute rate
  - Charts: orders over time, revenue over time
  - Recent activity feed

### Story 13.2: Management Pages

**Task 13.2.1: Build admin management pages**
- Acceptance Criteria:
  - User management (view, suspend, change role)
  - Gig moderation (approve, reject, flag)
  - Order monitoring (view all orders, search, filter)
  - Financial dashboard (revenue, payouts, refunds)
  - Connected accounts (Express account statuses)
  - Audit log viewer with search and filters

---

## Epic 14: Security & Compliance

### Story 14.1: Security Measures

**Task 14.1.1: Configure security for Hono**
- Acceptance Criteria:
  - CORS middleware (allow only frontend origin)
  - Security headers via Hono middleware (equivalent of Helmet)
  - Rate limiting middleware (in-memory for dev, Redis for production)
  - Input validation with Zod on all endpoints
  - SQL injection prevention (Prisma parameterized queries)
  - XSS prevention (sanitize user content)
  - File upload validation (type, size, content-type verification)

### Story 14.2: Compliance

**Task 14.2.1: Implement compliance requirements**
- Acceptance Criteria:
  - PCI-DSS: Stripe Elements handle card data (SAQ-A)
  - GDPR: consent, data export, account deletion
  - Audit logging for all financial and dispute events
  - Data encryption for sensitive fields

---

## Epic 15: Testing

### Story 15.1: Tests

**Task 15.1.1: Unit tests**
- Acceptance Criteria:
  - Test order state machine transitions
  - Test escrow payment logic (authorize, capture, cancel)
  - Test platform fee calculation
  - Test auto-complete timer logic
  - Test AI token tracking

**Task 15.1.2: Integration tests**
- Acceptance Criteria:
  - Test Connect Express onboarding flow (mock Stripe)
  - Test full order flow (create → pay → deliver → accept → capture)
  - Test webhook processing
  - Test chat message persistence

**Task 15.1.3: E2E tests**
- Acceptance Criteria:
  - Full flow: Freelancer onboards → Creates gig → Client orders → Payment (test mode) → Delivery → Acceptance → Payment captured

---

## Epic 16: UI/UX

### Story 16.1: Design & Layout

**Task 16.1.1: Build responsive UI**
- Acceptance Criteria:
  - Tailwind + Ark UI component system
  - Marketplace layout (header, search bar, category nav, grid)
  - Dashboard layout (sidebar, content area)
  - Order tracking timeline component
  - Chat interface (WhatsApp-like)
  - Dark mode with toggle
  - Mobile responsive throughout
  - Loading states and skeletons

---

## Production Checklist

### Stripe Connect Express
- [ ] Express accounts created with correct capabilities
- [ ] Account Links generated for onboarding
- [ ] Return URL and Refresh URL handled correctly
- [ ] Account status monitored via webhooks
- [ ] Gigs paused when charges_enabled becomes false
- [ ] Express Dashboard login link provided to freelancers

### Escrow Payments
- [ ] PaymentIntent created with capture_method: 'manual'
- [ ] Authorization hold expires after 7 days (handled — capture or cancel before then)
- [ ] Capture triggered only on client approval
- [ ] Cancel releases hold without charging
- [ ] Transfer to connected account happens via transfer_data.destination
- [ ] Platform fee deducted via application_fee_amount
- [ ] Refunds reverse transfers and application fees

### Order Flow
- [ ] State machine transitions validated (no invalid state jumps)
- [ ] Auto-complete timer works correctly
- [ ] Revision count enforced per package
- [ ] Dispute pauses auto-complete
- [ ] Cancelled orders release payment hold
- [ ] All state changes logged to audit trail

### AI
- [ ] Claude API key server-side only
- [ ] Token usage tracked per request
- [ ] Rate limiting per user per day
- [ ] Error handling for all API failure modes
- [ ] Cost monitoring for admin

### Real-time
- [ ] WebSocket authenticated via JWT
- [ ] Dead connections cleaned up (heartbeat)
- [ ] Messages persisted before forwarding
- [ ] Chat access control enforced
- [ ] Message content sanitized
