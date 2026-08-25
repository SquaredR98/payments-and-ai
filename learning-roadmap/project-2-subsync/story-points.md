# Project 2: SubSync — SaaS Subscription Management Platform

## Project Overview

**What it is:** A full SaaS boilerplate where users sign up for tiered plans (Free/Pro/Enterprise), manage their billing, upgrade/downgrade plans, and handle failed payments. Supports both Stripe and Razorpay subscriptions with a unified gateway abstraction. This pattern is reusable for every SaaS you will ever build.

**Tech Stack:**
- **Backend/CMS:** Strapi (headless CMS with plugin ecosystem, REST + GraphQL, admin panel)
- **Frontend:** React (Vite) + TypeScript
- **Database:** PostgreSQL (via Strapi's database connector)
- **Styling:** Tailwind CSS + Radix UI primitives
- **Payments:** Stripe Subscriptions + Razorpay Subscriptions
- **Email:** Resend
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios with interceptors
- **Deployment:** Local development only

**What You Will Learn:**
1. Strapi fundamentals — content types, custom controllers, custom routes, middleware, policies, lifecycle hooks, admin panel customization
2. React with Vite — project setup without Next.js, manual routing, state management
3. JWT authentication — manual implementation (register, login, refresh tokens, route protection)
4. Stripe Subscriptions — full lifecycle (create, upgrade, downgrade, cancel, reactivate, dunning)
5. Razorpay Subscriptions — equivalent flows for Indian payment market
6. Payment gateway abstraction — write once, support multiple gateways
7. Webhook architecture for subscription events
8. Feature gating — restrict features based on subscription tier
9. Usage metering — track and limit API calls per plan
10. Dunning management — handle failed payments gracefully
11. Admin panel — monitor subscribers, revenue, manage plans

---

## Feature List Summary

1. Strapi project setup with custom content types
2. React Vite frontend with Tailwind + Radix UI
3. JWT authentication (register, login, refresh, logout)
4. Email verification and password reset
5. User profile management
6. Plan configuration (Free/Pro/Enterprise with features matrix)
7. Pricing page with annual/monthly toggle
8. Stripe Customer creation on registration
9. Stripe Subscription creation via Checkout
10. Stripe subscription lifecycle (upgrade, downgrade, cancel, reactivate)
11. Stripe Customer Portal integration
12. Stripe webhook handling (invoice.paid, payment_failed, subscription.updated, subscription.deleted)
13. Razorpay Customer creation
14. Razorpay Subscription creation
15. Razorpay payment verification (signature validation)
16. Razorpay webhook handling
17. Payment gateway abstraction layer
18. Dunning management (grace period, retry, downgrade)
19. Feature gating (middleware + frontend components)
20. API usage metering and limits
21. Usage dashboard and alerts
22. Admin panel (subscribers, revenue, plans, audit logs)
23. Email notifications (welcome, subscription, payment, dunning)
24. Security (CORS, Helmet, rate limiting, input validation, CSRF)
25. GDPR compliance (consent, export, deletion)
26. PCI-DSS awareness
27. Structured logging and error handling
28. Testing (unit, integration, e2e)
29. Dark mode and responsive design

---

## Epic 1: Project Setup & Architecture

### Story 1.1: Initialize Strapi Backend

**Task 1.1.1: Create Strapi project**
- Acceptance Criteria:
  - Strapi project initialized with `npx create-strapi-app`
  - TypeScript mode enabled
  - PostgreSQL configured as database
  - Project runs on `localhost:1337`
  - Strapi admin panel accessible at `/admin`

**Task 1.1.2: Configure PostgreSQL connection**
- Acceptance Criteria:
  - Local PostgreSQL database created (`subsync_dev`)
  - Connection configured in `config/database.ts`
  - Connection string components in `.env` (host, port, name, user, password)
  - Database migrations run on first start

**Task 1.1.3: Configure Strapi plugins**
- Acceptance Criteria:
  - Users & Permissions plugin configured
  - Email plugin configured (Resend provider)
  - Upload plugin configured (local provider for dev)
  - GraphQL plugin installed (optional, for future use)

**Task 1.1.4: Configure environment variables**
- Acceptance Criteria:
  - `.env` with: DATABASE_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, RESEND_API_KEY, JWT_SECRET, APP_URL, FRONTEND_URL
  - `.env.example` with placeholder values
  - `.gitignore` includes `.env`
  - Environment validation on startup

### Story 1.2: Initialize React Frontend (Vite)

**Task 1.2.1: Create React Vite project**
- Acceptance Criteria:
  - Project created with `npm create vite@latest` (React + TypeScript template)
  - Project runs on `localhost:5173`
  - Proxy configured to Strapi backend (vite.config.ts proxy setting)
  - Path aliases configured (`@/` → `src/`)

**Task 1.2.2: Configure Tailwind CSS + Radix UI**
- Acceptance Criteria:
  - Tailwind CSS installed with custom theme
  - Radix UI primitives installed (Dialog, Dropdown, Tabs, Toast, Switch, Select)
  - CSS variables for theming (light/dark mode)
  - Base components built on Radix primitives with Tailwind styling

**Task 1.2.3: Configure React Router v6**
- Acceptance Criteria:
  - React Router v6 installed
  - Route structure defined:
    - Public: `/`, `/login`, `/register`, `/pricing`, `/forgot-password`, `/reset-password`
    - Protected: `/dashboard`, `/dashboard/billing`, `/dashboard/usage`, `/dashboard/settings`
    - Admin: `/admin/*`
  - Layout routes for shared navigation
  - 404 catch-all route

**Task 1.2.4: Configure Zustand state management**
- Acceptance Criteria:
  - Zustand installed
  - Auth store created (user, tokens, isAuthenticated, actions)
  - Subscription store created (currentPlan, status, usage)
  - UI store created (theme, sidebar state, toast queue)
  - Store persistence configured for auth tokens (localStorage)

**Task 1.2.5: Configure Axios with interceptors**
- Acceptance Criteria:
  - Axios instance created with base URL pointing to Strapi
  - Request interceptor: attach JWT token from auth store
  - Response interceptor: handle 401 (trigger refresh token flow)
  - Response interceptor: handle 403 (redirect to upgrade page if feature-gated)
  - Error formatting utility

### Story 1.3: Project Structure & Conventions

**Task 1.3.1: Define folder structure**
- Acceptance Criteria:
  - Backend (Strapi): `src/api/` (content types), `src/services/` (business logic), `src/middlewares/`, `src/utils/`
  - Frontend (React): `src/components/`, `src/pages/`, `src/hooks/`, `src/stores/`, `src/services/` (API calls), `src/lib/` (utilities), `src/types/`
  - Shared types package or directory for TypeScript interfaces used by both

---

## Epic 2: Authentication System (JWT-based)

### Story 2.1: User Registration

**Task 2.1.1: Create custom User content type in Strapi**
- Acceptance Criteria:
  - Extends Strapi's built-in User with additional fields:
    - `firstName`, `lastName`, `company`, `phone`
    - `stripeCustomerId` (string, nullable)
    - `razorpayCustomerId` (string, nullable)
    - `currentPlan` (enum: free, pro, enterprise — default: free)
    - `subscriptionStatus` (enum: active, past_due, cancelled, trialing, none — default: none)
    - `subscriptionId` (string, nullable)
    - `subscriptionGateway` (enum: stripe, razorpay, null)
    - `usageCount` (integer, default: 0, tracks API calls this billing period)
    - `usageResetDate` (datetime)
  - Fields properly indexed

**Task 2.1.2: Build registration API (custom controller)**
- Acceptance Criteria:
  - Custom Strapi controller: `POST /api/auth/register`
  - Accepts: email, password, firstName, lastName, company (optional)
  - Validates with Zod: email format, password strength (8+ chars, uppercase, lowercase, number), names required
  - Checks email uniqueness
  - Creates user with hashed password
  - Creates Stripe Customer (store stripeCustomerId)
  - Creates Razorpay Customer (store razorpayCustomerId)
  - Sends verification email
  - Returns JWT access token + refresh token
  - Rate limited: 3 registrations per hour per IP

**Task 2.1.3: Build registration form (React)**
- Acceptance Criteria:
  - Page at `/register`
  - Fields: email, password, confirm password, first name, last name, company
  - Real-time validation feedback (Zod + React Hook Form)
  - Password strength indicator
  - "Already have an account? Login" link
  - Loading state on submit
  - Error display for server errors (email already exists, etc.)
  - On success: store tokens, redirect to dashboard

### Story 2.2: User Login & JWT Token Generation

**Task 2.2.1: Build login API (custom controller)**
- Acceptance Criteria:
  - Custom controller: `POST /api/auth/login`
  - Accepts: email, password
  - Validates credentials
  - Returns: access token (short-lived, 15 min), refresh token (long-lived, 7 days)
  - Access token contains: userId, email, role, currentPlan
  - Refresh token stored in database (for revocation)
  - Logs login event to audit log
  - Rate limited: 5 attempts per 15 min per IP
  - Generic error message: "Invalid email or password" (don't reveal which is wrong)

**Task 2.2.2: Build login form (React)**
- Acceptance Criteria:
  - Page at `/login`
  - Fields: email, password
  - "Remember me" checkbox (extends token expiry)
  - "Forgot password?" link
  - Loading state on submit
  - Error display
  - On success: store tokens in Zustand + localStorage, redirect to dashboard

### Story 2.3: Refresh Token Rotation

**Task 2.3.1: Build refresh token endpoint**
- Acceptance Criteria:
  - Custom controller: `POST /api/auth/refresh`
  - Accepts: refresh token
  - Validates refresh token exists in DB and is not expired
  - Issues new access token + new refresh token (rotation)
  - Invalidates old refresh token (one-time use)
  - If old refresh token was already used (replay attack), invalidate ALL user's refresh tokens
  - Returns new token pair

**Task 2.3.2: Implement automatic token refresh on frontend**
- Acceptance Criteria:
  - Axios interceptor detects 401 response
  - Queues the failed request
  - Calls refresh endpoint
  - On success: retries queued requests with new token
  - On failure: clears auth state, redirects to login
  - Prevents multiple simultaneous refresh requests (mutex pattern)

### Story 2.4: Password Reset Flow

**Task 2.4.1: Build forgot password endpoint**
- Acceptance Criteria:
  - `POST /api/auth/forgot-password`
  - Accepts: email
  - Always returns 200 (don't reveal if email exists)
  - If email exists: generates reset token (crypto random, 64 chars), stores hash in DB, sends email
  - Token expires in 1 hour
  - Rate limited: 3 requests per hour per email

**Task 2.4.2: Build reset password endpoint**
- Acceptance Criteria:
  - `POST /api/auth/reset-password`
  - Accepts: token, newPassword
  - Validates token hash matches and not expired
  - Updates password
  - Invalidates all existing refresh tokens (force re-login)
  - Deletes used reset token
  - Sends confirmation email

**Task 2.4.3: Build forgot/reset password UI**
- Acceptance Criteria:
  - Forgot password page at `/forgot-password`: email input, submit button
  - Success message: "If an account exists, we've sent a reset link"
  - Reset password page at `/reset-password?token=xxx`: new password, confirm password
  - Password strength validation
  - Success: redirect to login with success message

### Story 2.5: Email Verification

**Task 2.5.1: Build email verification flow**
- Acceptance Criteria:
  - On registration: send email with verification link containing token
  - `GET /api/auth/verify-email?token=xxx` endpoint
  - Marks user as email-verified
  - Unverified users see banner: "Please verify your email" with resend button
  - `POST /api/auth/resend-verification` endpoint (rate limited: 1 per 5 min)
  - Some features restricted until email verified (e.g., can't subscribe to paid plan)

### Story 2.6: Route Protection Middleware (Backend)

**Task 2.6.1: Create JWT authentication middleware for Strapi**
- Acceptance Criteria:
  - Custom Strapi middleware validates JWT on protected routes
  - Extracts user from token and attaches to `ctx.state.user`
  - Returns 401 for missing/invalid/expired tokens
  - Different from Strapi's built-in auth (we use custom JWT, not Strapi's default)

**Task 2.6.2: Create role-based authorization middleware**
- Acceptance Criteria:
  - Middleware checks user role against required roles for the route
  - Roles: user, admin, superadmin
  - Returns 403 if user's role insufficient
  - Configurable per route

### Story 2.7: Auth Context & Protected Routes (Frontend)

**Task 2.7.1: Create auth provider and hook**
- Acceptance Criteria:
  - `AuthProvider` component wraps the app
  - `useAuth()` hook returns: user, isAuthenticated, isLoading, login, logout, register
  - On mount: checks stored tokens, validates with backend, fetches user profile
  - Loading state while checking auth (prevents flash)

**Task 2.7.2: Create protected route component**
- Acceptance Criteria:
  - `ProtectedRoute` component wraps React Router routes
  - Redirects to `/login` if not authenticated (with return URL)
  - Shows loading spinner while checking auth
  - `AdminRoute` variant that also checks for admin role

### Story 2.8: Logout & Session Invalidation

**Task 2.8.1: Build logout flow**
- Acceptance Criteria:
  - `POST /api/auth/logout` endpoint
  - Invalidates current refresh token in database
  - Frontend: clears Zustand store, clears localStorage, redirects to login
  - "Logout from all devices" option: invalidates ALL refresh tokens for user

---

## Epic 3: Database Schema Design

### Story 3.1: Plan Content Type

**Task 3.1.1: Create Plan content type in Strapi**
- Acceptance Criteria:
  - Content type: `plan`
  - Fields:
    - `name` (string: "Free", "Pro", "Enterprise")
    - `slug` (uid, generated from name)
    - `description` (text)
    - `monthlyPrice` (decimal, in base currency units)
    - `annualPrice` (decimal, annual total — not monthly equivalent)
    - `currency` (enum: USD, EUR, INR)
    - `stripePriceIdMonthly` (string — Stripe Price ID for monthly billing)
    - `stripePriceIdAnnual` (string — Stripe Price ID for annual billing)
    - `razorpayPlanIdMonthly` (string — Razorpay Plan ID)
    - `razorpayPlanIdAnnual` (string — Razorpay Plan ID)
    - `features` (JSON array: [{name: string, included: boolean, limit: number|null}])
    - `apiCallLimit` (integer — max API calls per billing period, -1 for unlimited)
    - `storageLimit` (integer — MB, -1 for unlimited)
    - `teamMemberLimit` (integer)
    - `isActive` (boolean)
    - `sortOrder` (integer — display order on pricing page)
  - Seed data for Free, Pro, Enterprise plans

### Story 3.2: Subscription Content Type

**Task 3.2.1: Create Subscription content type**
- Acceptance Criteria:
  - Content type: `subscription`
  - Fields:
    - `user` (relation to User, one-to-one)
    - `plan` (relation to Plan)
    - `status` (enum: trialing, active, past_due, cancelled, unpaid, incomplete, paused)
    - `gateway` (enum: stripe, razorpay)
    - `gatewaySubscriptionId` (string — Stripe sub ID or Razorpay sub ID)
    - `gatewayCustomerId` (string)
    - `currentPeriodStart` (datetime)
    - `currentPeriodEnd` (datetime)
    - `cancelAtPeriodEnd` (boolean, default false)
    - `cancelledAt` (datetime, nullable)
    - `trialEnd` (datetime, nullable)
    - `billingInterval` (enum: monthly, annual)
    - `lastPaymentDate` (datetime)
    - `lastPaymentAmount` (decimal)
    - `failedPaymentCount` (integer, default 0)
    - `metadata` (JSON — raw gateway data for debugging)

### Story 3.3: Payment History Content Type

**Task 3.3.1: Create PaymentHistory content type**
- Acceptance Criteria:
  - Content type: `payment-history`
  - Fields:
    - `user` (relation to User)
    - `subscription` (relation to Subscription)
    - `gateway` (enum: stripe, razorpay)
    - `gatewayPaymentId` (string — Stripe invoice ID or Razorpay payment ID)
    - `amount` (decimal)
    - `currency` (string)
    - `status` (enum: succeeded, failed, refunded, pending)
    - `description` (string — "Pro plan - Monthly" etc.)
    - `invoiceUrl` (string — link to Stripe/Razorpay hosted invoice)
    - `invoicePdf` (string — PDF download URL)
    - `failureReason` (string, nullable — e.g., "card_declined")
    - `paidAt` (datetime)
    - `idempotencyKey` (string, unique)

### Story 3.4: Audit Log Content Type

**Task 3.4.1: Create AuditLog content type**
- Acceptance Criteria:
  - Content type: `audit-log`
  - Fields: action, entity, entityId, userId, ipAddress, userAgent, previousData (JSON), newData (JSON), timestamp
  - Access: admin read-only (no create/update/delete from API)
  - Populated via service functions in lifecycle hooks

### Story 3.5: Feature Flag Content Type

**Task 3.5.1: Create FeatureFlag content type**
- Acceptance Criteria:
  - Content type: `feature-flag`
  - Fields:
    - `name` (string, unique — e.g., "api_access", "advanced_analytics", "priority_support")
    - `description` (text)
    - `requiredPlan` (enum: free, pro, enterprise — minimum plan to access this feature)
    - `isActive` (boolean — global kill switch)
  - Seed data with initial feature flags
  - Cached in memory on backend startup (refreshed every 5 minutes)

---

## Epic 4: Pricing Page & Plan Management

### Story 4.1: Plan Configuration & Seeding

**Task 4.1.1: Create Stripe Products and Prices**
- Acceptance Criteria:
  - Stripe Products created for each plan (Free, Pro, Enterprise)
  - Stripe Prices created: monthly and annual for Pro and Enterprise
  - Price IDs stored in Plan content type
  - Free plan has no Stripe Price (it's free)

**Task 4.1.2: Create Razorpay Plans**
- Acceptance Criteria:
  - Razorpay Plans created via API for Pro and Enterprise
  - Monthly and annual variants
  - Plan IDs stored in Plan content type

**Task 4.1.3: Seed plan data in Strapi**
- Acceptance Criteria:
  - Bootstrap script or seed file creates all plans on first run
  - Plans marked as active
  - Feature lists populated for each plan
  - Script is idempotent (safe to run multiple times)

### Story 4.2: Pricing Page UI

**Task 4.2.1: Build pricing page**
- Acceptance Criteria:
  - Page at `/pricing`
  - Three plan cards side by side (Free, Pro, Enterprise)
  - Pro card highlighted as "Most Popular"
  - Each card shows: plan name, price, billing period, feature list, CTA button
  - Monthly/Annual toggle at the top
  - Annual price shows savings (e.g., "Save 20%")
  - CTA buttons: "Get Started Free", "Subscribe to Pro", "Subscribe to Enterprise"

**Task 4.2.2: Build feature comparison matrix**
- Acceptance Criteria:
  - Below pricing cards: detailed feature comparison table
  - Rows: each feature
  - Columns: Free, Pro, Enterprise
  - Checkmarks, X marks, and limits displayed clearly
  - Responsive: horizontal scroll on mobile or accordion view

### Story 4.3: Currency & Billing Interval Selection

**Task 4.3.1: Implement currency selection**
- Acceptance Criteria:
  - Currency selector on pricing page (USD, EUR, INR)
  - Prices update dynamically based on selected currency
  - INR selection suggests Razorpay, USD/EUR suggests Stripe
  - Currency preference saved in user profile

**Task 4.3.2: Implement billing interval toggle**
- Acceptance Criteria:
  - Toggle between Monthly and Annual
  - Annual shows per-month equivalent + total annual price
  - Annual shows discount badge
  - Selected interval passed to checkout flow

---

## Epic 5: Stripe Subscription Integration

### Story 5.1: Stripe Setup

**Task 5.1.1: Configure Stripe SDK**
- Acceptance Criteria:
  - `stripe` npm package installed in Strapi backend
  - Stripe instance singleton in `src/utils/stripe.ts`
  - API version pinned
  - Test mode keys configured

### Story 5.2: Create Stripe Customer on Registration

**Task 5.2.1: Create Stripe customer during registration**
- Acceptance Criteria:
  - In registration controller, after user creation, call `stripe.customers.create()`
  - Pass: email, name, metadata: { userId }
  - Store returned `customer.id` as `stripeCustomerId` on user
  - If Stripe call fails: still create user, log error, retry later (don't block registration)

### Story 5.3: Create Subscription (Checkout Session)

**Task 5.3.1: Build create subscription endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/create-checkout`
  - Accepts: planSlug, billingInterval (monthly/annual)
  - Validates: user is authenticated, plan exists, user not already subscribed to this plan
  - Looks up Stripe Price ID from Plan content type
  - Creates Stripe Checkout Session with:
    - `mode: 'subscription'`
    - `customer`: user's stripeCustomerId
    - `line_items`: [{ price: stripePriceId, quantity: 1 }]
    - `success_url`: `{FRONTEND_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`
    - `cancel_url`: `{FRONTEND_URL}/pricing`
    - `metadata`: { userId, planSlug, billingInterval }
    - `subscription_data.metadata`: same metadata
    - `allow_promotion_codes: true` (enables coupon codes)
    - `trial_period_days`: 14 (for first-time subscribers, optional)
  - Returns: `{ sessionUrl }`

**Task 5.3.2: Build checkout redirect on frontend**
- Acceptance Criteria:
  - Pricing page CTA button calls create-checkout API
  - Redirects user to Stripe Checkout URL
  - Loading state on button during API call
  - Error handling if session creation fails

### Story 5.4: Stripe Webhook Handler Setup

**Task 5.4.1: Create Stripe webhook endpoint in Strapi**
- Acceptance Criteria:
  - Custom route: `POST /api/webhooks/stripe`
  - Raw body parsing middleware (Strapi normally parses JSON — need raw body for signature verification)
  - Signature verification using `stripe.webhooks.constructEvent()`
  - Webhook secret from environment variable
  - Event routing to handler functions
  - Returns 200 immediately for all events
  - Returns 400 for invalid signature

**Task 5.4.2: Configure webhook events**
- Acceptance Criteria:
  - Events subscribed:
    - `checkout.session.completed`
    - `invoice.paid`
    - `invoice.payment_failed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `customer.subscription.trial_will_end`
  - Stripe CLI configured for local testing: `stripe listen --forward-to localhost:1337/api/webhooks/stripe`

### Story 5.5: Handle invoice.paid Event

**Task 5.5.1: Process successful subscription payment**
- Acceptance Criteria:
  - Extract subscription ID from invoice
  - Find user by stripeCustomerId
  - Update subscription status to "active"
  - Reset `failedPaymentCount` to 0
  - Update `currentPeriodStart` and `currentPeriodEnd`
  - Create PaymentHistory record
  - Update user's `currentPlan` to match subscription plan
  - Log audit event
  - Send payment receipt email

### Story 5.6: Handle invoice.payment_failed Event

**Task 5.6.1: Process failed subscription payment**
- Acceptance Criteria:
  - Find user by stripeCustomerId
  - Increment `failedPaymentCount`
  - Update subscription status to "past_due"
  - Create PaymentHistory record with status "failed" and failureReason
  - Log audit event
  - Send failed payment email to user with link to update payment method
  - If failedPaymentCount >= 3: trigger dunning escalation (Epic 8)

### Story 5.7: Handle customer.subscription.updated Event

**Task 5.7.1: Process subscription updates**
- Acceptance Criteria:
  - Handles: plan changes (upgrade/downgrade), cancellation scheduling, status changes
  - Update local subscription record to match Stripe's state
  - If plan changed: update user's `currentPlan`
  - If `cancel_at_period_end` changed: update `cancelAtPeriodEnd` flag
  - Log audit event with previous and new data

### Story 5.8: Handle customer.subscription.deleted Event

**Task 5.8.1: Process subscription cancellation**
- Acceptance Criteria:
  - Update subscription status to "cancelled"
  - Set user's `currentPlan` to "free"
  - Clear subscriptionId and related fields
  - Log audit event
  - Send cancellation confirmation email
  - Feature access reverted to free tier immediately

### Story 5.9: Upgrade Subscription

**Task 5.9.1: Build upgrade subscription endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/upgrade`
  - Accepts: newPlanSlug
  - Validates: user has active subscription, new plan is higher tier
  - Uses `stripe.subscriptions.update()` with new Price ID
  - Proration behavior: `proration_behavior: 'create_prorations'` (charge difference immediately)
  - Returns updated subscription details
  - Log audit event

**Task 5.9.2: Build upgrade UI**
- Acceptance Criteria:
  - Billing page shows current plan with "Upgrade" buttons for higher tiers
  - Proration preview shown before confirming (call `stripe.invoices.retrieveUpcoming()`)
  - Confirmation dialog: "You'll be charged $X now for the remainder of this billing period"
  - Success toast after upgrade

### Story 5.10: Downgrade Subscription

**Task 5.10.1: Build downgrade subscription endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/downgrade`
  - Accepts: newPlanSlug
  - Validates: new plan is lower tier
  - Downgrade scheduled at end of current billing period (not immediate)
  - Uses `stripe.subscriptions.update()` with `proration_behavior: 'none'` and schedule via `items` update at period end
  - Returns: current plan stays active until period end, then switches
  - Log audit event

**Task 5.10.2: Build downgrade UI**
- Acceptance Criteria:
  - Shows "Downgrade" button for lower tiers
  - Warning: "Your current features will remain active until {periodEndDate}. After that, you'll be on the {newPlan} plan."
  - Confirmation dialog
  - Shows scheduled downgrade on billing page if pending

### Story 5.11: Cancel Subscription

**Task 5.11.1: Build cancel subscription endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/cancel`
  - Accepts: `immediate` (boolean) — cancel now vs. at period end
  - Default: cancel at period end (`cancel_at_period_end: true`)
  - Immediate: calls `stripe.subscriptions.cancel()` right away
  - At period end: calls `stripe.subscriptions.update({ cancel_at_period_end: true })`
  - Log audit event
  - Send cancellation email

**Task 5.11.2: Build cancellation flow UI**
- Acceptance Criteria:
  - "Cancel Subscription" button on billing page
  - Cancellation survey (optional: why are you cancelling? dropdown)
  - Two options presented: "Cancel at end of billing period" (recommended) or "Cancel immediately"
  - Confirmation dialog with consequences explained
  - After cancellation: shows "Your subscription will end on {date}" banner

### Story 5.12: Reactivate Cancelled Subscription

**Task 5.12.1: Build reactivation endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/reactivate`
  - Only works if subscription is cancelled but period hasn't ended yet
  - Uses `stripe.subscriptions.update({ cancel_at_period_end: false })`
  - Updates local subscription record
  - Log audit event
  - Send reactivation confirmation email

### Story 5.13: Stripe Customer Portal

**Task 5.13.1: Build customer portal session endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/portal-session`
  - Creates Stripe Billing Portal session
  - Returns portal URL
  - Portal allows: update payment method, view invoices, cancel subscription
  - Return URL set to billing page

**Task 5.13.2: Add portal link to UI**
- Acceptance Criteria:
  - "Manage Billing" button on billing page opens Stripe Customer Portal
  - Explains: "Manage your payment methods and view invoices on our secure payment partner's site"

### Story 5.14: Payment Method Management

**Task 5.14.1: Build payment method endpoints**
- Acceptance Criteria:
  - `GET /api/subscriptions/payment-methods`: list user's saved payment methods
  - `POST /api/subscriptions/setup-intent`: create SetupIntent for adding new payment method
  - `PUT /api/subscriptions/default-payment-method`: set default payment method
  - `DELETE /api/subscriptions/payment-method/:id`: remove a payment method
  - Uses Stripe's PaymentMethod API

**Task 5.14.2: Build payment method UI**
- Acceptance Criteria:
  - Card listing showing: brand icon (Visa/Mastercard/etc.), last 4 digits, expiry, default badge
  - "Add payment method" button opens Stripe Elements form (SetupIntent flow)
  - "Set as default" action
  - "Remove" action with confirmation

### Story 5.15: Invoice History

**Task 5.15.1: Build invoice history endpoint**
- Acceptance Criteria:
  - `GET /api/subscriptions/invoices`: returns paginated invoice history from Stripe
  - Uses `stripe.invoices.list({ customer: stripeCustomerId })`
  - Returns: date, amount, status, hosted invoice URL, PDF URL

**Task 5.15.2: Build invoice history UI**
- Acceptance Criteria:
  - Table on billing page: Date, Amount, Status (badge), Actions (View, Download PDF)
  - "View" opens Stripe hosted invoice in new tab
  - "Download" downloads PDF
  - Pagination

---

## Epic 6: Razorpay Subscription Integration

### Story 6.1: Razorpay Setup

**Task 6.1.1: Configure Razorpay SDK**
- Acceptance Criteria:
  - `razorpay` npm package installed
  - Razorpay instance singleton in `src/utils/razorpay.ts`
  - Key ID and Secret from environment variables
  - Test mode configured

### Story 6.2: Create Razorpay Customer

**Task 6.2.1: Create Razorpay customer during registration**
- Acceptance Criteria:
  - Call `razorpay.customers.create()` with email, name, contact
  - Store `customer_id` as `razorpayCustomerId` on user
  - Fails gracefully (don't block registration)

### Story 6.3: Create Razorpay Subscription

**Task 6.3.1: Build Razorpay subscription creation endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/razorpay/create`
  - Accepts: planSlug, billingInterval
  - Creates Razorpay Subscription with:
    - `plan_id`: from Plan content type
    - `customer_id`: user's razorpayCustomerId
    - `total_count`: 12 for monthly, 1 for annual (billing cycles)
    - `notes`: { userId, planSlug }
  - Returns: `{ subscriptionId, razorpayKey }` — needed for frontend checkout

### Story 6.4: Razorpay Checkout Modal Integration

**Task 6.4.1: Build Razorpay checkout on frontend**
- Acceptance Criteria:
  - Load Razorpay checkout script dynamically
  - Open Razorpay checkout modal with subscription ID
  - Configure: key, subscription_id, name, description, handler (success callback)
  - On success: receive `razorpay_payment_id`, `razorpay_subscription_id`, `razorpay_signature`
  - Send these to backend for verification

### Story 6.5: Razorpay Payment Verification

**Task 6.5.1: Build payment verification endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/subscriptions/razorpay/verify`
  - Accepts: razorpay_payment_id, razorpay_subscription_id, razorpay_signature
  - Verify signature: `hmac_sha256(razorpay_payment_id + "|" + razorpay_subscription_id, key_secret)`
  - Compare generated signature with received signature
  - If valid: create local subscription record, update user plan
  - If invalid: return 400 (payment tampering detected), log security event

### Story 6.6: Razorpay Webhook Handler

**Task 6.6.1: Create Razorpay webhook endpoint**
- Acceptance Criteria:
  - Custom route: `POST /api/webhooks/razorpay`
  - Verify webhook signature using Razorpay webhook secret
  - Handle events:
    - `subscription.charged`: payment successful, update subscription
    - `subscription.pending`: payment pending
    - `subscription.halted`: multiple payment failures
    - `subscription.cancelled`: subscription cancelled
    - `payment.failed`: payment attempt failed
  - Idempotent processing
  - Return 200 for all events

### Story 6.7: Razorpay Subscription Management

**Task 6.7.1: Build Razorpay cancel endpoint**
- Acceptance Criteria:
  - Uses `razorpay.subscriptions.cancel()` with `cancel_at_cycle_end: true`
  - Updates local subscription record
  - Same UI flow as Stripe cancellation

**Task 6.7.2: Build Razorpay upgrade/downgrade**
- Acceptance Criteria:
  - Razorpay doesn't support in-place plan changes
  - Pattern: cancel current subscription + create new one
  - Handle proration manually (calculate remaining days, apply as credit)
  - Document this limitation vs. Stripe's approach

---

## Epic 7: Payment Gateway Abstraction Layer

### Story 7.1: Design Gateway Abstraction

**Task 7.1.1: Create PaymentGateway interface**
- Acceptance Criteria:
  - TypeScript interface: `IPaymentGateway`
  - Methods:
    - `createCustomer(data): Promise<{ customerId: string }>`
    - `createSubscription(data): Promise<{ subscriptionId: string, checkoutUrl?: string }>`
    - `cancelSubscription(subscriptionId, immediate?): Promise<void>`
    - `updateSubscription(subscriptionId, newPlanId): Promise<void>`
    - `getSubscriptionStatus(subscriptionId): Promise<SubscriptionStatus>`
    - `getInvoices(customerId): Promise<Invoice[]>`
    - `verifyWebhookSignature(payload, signature): boolean`
  - Implemented by: `StripeGateway`, `RazorpayGateway`

**Task 7.1.2: Implement StripeGateway class**
- Acceptance Criteria:
  - Implements all `IPaymentGateway` methods using Stripe SDK
  - Handles Stripe-specific error types
  - Maps Stripe responses to unified interface types

**Task 7.1.3: Implement RazorpayGateway class**
- Acceptance Criteria:
  - Implements all `IPaymentGateway` methods using Razorpay SDK
  - Handles Razorpay-specific limitations (no in-place plan change)
  - Maps Razorpay responses to unified interface types

**Task 7.1.4: Create GatewayFactory**
- Acceptance Criteria:
  - Factory function: `getGateway(type: 'stripe' | 'razorpay'): IPaymentGateway`
  - Returns appropriate gateway instance
  - Singleton pattern (reuse instances)
  - Used throughout the codebase instead of direct Stripe/Razorpay calls

### Story 7.2: Unified Webhook Processing

**Task 7.2.1: Create webhook event normalizer**
- Acceptance Criteria:
  - Normalized event interface: `{ type: string, gateway: string, data: object, rawEvent: object }`
  - Stripe events mapped to normalized types (e.g., `invoice.paid` → `subscription.payment_succeeded`)
  - Razorpay events mapped to same normalized types
  - Single event handler processes normalized events regardless of gateway source

---

## Epic 8: Dunning & Failed Payment Recovery

### Story 8.1: Grace Period Configuration

**Task 8.1.1: Implement grace period logic**
- Acceptance Criteria:
  - After first payment failure: subscription enters "past_due" status
  - Grace period: 7 days (configurable)
  - During grace period: user retains full access but sees warning banner
  - After grace period expires: features restricted to free tier
  - Grace period tracked by comparing first failure date to current date

### Story 8.2: Failed Payment Email Notifications

**Task 8.2.1: Build dunning email sequence**
- Acceptance Criteria:
  - Email 1 (immediate): "Payment failed — please update your payment method" with link to billing page
  - Email 2 (3 days later): "Reminder: your payment is still failing"
  - Email 3 (6 days later): "Final notice: your account will be downgraded tomorrow"
  - Each email includes: amount, reason (if available from gateway), update payment link
  - Track which emails have been sent (don't re-send)

### Story 8.3: In-App Payment Failure Alerts

**Task 8.3.1: Build in-app dunning UI**
- Acceptance Criteria:
  - Global banner on all pages when subscription is past_due: "Your payment failed. Update your payment method to avoid service interruption."
  - Banner includes: "Update Payment Method" button, days remaining in grace period
  - Banner type changes: yellow warning → red urgent as deadline approaches
  - Banner dismissible but reappears on next page load

### Story 8.4: Account Downgrade on Persistent Failure

**Task 8.4.1: Implement automatic downgrade**
- Acceptance Criteria:
  - Scheduled job (Strapi cron) runs daily
  - Checks subscriptions where: status is "past_due" AND grace period expired
  - Downgrades user to free plan
  - Cancels gateway subscription
  - Updates local records
  - Sends "Account downgraded" email
  - Logs audit event

### Story 8.5: Recovery Flow

**Task 8.5.1: Build payment recovery page**
- Acceptance Criteria:
  - Dedicated page: `/dashboard/billing/recover`
  - Shows: what went wrong, current status, consequences
  - "Update Payment Method" form (Stripe Elements / SetupIntent)
  - After updating: automatically retry failed payment
  - On success: restore previous plan, clear past_due status
  - Send "Payment recovered" email

---

## Epic 9: Feature Gating & Usage Metering

### Story 9.1: Feature Flag System

**Task 9.1.1: Build feature gating middleware (backend)**
- Acceptance Criteria:
  - Strapi middleware: `requireFeature('feature_name')`
  - Checks user's current plan against feature's required plan
  - Returns 403 with `{ error: 'upgrade_required', requiredPlan: 'pro', feature: 'advanced_analytics' }`
  - Feature flags cached in memory, refreshed periodically

**Task 9.1.2: Build feature gating component (frontend)**
- Acceptance Criteria:
  - `<FeatureGate feature="advanced_analytics">` component
  - If user has access: renders children
  - If user doesn't: renders upgrade prompt with plan comparison
  - `useFeature('feature_name')` hook returns: `{ hasAccess: boolean, requiredPlan: string }`

### Story 9.2: API Usage Tracking

**Task 9.2.1: Build usage tracking middleware**
- Acceptance Criteria:
  - Middleware on metered API endpoints increments user's `usageCount`
  - Checks against plan's `apiCallLimit`
  - If limit exceeded: return 429 with `{ error: 'usage_limit_exceeded', limit: 1000, used: 1001, plan: 'free' }`
  - Usage count reset at start of each billing period (tracked by `usageResetDate`)

**Task 9.2.2: Build usage dashboard**
- Acceptance Criteria:
  - Page at `/dashboard/usage`
  - Shows: current usage vs limit (progress bar), usage over time chart
  - Breakdown by API endpoint (which endpoints consume most calls)
  - Alert when approaching limit (80%, 90%, 100%)
  - "Upgrade" CTA when at or near limit

**Task 9.2.3: Build usage reset cron job**
- Acceptance Criteria:
  - Strapi cron job runs daily
  - For each user where `usageResetDate` has passed: reset `usageCount` to 0, set new `usageResetDate`
  - Reset date matches billing cycle (monthly or annual)

---

## Epic 10: Admin Panel

### Story 10.1: Admin Dashboard

**Task 10.1.1: Build admin overview page**
- Acceptance Criteria:
  - Page at `/admin/dashboard` (or Strapi admin custom view)
  - Stats: total users, active subscribers, MRR (Monthly Recurring Revenue), churn rate
  - Charts: subscriber growth over time, revenue over time
  - Recent events: latest signups, payments, cancellations

### Story 10.2: Subscriber Management

**Task 10.2.1: Build subscriber list view**
- Acceptance Criteria:
  - Table: user email, plan, status, gateway, last payment, actions
  - Search by email
  - Filter by plan, status, gateway
  - Click to view subscriber detail

**Task 10.2.2: Build subscriber detail view**
- Acceptance Criteria:
  - Shows: user profile, subscription details, payment history, usage stats, audit log
  - Admin actions: change plan manually, cancel subscription, extend trial, reset usage
  - Action confirmation dialogs
  - Audit log of all admin actions

### Story 10.3: Revenue Analytics

**Task 10.3.1: Build revenue dashboard**
- Acceptance Criteria:
  - MRR (Monthly Recurring Revenue) calculation and chart
  - ARR (Annual Recurring Revenue)
  - Churn rate (percentage of cancelled subscriptions per month)
  - Net revenue (revenue - refunds)
  - Revenue by gateway (Stripe vs Razorpay)
  - Revenue by plan tier
  - All metrics with date range selector

### Story 10.4: Plan Management

**Task 10.4.1: Build plan management in admin**
- Acceptance Criteria:
  - CRUD for plans via Strapi admin (already available via content type)
  - Ability to activate/deactivate plans
  - Warning when deactivating a plan with active subscribers
  - Price change handling: existing subscribers keep old price, new subscribers get new price

---

## Epic 11: Security & Compliance

### Story 11.1: PCI-DSS Compliance

**Task 11.1.1: Ensure PCI-DSS SAQ-A compliance**
- Acceptance Criteria:
  - No card data handled by our servers (Stripe Checkout / Elements handle all card data)
  - Razorpay checkout modal handles card data
  - No card numbers, CVVs, or expiry dates in logs, database, or server memory
  - Documented in codebase

### Story 11.2: GDPR Compliance

**Task 11.2.1: Implement consent management**
- Acceptance Criteria:
  - Cookie consent banner on first visit
  - Privacy policy page
  - Marketing email consent checkbox during registration (unchecked by default)
  - Consent preferences stored and respected

**Task 11.2.2: Implement data export**
- Acceptance Criteria:
  - `POST /api/user/export-data` endpoint
  - Returns JSON with: profile, subscription history, payment history, usage data
  - Rate limited: 1 per 24 hours

**Task 11.2.3: Implement account deletion**
- Acceptance Criteria:
  - `POST /api/user/delete-account` with password confirmation
  - Cancels active subscription on gateway
  - Anonymizes personal data (name, email → "DELETED_xxxxx")
  - Retains financial records (anonymized) for legal compliance
  - 72-hour grace period with cancellation option

### Story 11.3: Security Headers & Middleware

**Task 11.3.1: Configure Helmet.js for Strapi**
- Acceptance Criteria:
  - `helmet` middleware configured in Strapi
  - CSP, HSTS, X-Frame-Options, X-Content-Type-Options all set
  - Stripe JS and Razorpay JS domains whitelisted in CSP

**Task 11.3.2: Configure CORS**
- Acceptance Criteria:
  - CORS configured in Strapi to allow only frontend origin
  - Credentials mode enabled
  - No wildcard origins in production

**Task 11.3.3: Implement rate limiting**
- Acceptance Criteria:
  - Auth endpoints: 5/min per IP
  - Subscription endpoints: 10/min per user
  - Webhook endpoints: 100/min per IP
  - General API: 60/min per user
  - Returns 429 with Retry-After header

### Story 11.4: Input Validation

**Task 11.4.1: Validate all inputs with Zod**
- Acceptance Criteria:
  - Every Strapi custom controller validates request body
  - Frontend forms validate before submission
  - Shared validation schemas between frontend and backend
  - Sanitize HTML in text inputs

### Story 11.5: Audit Logging

**Task 11.5.1: Comprehensive audit logging**
- Acceptance Criteria:
  - All subscription lifecycle events logged
  - All payment events logged
  - All auth events logged
  - All admin actions logged
  - Logs include: who, what, when, from where (IP), what changed

---

## Epic 12: Error Handling & Monitoring

### Story 12.1: Backend Error Handling

**Task 12.1.1: Create global error handler for Strapi**
- Acceptance Criteria:
  - Custom error handling middleware
  - Consistent error response format: `{ error: { message, code, statusCode, details } }`
  - Different handling for: validation errors, auth errors, payment errors, server errors
  - Stack traces logged server-side, never sent to client

**Task 12.1.2: Configure structured logging**
- Acceptance Criteria:
  - Winston or Pino configured in Strapi
  - JSON format in production, pretty in development
  - Request ID correlation
  - Sensitive data redaction

### Story 12.2: Frontend Error Handling

**Task 12.2.1: Create error boundaries**
- Acceptance Criteria:
  - Global error boundary wraps app
  - Page-level error boundaries for each major section
  - Friendly error UI with "Try Again" button
  - Error details logged to console in dev

**Task 12.2.2: Create API error handler utility**
- Acceptance Criteria:
  - Axios error interceptor categorizes errors
  - Toast notifications for common errors (network, auth, validation)
  - Specific handling for payment errors (show relevant help text)

---

## Epic 13: Email Notifications

### Story 13.1: Email Setup

**Task 13.1.1: Configure Resend with Strapi**
- Acceptance Criteria:
  - Resend provider configured in Strapi email plugin
  - Email templates created using React Email
  - Base template with branding

### Story 13.2: Transactional Emails

**Task 13.2.1: Build all subscription email templates**
- Acceptance Criteria:
  - Welcome email (on registration)
  - Subscription confirmed (plan name, amount, next billing date)
  - Payment receipt (amount, plan, transaction ID, invoice link)
  - Payment failed (amount, reason, update payment link)
  - Subscription cancelled (effective date, what happens to data)
  - Plan upgraded/downgraded
  - Trial ending reminder (3 days before trial ends)
  - Account downgraded (due to persistent payment failure)
  - All emails responsive, tested in Gmail + Outlook

---

## Epic 14: Testing

### Story 14.1: Unit Tests

**Task 14.1.1: Test gateway abstraction layer**
- Acceptance Criteria:
  - Test StripeGateway methods with mocked Stripe SDK
  - Test RazorpayGateway methods with mocked Razorpay SDK
  - Test GatewayFactory returns correct gateway
  - Test unified webhook event normalization

**Task 14.1.2: Test subscription logic**
- Acceptance Criteria:
  - Test upgrade proration calculation
  - Test downgrade scheduling
  - Test grace period calculation
  - Test usage limit checking
  - Test feature flag access checking

### Story 14.2: Integration Tests

**Task 14.2.1: Test subscription API endpoints**
- Acceptance Criteria:
  - Test create checkout session (Stripe)
  - Test create subscription (Razorpay)
  - Test cancel subscription
  - Test upgrade/downgrade
  - Test webhook processing (mock webhook payloads)
  - Test auth middleware (protected routes reject unauthenticated requests)

### Story 14.3: E2E Tests

**Task 14.3.1: Test full subscription lifecycle**
- Acceptance Criteria:
  - Register → Subscribe to Pro (Stripe) → Verify active → Upgrade to Enterprise → Cancel → Verify downgraded to Free
  - Uses Stripe test mode
  - Playwright or Cypress

---

## Epic 15: UI/UX

### Story 15.1: Design System

**Task 15.1.1: Configure design tokens and components**
- Acceptance Criteria:
  - Tailwind theme with custom colors, typography, spacing
  - Radix UI primitives styled with Tailwind
  - Consistent component library: Button, Input, Card, Badge, Table, Dialog, Tabs, Toast
  - Dark mode support
  - Accessible (ARIA, keyboard nav)

### Story 15.2: Layout & Pages

**Task 15.2.1: Build responsive layouts**
- Acceptance Criteria:
  - Public layout (header + content + footer)
  - Dashboard layout (sidebar + header + content)
  - Mobile responsive throughout
  - Sidebar collapses on mobile

**Task 15.2.2: Build billing page**
- Acceptance Criteria:
  - Shows: current plan card, subscription status, next billing date, payment method
  - Actions: upgrade, downgrade, cancel, reactivate, manage payment methods
  - Invoice history table below
  - Usage summary if on metered plan

**Task 15.2.3: Build settings page**
- Acceptance Criteria:
  - Tabs: Profile, Security, Billing, Notifications, Data & Privacy
  - Each tab has its own form/content
  - Save buttons per section

### Story 15.3: Loading & Feedback

**Task 15.3.1: Implement loading and feedback patterns**
- Acceptance Criteria:
  - Skeleton loaders for all data-loading components
  - Button loading spinners
  - Toast notifications for all actions
  - Optimistic updates where appropriate (e.g., toggle settings)
  - Unsaved changes warning on navigation

### Story 15.4: Dark Mode

**Task 15.4.1: Implement dark mode**
- Acceptance Criteria:
  - Toggle in header
  - Persisted in localStorage
  - System preference respected
  - All components themed
  - No flash of wrong theme

---

## Production Checklist

### Payments
- [ ] Stripe and Razorpay API keys separated for test/live
- [ ] Webhook signatures verified for both gateways
- [ ] All webhook events processed idempotently
- [ ] Subscription status in DB always matches gateway
- [ ] Proration handled correctly on upgrades
- [ ] Downgrade scheduled at period end (not immediate)
- [ ] Cancel at period end (not immediate, unless explicitly chosen)
- [ ] Failed payments trigger dunning sequence
- [ ] Grace period implemented before feature restriction
- [ ] Payment method update flow works end-to-end
- [ ] Invoice history accessible to users

### Auth & Security
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens short-lived (15 min) with refresh rotation
- [ ] Refresh tokens stored in DB for revocation
- [ ] Rate limiting on auth endpoints
- [ ] Generic error messages (don't reveal email existence)
- [ ] Security headers configured (Helmet)
- [ ] CORS restricted to known origins
- [ ] Input validation on all endpoints (Zod)
- [ ] No card data on server (PCI-DSS SAQ-A)

### Data & Compliance
- [ ] GDPR: consent, data export, account deletion
- [ ] Audit logs for all financial and auth events
- [ ] Financial records retained after account deletion
- [ ] Privacy policy page

### Feature Gating
- [ ] Features restricted based on plan tier
- [ ] API usage tracked and limited per plan
- [ ] Upgrade prompts shown when hitting limits
- [ ] Usage resets on billing cycle

### Reliability
- [ ] Error boundaries prevent full-page crashes
- [ ] Structured logging with request correlation
- [ ] Health check endpoint
- [ ] Graceful handling of gateway outages (show message, don't crash)
