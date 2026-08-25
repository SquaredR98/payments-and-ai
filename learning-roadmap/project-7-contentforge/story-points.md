# Project 7: ContentForge — AI Content Generation Platform

## Project Overview

**What it is:** A platform where businesses generate AI-powered content — blog posts, marketing copy, social media posts, email campaigns, product descriptions. Supports multiple payment gateways (Razorpay and PayPal in-depth), has a credit-based billing model, and uses multiple AI providers. Think Jasper.ai or Copy.ai.

**Tech Stack:**
- **Backend/CMS:** PayloadCMS (advanced usage — custom endpoints, hooks, access control, plugins)
- **Frontend:** TanStack Router (SPA with type-safe routing)
- **Database:** PostgreSQL (via PayloadCMS)
- **Styling:** Tailwind CSS + Park UI (Ark UI + Tailwind presets)
- **Payments:** Razorpay (in-depth — orders, subscriptions, payment links, UPI), PayPal (Orders API, Subscriptions API, Payouts)
- **AI:** Multi-provider (OpenAI, Claude, Groq) with template system
- **Deployment:** Local development only

**Why this project exists:** Projects 1-6 focused heavily on Stripe. This project gives you deep Razorpay and PayPal expertise — both are critical for global freelancing and Indian market clients. Also, advanced PayloadCMS patterns beyond the basics learned in Project 1.

**What You Will Learn:**
1. PayloadCMS advanced — custom endpoints, plugins, complex hooks, virtual fields, custom components
2. TanStack Router — file-based routing, loaders, actions, search params, type-safe navigation
3. Razorpay deep dive — Orders API, Subscriptions, Payment Links, UPI payments, signature verification, webhooks
4. PayPal deep dive — Orders API, Subscriptions API, advanced webhook handling, PayPal Payouts
5. Multi-gateway billing — credit system across Razorpay and PayPal
6. AI content templates — structured content generation with templates
7. Content workspace — projects, folders, collaboration

---

## Feature List Summary

1. PayloadCMS advanced setup with custom endpoints and plugins
2. TanStack Router SPA frontend
3. Authentication (PayloadCMS auth with magic links)
4. Workspace & project organization
5. AI content templates (30+ templates for different content types)
6. Multi-provider AI generation (OpenAI, Claude, Groq)
7. Content editor with AI assistance
8. Content history and versioning
9. Brand voice configuration
10. Credit-based billing system
11. Razorpay Orders API (one-time credit purchases)
12. Razorpay Subscriptions (recurring plan billing)
13. Razorpay Payment Links (shareable payment links)
14. Razorpay UPI payments
15. Razorpay signature verification
16. Razorpay webhooks
17. PayPal Orders API (one-time purchases)
18. PayPal Subscriptions API (recurring billing)
19. PayPal webhook handling
20. Multi-gateway credit system (buy credits via any gateway)
21. Usage tracking and analytics
22. Team/workspace collaboration
23. Content export (various formats)
24. Favorites and content library
25. Admin panel (users, usage, revenue, templates)
26. Security (CORS, rate limiting, input validation)
27. GDPR compliance
28. Audit logging
29. Testing
30. Responsive UI with dark mode

---

## Epic 1: Project Setup & Architecture

### Story 1.1: Initialize PayloadCMS (Advanced)

**Task 1.1.1: Create PayloadCMS project**
- Acceptance Criteria:
  - PayloadCMS initialized with Next.js adapter
  - PostgreSQL configured
  - Admin panel at `/admin`
  - Custom CSS for admin panel branding
  - Plugin architecture understood (for custom functionality)

**Task 1.1.2: Setup custom API endpoints**
- Acceptance Criteria:
  - PayloadCMS custom endpoints configured (beyond auto-generated CRUD)
  - Custom routes: `/api/ai/generate`, `/api/payments/razorpay/*`, `/api/payments/paypal/*`, `/api/credits/*`
  - Middleware for auth on custom routes
  - Code comment: "PayloadCMS auto-generates REST + GraphQL for collections. Custom endpoints handle business logic that doesn't fit the CRUD pattern."

### Story 1.2: Initialize TanStack Router Frontend

**Task 1.2.1: Setup TanStack Router project**
- Acceptance Criteria:
  - Vite + React + TypeScript
  - TanStack Router installed with file-based routing
  - Route tree: `/`, `/login`, `/register`, `/dashboard`, `/dashboard/workspace/$workspaceId`, `/dashboard/generate`, `/dashboard/library`, `/dashboard/billing`, `/dashboard/settings`
  - Type-safe route params and search params
  - Loaders for data fetching on route entry
  - Auth guard middleware

**Task 1.2.2: Configure Park UI**
- Acceptance Criteria:
  - Park UI (Ark UI + Tailwind CSS presets) installed
  - Theme customized with brand colors
  - Components: Button, Input, Card, Dialog, Menu, Tabs, Toast, Select, Switch, Textarea, Accordion
  - Dark mode configured

---

## Epic 2: Authentication

### Story 2.1: PayloadCMS Auth with Magic Links

**Task 2.1.1: Configure auth collection**
- Acceptance Criteria:
  - Users collection with auth enabled
  - Fields: email, name, avatar, currentPlan, creditsBalance, stripeCustomerId (for potential Stripe addition), razorpayCustomerId, paypalEmail, createdAt
  - Magic link login: user enters email, receives login link (no password needed)
  - Also support email/password as fallback
  - Google OAuth via PayloadCMS auth strategy

**Task 2.1.2: Build auth pages**
- Acceptance Criteria:
  - Login page with magic link option + email/password + Google
  - Register page
  - Magic link verification page
  - Auth state managed via TanStack Router loader + context

---

## Epic 3: Database Schema Design

### Story 3.1: Content & Workspace Collections

**Task 3.1.1: Create Workspace collection**
- Acceptance Criteria:
  - Fields: id, name, description, ownerId (User ref), members (array of {userId, role: owner/editor/viewer}), createdAt
  - Access: members only
  - Default workspace created on user registration

**Task 3.1.2: Create Project collection**
- Acceptance Criteria:
  - Fields: id, workspaceId (ref), name, description, brandVoice (ref to BrandVoice), contentCount, createdAt
  - Access: workspace members

**Task 3.1.3: Create Content collection**
- Acceptance Criteria:
  - Fields: id, projectId (ref), workspaceId (ref), title, content (rich text — the generated/edited content), templateUsed (string), prompt (text — what user asked for), model (string — which AI model), status (draft/final/archived), wordCount, tokensUsed, isFavorite (boolean), tags (string array), versions (array of {content, createdAt} — history), createdAt, updatedAt
  - Access: workspace members
  - Versioning: each save creates a version entry

**Task 3.1.4: Create Template collection**
- Acceptance Criteria:
  - Fields: id, name, slug, description, category (blog/social/email/ad/product/general), icon, systemPrompt (text — the AI prompt template), inputFields (JSON array — what user needs to provide), outputFormat (text/markdown/html), isActive, isPremium (requires paid plan), sortOrder
  - Seed 30+ templates

**Task 3.1.5: Create BrandVoice collection**
- Acceptance Criteria:
  - Fields: id, userId (ref), name, tone (formal/casual/professional/friendly/humorous), targetAudience (text), brandGuidelines (text), sampleContent (text array — examples of brand voice), companyDescription (text), industryKeywords (string array)
  - Users can create multiple brand voices
  - Brand voice injected into AI prompts

### Story 3.2: Billing Collections

**Task 3.2.1: Create CreditTransaction collection**
- Acceptance Criteria:
  - Fields: id, userId (ref), type (purchase/usage/bonus/refund), amount (positive for credit, negative for debit), balance (running balance), description, gateway (razorpay/paypal/system), gatewayTransactionId, contentId (ref, nullable — which content consumed these credits), createdAt
  - Used for credit ledger tracking

**Task 3.2.2: Create Subscription collection**
- Acceptance Criteria:
  - Fields: id, userId (ref unique), plan (free/pro/enterprise), gateway (razorpay/paypal), gatewaySubscriptionId, status (active/past_due/cancelled), currentPeriodStart, currentPeriodEnd, creditsPerPeriod, billingInterval (monthly/annual), createdAt, updatedAt

**Task 3.2.3: Create AuditLog collection**
- Acceptance Criteria:
  - Standard audit log: action, entity, entityId, userId, details (JSON), createdAt
  - Admin read-only

---

## Epic 4: AI Content Templates & Generation

### Story 4.1: Template System

**Task 4.1.1: Seed content templates**
- Acceptance Criteria:
  - 30+ templates seeded across categories:
  - **Blog:** Blog post, Blog outline, Blog intro, Blog conclusion, SEO blog
  - **Social Media:** Tweet thread, LinkedIn post, Instagram caption, Facebook post, YouTube description
  - **Email:** Cold email, Follow-up email, Newsletter, Welcome email, Promotional email
  - **Advertising:** Google ad copy, Facebook ad, Product listing, Landing page headline
  - **Product:** Product description, Feature list, Comparison chart, FAQ
  - **General:** Summarize text, Rewrite/improve, Expand text, Grammar fix, Translate
  - Each template has: system prompt, input fields config, output format

**Task 4.1.2: Build template browsing UI**
- Acceptance Criteria:
  - Page at `/dashboard/generate`
  - Template cards in grid, organized by category tabs
  - Search templates by name
  - Premium badge on paid-only templates
  - Click to open generation form

### Story 4.2: Content Generation

**Task 4.2.1: Build generation endpoint**
- Acceptance Criteria:
  - PayloadCMS custom endpoint: `POST /api/ai/generate`
  - Accepts: templateSlug, inputs (object matching template's inputFields), model, brandVoiceId (optional), projectId
  - Process:
    1. Fetch template's systemPrompt
    2. If brandVoiceId: fetch brand voice and inject into system prompt
    3. Construct user message from inputs
    4. Call selected LLM provider
    5. Track tokens used
    6. Deduct credits
    7. Save to Content collection
    8. Return generated content
  - Streaming support (SSE)

**Task 4.2.2: Build generation form UI**
- Acceptance Criteria:
  - Dynamic form based on template's inputFields config
  - Example for "Blog Post" template: topic, keywords, tone, length, target audience
  - Model selector dropdown (GPT-4, Claude, Llama)
  - Brand voice selector (if any configured)
  - Project selector (which project to save to)
  - "Generate" button with streaming response display
  - Generated content appears in editor below
  - "Save", "Copy", "Regenerate" buttons
  - Credits cost shown before generating

**Task 4.2.3: Build content editor**
- Acceptance Criteria:
  - Rich text editor (Tiptap or similar)
  - AI-generated content loaded into editor for further editing
  - AI assist features within editor:
    - Select text → "Improve", "Expand", "Shorten", "Change tone"
    - Each AI edit tracked and costs credits
  - Auto-save drafts
  - Word count display

### Story 4.3: Multi-Provider AI

**Task 4.3.1: Build provider abstraction**
- Acceptance Criteria:
  - Same pattern as Project 5 but in TypeScript (PayloadCMS is Node.js)
  - Providers: OpenAI (GPT-4, GPT-3.5), Anthropic (Claude 3 Sonnet, Haiku), Groq (Llama 3, Mixtral)
  - Unified interface for generation and streaming
  - Fallback chain
  - Token counting per provider
  - Cost calculation per provider

### Story 4.4: Brand Voice

**Task 4.4.1: Build brand voice management**
- Acceptance Criteria:
  - Page at `/dashboard/settings/brand-voices`
  - Create/Edit brand voice: name, tone, audience, guidelines, sample content
  - "Train" feature: paste 3-5 examples of your writing, AI extracts voice characteristics
  - Brand voice selector available on every generation form
  - When selected: system prompt prepended with brand voice instructions

---

## Epic 5: Razorpay Integration (Deep Dive)

### Story 5.1: Razorpay Setup

**Task 5.1.1: Configure Razorpay**
- Acceptance Criteria:
  - `razorpay` npm package installed
  - Razorpay instance in `src/lib/razorpay.ts`
  - Key ID and Secret from env vars
  - Test mode configured
  - Razorpay Dashboard account setup documented

### Story 5.2: Razorpay Orders API (One-Time Credit Purchase)

**Task 5.2.1: Build Razorpay order creation endpoint**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/razorpay/create-order`
  - Accepts: creditPackageId (e.g., 500 credits for ₹499, 2000 for ₹1499, 5000 for ₹2999)
  - Creates Razorpay Order:
    ```typescript
    razorpay.orders.create({
      amount: priceInPaise, // Razorpay uses paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `order_${nanoid()}`,
      notes: { userId, creditPackageId, credits }
    })
    ```
  - Returns: `{ orderId, amount, currency, key }` for frontend checkout

**Task 5.2.2: Build Razorpay checkout on frontend**
- Acceptance Criteria:
  - Load Razorpay checkout script: `<script src="https://checkout.razorpay.com/v1/checkout.js">`
  - Open checkout modal:
    ```typescript
    const rzp = new Razorpay({
      key: razorpayKeyId,
      order_id: orderId,
      amount: amount,
      currency: 'INR',
      name: 'ContentForge',
      description: '500 AI Credits',
      handler: function(response) {
        // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
        verifyPayment(response)
      },
      prefill: { email: userEmail, name: userName },
      theme: { color: '#your-brand-color' }
    })
    rzp.open()
    ```
  - Handle: payment success, payment failure, modal close

**Task 5.2.3: Build payment verification endpoint**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/razorpay/verify`
  - Accepts: razorpay_payment_id, razorpay_order_id, razorpay_signature
  - Verify signature:
    ```typescript
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')
    if (generatedSignature === razorpay_signature) { /* valid */ }
    ```
  - If valid: add credits to user balance, create CreditTransaction record
  - If invalid: return 400, log security event
  - Code comment: "Razorpay signature verification is CRITICAL. Without it, anyone could fake a payment by sending arbitrary payment IDs."

### Story 5.3: Razorpay Subscriptions

**Task 5.3.1: Create Razorpay Plans**
- Acceptance Criteria:
  - Create plans via Razorpay API:
    ```typescript
    razorpay.plans.create({
      period: 'monthly', // or 'yearly'
      interval: 1,
      item: {
        name: 'Pro Plan',
        amount: 249900, // ₹2499 in paise
        currency: 'INR',
        description: '5000 credits/month, all models'
      }
    })
    ```
  - Plans created for: Pro Monthly, Pro Annual, Enterprise Monthly, Enterprise Annual
  - Plan IDs stored in database

**Task 5.3.2: Build subscription creation endpoint**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/razorpay/create-subscription`
  - Creates Razorpay Subscription:
    ```typescript
    razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // billing cycles
      notes: { userId, plan }
    })
    ```
  - Returns subscription ID for checkout

**Task 5.3.3: Build subscription checkout**
- Acceptance Criteria:
  - Same Razorpay modal but with `subscription_id` instead of `order_id`
  - After payment: verify signature and activate subscription locally

**Task 5.3.4: Build subscription management**
- Acceptance Criteria:
  - Cancel: `razorpay.subscriptions.cancel(subscriptionId, { cancel_at_cycle_end: true })`
  - Upgrade/Downgrade: cancel current + create new (Razorpay doesn't support in-place changes)
  - Pause/Resume: `razorpay.subscriptions.pause(id)` / `razorpay.subscriptions.resume(id)`

### Story 5.4: Razorpay Payment Links

**Task 5.4.1: Build payment link generation**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/razorpay/create-payment-link`
  - Creates shareable payment link:
    ```typescript
    razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: 'INR',
      accept_partial: false,
      description: '500 AI Credits - ContentForge',
      customer: { name, email },
      notify: { sms: true, email: true },
      callback_url: `${APP_URL}/payments/success`,
      callback_method: 'get'
    })
    ```
  - Returns: short URL that can be shared via email, WhatsApp, etc.
  - Code comment: "Payment Links are useful for sending payment requests to users who aren't on your platform. Common in Indian B2B payments."

### Story 5.5: Razorpay UPI Payments

**Task 5.5.1: Enable UPI in checkout**
- Acceptance Criteria:
  - Razorpay checkout automatically shows UPI option for INR payments
  - Supports: UPI ID (VPA), QR code scan, UPI apps (Google Pay, PhonePe, Paytm)
  - Code comment: "UPI is India's most popular payment method. Razorpay's checkout handles UPI natively — no extra code needed. But understanding the flow is important: user enters VPA or scans QR → bank sends push notification → user approves on banking app → payment confirmed."
  - Handle UPI-specific statuses: pending (user hasn't approved yet), authorized, captured

### Story 5.6: Razorpay Webhooks

**Task 5.6.1: Build Razorpay webhook handler**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/webhooks/razorpay`
  - Verify webhook signature using Razorpay webhook secret
  - Handle events:
    - `payment.authorized`: payment authorized (for UPI/netbanking where capture is separate)
    - `payment.captured`: payment captured successfully
    - `payment.failed`: payment failed
    - `subscription.charged`: subscription renewal payment
    - `subscription.pending`: subscription payment pending
    - `subscription.halted`: multiple failures
    - `subscription.cancelled`: subscription cancelled
    - `order.paid`: order completed
    - `refund.processed`: refund completed
  - Idempotent processing
  - Audit logging for all events

---

## Epic 6: PayPal Integration (Deep Dive)

### Story 6.1: PayPal Setup

**Task 6.1.1: Configure PayPal SDK**
- Acceptance Criteria:
  - PayPal REST API client configured (`@paypal/checkout-server-sdk` or direct REST)
  - Client ID and Secret from env vars
  - Sandbox mode for development
  - Access token management (PayPal uses OAuth2 — get token, use for API calls, handle expiry)
  - Code comment: "PayPal REST API requires an OAuth2 access token. You get it by calling /v1/oauth2/token with client ID + secret. Token expires in ~9 hours. Cache it."

### Story 6.2: PayPal Orders API (One-Time Purchase)

**Task 6.2.1: Build PayPal order creation**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/paypal/create-order`
  - Creates PayPal Order:
    ```typescript
    // POST https://api-m.sandbox.paypal.com/v2/checkout/orders
    {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: '9.99' },
        description: '500 AI Credits',
        custom_id: `credits_${userId}_${packageId}`
      }],
      application_context: {
        return_url: `${APP_URL}/payments/paypal/success`,
        cancel_url: `${APP_URL}/payments/paypal/cancel`,
        brand_name: 'ContentForge',
        user_action: 'PAY_NOW'
      }
    }
    ```
  - Returns: order ID and approval URL

**Task 6.2.2: Build PayPal Smart Buttons**
- Acceptance Criteria:
  - `@paypal/react-paypal-js` for client-side buttons
  - PayPalButtons component with:
    - `createOrder`: calls backend to create order
    - `onApprove`: calls backend to capture order
    - `onError`: shows error message
    - `onCancel`: shows cancellation message
  - Button styles match platform design

**Task 6.2.3: Build PayPal order capture**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/paypal/capture-order`
  - Capture the order: `POST /v2/checkout/orders/{orderId}/capture`
  - Verify status is COMPLETED
  - Extract payer info (email, payer_id)
  - Add credits to user balance
  - Create CreditTransaction record
  - Idempotency check before processing

### Story 6.3: PayPal Subscriptions API

**Task 6.3.1: Create PayPal Products and Plans**
- Acceptance Criteria:
  - Create Product: `POST /v1/catalogs/products { name, type: 'SERVICE' }`
  - Create Plan:
    ```
    POST /v1/billing/plans
    {
      product_id: productId,
      name: 'Pro Plan',
      billing_cycles: [{
        frequency: { interval_unit: 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        pricing_scheme: { fixed_price: { value: '29.99', currency_code: 'USD' } }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3
      }
    }
    ```
  - Plan IDs stored in database

**Task 6.3.2: Build PayPal subscription creation**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/payments/paypal/create-subscription`
  - Creates subscription:
    ```
    POST /v1/billing/subscriptions
    {
      plan_id: planId,
      subscriber: { name: { given_name, surname }, email_address },
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl,
        user_action: 'SUBSCRIBE_NOW'
      }
    }
    ```
  - Returns: approval URL for redirect

**Task 6.3.3: Build subscription activation**
- Acceptance Criteria:
  - After user approves: capture subscription ID from return URL
  - Verify subscription status: `GET /v1/billing/subscriptions/{id}`
  - If ACTIVE: create local subscription record, allocate credits
  - Handle: APPROVAL_PENDING, ACTIVE, SUSPENDED, CANCELLED

**Task 6.3.4: Build subscription management**
- Acceptance Criteria:
  - Cancel: `POST /v1/billing/subscriptions/{id}/cancel { reason }`
  - Suspend: `POST /v1/billing/subscriptions/{id}/suspend { reason }`
  - Reactivate: `POST /v1/billing/subscriptions/{id}/activate`
  - Upgrade/Downgrade: `POST /v1/billing/subscriptions/{id}/revise { plan_id: newPlanId }`
  - PayPal supports in-place plan revision (unlike Razorpay)

### Story 6.4: PayPal Webhooks

**Task 6.4.1: Build PayPal webhook handler**
- Acceptance Criteria:
  - Custom endpoint: `POST /api/webhooks/paypal`
  - Verify webhook signature:
    ```
    POST https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature
    {
      auth_algo, cert_url, transmission_id, transmission_sig, transmission_time,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: rawBody
    }
    ```
  - Handle events:
    - `PAYMENT.CAPTURE.COMPLETED`: one-time payment succeeded
    - `PAYMENT.CAPTURE.DENIED`: payment denied
    - `BILLING.SUBSCRIPTION.ACTIVATED`: subscription started
    - `BILLING.SUBSCRIPTION.CANCELLED`: subscription cancelled
    - `BILLING.SUBSCRIPTION.SUSPENDED`: payment failures
    - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`: renewal failed
    - `PAYMENT.SALE.COMPLETED`: subscription renewal payment
  - Idempotent processing

---

## Epic 7: Multi-Gateway Credit System

### Story 7.1: Unified Credit Management

**Task 7.1.1: Build credit system**
- Acceptance Criteria:
  - Credits are gateway-agnostic — whether you pay via Razorpay or PayPal, you get the same credits
  - Credit deduction on AI generation: atomic operation (check balance → deduct → generate)
  - Credit costs per operation: GPT-3.5 = 1, GPT-4 = 10, Claude Sonnet = 5, Llama = 1
  - Credit balance displayed prominently in UI
  - Low credit warning (below 10% of plan allocation)

**Task 7.1.2: Build credit ledger**
- Acceptance Criteria:
  - CreditTransaction collection acts as an append-only ledger
  - Every credit change creates an entry: purchase (+), usage (-), bonus (+), refund (+)
  - Running balance maintained
  - Ledger is the source of truth (not a simple counter)
  - Code comment: "A ledger is more reliable than a simple counter. If a counter gets corrupted, you can recalculate from the ledger entries."

### Story 7.2: Gateway Selection UI

**Task 7.2.1: Build payment gateway selection**
- Acceptance Criteria:
  - Billing page shows both gateways
  - For one-time purchases: "Pay with Razorpay (INR)" and "Pay with PayPal (USD)"
  - For subscriptions: same choice
  - Remember preference but allow switching
  - Show prices in both currencies where applicable
  - Handle: user has active Razorpay subscription, wants to switch to PayPal (cancel old, create new)

---

## Epic 8: Content Management

### Story 8.1: Content Library

**Task 8.1.1: Build content library page**
- Acceptance Criteria:
  - Page at `/dashboard/library`
  - List all generated content across projects
  - Filter by: project, template type, status, date, favorited
  - Search content by title or text
  - Sort by: newest, oldest, most edited
  - Content cards: title, template badge, word count, date, favorite star

### Story 8.2: Content Versioning

**Task 8.2.1: Build version history**
- Acceptance Criteria:
  - Every save creates a version entry (auto-save + manual save)
  - View version history per content item
  - Diff view between versions (side-by-side)
  - Restore previous version
  - Max 50 versions per content item (oldest pruned)

### Story 8.3: Export

**Task 8.3.1: Build content export**
- Acceptance Criteria:
  - Export as: Plain Text, Markdown, HTML, PDF, Word (DOCX)
  - Copy to clipboard (formatted)
  - Bulk export (select multiple, download as ZIP)

---

## Epic 9: Workspace & Collaboration

### Story 9.1: Workspace Management

**Task 9.1.1: Build workspace features**
- Acceptance Criteria:
  - Create/Edit/Delete workspaces
  - Invite members by email (editor/viewer roles)
  - Shared content within workspace
  - Usage attribution per workspace member
  - Enterprise plan: multiple workspaces, Pro: 1 workspace, Free: personal only

---

## Epic 10: Admin Panel

### Story 10.1: Admin Dashboard

**Task 10.1.1: Build admin overview**
- Acceptance Criteria:
  - PayloadCMS admin + custom admin pages
  - Stats: total users, active subscribers, total content generated, revenue by gateway, AI costs
  - Charts: users over time, revenue over time, content generated per day
  - Gateway breakdown: Razorpay vs PayPal revenue

### Story 10.2: Management

**Task 10.2.1: Build admin management**
- Acceptance Criteria:
  - User management (view, suspend, adjust credits, change plan)
  - Template management (CRUD, reorder, toggle premium)
  - Usage analytics (which templates popular, which models preferred)
  - Financial reporting (revenue, refunds, by gateway)
  - Audit log viewer

---

## Epic 11: Security & Compliance

### Story 11.1: Security

**Task 11.1.1: Implement security measures**
- Acceptance Criteria:
  - Razorpay signature verification on every payment callback
  - PayPal webhook signature verification
  - Rate limiting on: auth (5/min), AI generation (20/min), payments (10/min)
  - Input validation on all endpoints
  - CSP headers (allow Razorpay + PayPal scripts)
  - CORS restricted
  - Credit operations are atomic (prevent double-spend)
  - API keys for AI providers: server-side only

### Story 11.2: GDPR

**Task 11.2.1: Implement compliance**
- Acceptance Criteria:
  - Cookie consent
  - Privacy policy
  - Data export (user data + content)
  - Account deletion (delete content, anonymize billing records)
  - Content is user's intellectual property — handle with care

### Story 11.3: Audit Logging

**Task 11.3.1: Comprehensive audit logging**
- Acceptance Criteria:
  - All payment events (both gateways)
  - All credit transactions
  - All AI generations (template, model, tokens, cost)
  - All auth events
  - All admin actions

---

## Epic 12: Testing

### Story 12.1: Tests

**Task 12.1.1: Unit tests**
- Acceptance Criteria:
  - Test credit deduction logic (atomicity, edge cases)
  - Test Razorpay signature verification
  - Test PayPal order flow
  - Test credit cost calculation per model
  - Test template rendering

**Task 12.1.2: Integration tests**
- Acceptance Criteria:
  - Test Razorpay order → verify → credit flow (mock Razorpay)
  - Test PayPal order → capture → credit flow (mock PayPal)
  - Test subscription lifecycle (both gateways)
  - Test AI generation with credit deduction

**Task 12.1.3: E2E tests**
- Acceptance Criteria:
  - Register → Purchase credits (Razorpay) → Generate content → Export
  - Subscribe (PayPal) → Generate content → Cancel subscription

---

## Epic 13: UI/UX

### Story 13.1: Design & Layout

**Task 13.1.1: Build responsive UI**
- Acceptance Criteria:
  - Park UI (Ark UI + Tailwind) component system
  - Dashboard layout with sidebar navigation
  - Content generation page (template selector + form + editor)
  - Billing page with gateway selection
  - Responsive on all devices
  - Dark mode
  - Loading states and skeletons

---

## Production Checklist

### Razorpay
- [ ] Signature verification on every payment callback
- [ ] Orders API flow: create → checkout → verify → credit
- [ ] Subscriptions: create plan → create subscription → checkout → webhook
- [ ] Payment Links generation works
- [ ] UPI payments handled (pending states)
- [ ] All webhook events processed idempotently
- [ ] Test mode vs live mode separated
- [ ] Amount in paise (not rupees)

### PayPal
- [ ] OAuth2 access token management (caching, refresh)
- [ ] Orders API: create → approve → capture
- [ ] Subscriptions: product → plan → subscription → activate
- [ ] Webhook signature verification via PayPal API
- [ ] All webhook events processed idempotently
- [ ] Sandbox vs production environment separated
- [ ] Amount as string with 2 decimal places

### Credits
- [ ] Credit operations are atomic (no double-spend)
- [ ] Credit ledger is append-only source of truth
- [ ] Credits deducted before AI generation (not after)
- [ ] Low credit warnings displayed
- [ ] Plan credits reset on subscription renewal
- [ ] Top-up credits don't expire
- [ ] Gateway-agnostic (same credits regardless of payment method)

### AI
- [ ] All provider API keys server-side only
- [ ] Token counting accurate per provider
- [ ] Cost tracking per generation
- [ ] Rate limiting on AI endpoints
- [ ] Error handling for all providers
- [ ] Streaming works correctly
- [ ] Brand voice injection works
