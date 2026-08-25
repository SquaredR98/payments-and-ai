# Project 8: LaunchPad — AI SaaS Builder Platform (Capstone)

## Project Overview

**What it is:** A platform where entrepreneurs launch micro-SaaS products. The platform provides AI tools (landing page generator, marketing copy, embeddable chatbot) and handles billing for their customers. This capstone combines every skill from projects 1-7: all payment gateways, all Stripe Connect types, advanced LLM orchestration, multi-service architecture.

**Tech Stack:**
- **API Gateway:** NestJS (Node.js — routes requests, auth, rate limiting)
- **AI Microservice:** Python FastAPI (LLM orchestration, RAG, streaming)
- **Frontend:** Next.js 14+ (App Router)
- **Database:** PostgreSQL + Prisma (shared across services)
- **Cache/Queue:** Redis (response caching, rate limiting, job queue)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe (all Connect types + subscriptions + metered), Razorpay, PayPal — multi-gateway routing
- **AI:** OpenAI, Claude, Groq — full orchestration layer with fallbacks, caching, budget management
- **Deployment:** Local development (Docker Compose for multi-service)

**What You Will Learn:**
1. Multi-service architecture — API gateway pattern, inter-service communication, Docker Compose
2. NestJS as API gateway — request routing, auth forwarding, rate limiting
3. Multi-gateway payment routing — route payments to Stripe/Razorpay/PayPal based on region/currency
4. All Stripe Connect types in one platform — Standard, Express, Custom with selection logic
5. Three billing models — subscriptions + one-time + usage-based (all in one system)
6. LLM orchestration — provider abstraction, fallback chains, response caching, token budgets, streaming across services
7. Redis — caching, rate limiting, job queues
8. Webhook forwarding — receive webhooks, process, and forward to downstream users
9. API design — versioned REST API, key auth, SDK concepts
10. Production patterns — distributed tracing, circuit breakers, graceful degradation

---

## Feature List Summary

1. Multi-service project setup (NestJS + FastAPI + Next.js + Redis + PostgreSQL)
2. Docker Compose for local development
3. Auth across services (JWT propagation)
4. Organization and team management
5. Multi-gateway checkout (Stripe, Razorpay, PayPal — user chooses)
6. Payment routing engine (region/currency-based automatic selection)
7. Stripe Connect — all three types (Standard, Express, Custom) with selection guide
8. Platform fee management across Connect types
9. Payout management across Connect types
10. Three billing models: subscription + one-time + usage-based (metered)
11. Multi-currency support
12. AI landing page generator (Claude with streaming)
13. AI marketing copy generator (multi-model)
14. AI chatbot builder (embeddable widget with RAG)
15. LLM orchestration layer (provider abstraction, fallbacks, caching)
16. Token budget management per user/org
17. Cost tracking across all AI operations
18. Streaming response pipeline (FastAPI → NestJS → Next.js → Browser)
19. Redis caching for AI responses
20. Redis-based rate limiting
21. Redis job queue for async operations
22. Webhook management system (receive, process, forward)
23. API with versioning, key auth, rate limiting, usage tracking
24. Admin super-dashboard
25. Security (multi-service, all gateways)
26. GDPR compliance
27. Audit logging
28. Distributed tracing (correlation IDs across services)
29. Circuit breakers for external APIs
30. Testing
31. Responsive UI

---

## Epic 1: Multi-Service Architecture Setup

### Story 1.1: Docker Compose Environment

**Task 1.1.1: Create Docker Compose configuration**
- Acceptance Criteria:
  - `docker-compose.yml` defining services:
    - `api-gateway`: NestJS on port 3001
    - `ai-service`: FastAPI on port 8000
    - `frontend`: Next.js on port 3000
    - `postgres`: PostgreSQL on port 5432
    - `redis`: Redis on port 6379
  - Shared network for inter-service communication
  - Environment variables per service
  - Volume mounts for hot reload in development
  - `docker-compose up` starts everything
  - Code comment: "Docker Compose orchestrates all services locally. In production, you'd use Kubernetes or a similar orchestrator."

**Task 1.1.2: Configure shared database**
- Acceptance Criteria:
  - Single PostgreSQL instance shared between NestJS and FastAPI
  - Prisma (NestJS) as primary ORM for migrations and schema management
  - SQLAlchemy or raw asyncpg (FastAPI) for read queries
  - Schema managed by Prisma, Python reads from same tables
  - Code comment: "Shared DB is simpler for this project. In production microservices, each service typically owns its database (database-per-service pattern)."

### Story 1.2: NestJS API Gateway

**Task 1.2.1: Setup NestJS as API gateway**
- Acceptance Criteria:
  - NestJS project with modules: AuthModule, GatewayModule, PaymentsModule, StripeConnectModule, WebhooksModule, AdminModule
  - Gateway routes: proxy AI requests to FastAPI
  - All requests authenticated at gateway level (JWT verification)
  - Rate limiting at gateway level (Redis-backed)
  - Request logging with correlation IDs
  - Swagger docs at `/api/docs`

**Task 1.2.2: Build request proxying to FastAPI**
- Acceptance Criteria:
  - NestJS `HttpService` (Axios) proxies `/api/ai/*` to FastAPI
  - JWT token forwarded to FastAPI
  - Streaming proxied correctly (SSE passthrough)
  - Timeout handling (30s for AI requests)
  - Circuit breaker: if FastAPI is down, return 503 gracefully
  - Code comment: "API Gateway pattern: single entry point for clients. Handles cross-cutting concerns (auth, rate limiting, logging) so downstream services don't have to."

### Story 1.3: FastAPI AI Microservice

**Task 1.3.1: Setup FastAPI service**
- Acceptance Criteria:
  - FastAPI project with routers: landing_page, marketing_copy, chatbot, orchestration, health
  - JWT verification middleware (verifies tokens from API gateway)
  - Database connection (read from shared PostgreSQL)
  - Redis connection (for caching)
  - Auto-generated docs at `/docs`

### Story 1.4: Redis Setup

**Task 1.4.1: Configure Redis for multiple use cases**
- Acceptance Criteria:
  - Redis instance with logical databases or key prefixes:
    - `cache:` — AI response caching
    - `ratelimit:` — rate limiting counters
    - `queue:` — job queue for async operations
    - `session:` — optional session storage
  - Redis client configured in both NestJS and FastAPI
  - Connection pooling
  - Code comment: "Redis is an in-memory data store used for: (1) caching expensive AI responses, (2) tracking rate limits with TTL-based counters, (3) job queues for background processing."

### Story 1.5: Distributed Tracing

**Task 1.5.1: Implement correlation IDs**
- Acceptance Criteria:
  - NestJS middleware generates UUID `x-correlation-id` for each request
  - Correlation ID forwarded to FastAPI in headers
  - Correlation ID included in all log entries (both services)
  - Response headers include correlation ID (for debugging)
  - Code comment: "When a request flows through multiple services, correlation IDs let you trace the full journey in logs. Without them, debugging distributed systems is painful."

---

## Epic 2: Authentication & Organization Management

### Story 2.1: Auth Across Services

**Task 2.1.1: Build JWT auth in API gateway**
- Acceptance Criteria:
  - Registration, login, refresh token, password reset — all in NestJS
  - JWT contains: userId, email, orgId, role, plan
  - FastAPI validates same JWT (shared secret)
  - Auth state consistent across services

### Story 2.2: Organization Management

**Task 2.2.1: Build organization CRUD**
- Acceptance Criteria:
  - Create organization on first registration
  - Invite team members (email invitation with roles: Owner, Admin, Member)
  - Organization switching (users can belong to multiple orgs)
  - Org-level billing and quotas
  - All resources scoped to organization

---

## Epic 3: Database Schema Design

### Story 3.1: Core Models

**Task 3.1.1: Create Organization model**
- Acceptance Criteria:
  - Fields: id, name, slug, logo, plan, stripeCustomerId, razorpayCustomerId, paypalEmail, preferredGateway, country, currency, tokenBudget, tokenBudgetUsed, createdAt

**Task 3.1.2: Create SaaSProduct model**
- Acceptance Criteria:
  - Fields: id, orgId, name, slug, description, landingPageHtml, landingPageConfig (JSON), chatbotConfig (JSON), brandVoice (JSON), customDomain, isActive, createdAt
  - This is the micro-SaaS product that entrepreneurs build on our platform

**Task 3.1.3: Create ConnectedAccount model (all types)**
- Acceptance Criteria:
  - Fields: id, orgId, connectType (STANDARD/EXPRESS/CUSTOM), stripeAccountId, chargesEnabled, payoutsEnabled, country, currency, onboardingStatus, metadata (JSON), createdAt
  - Supports all three Connect types in one table

### Story 3.2: Payment Models

**Task 3.2.1: Create GatewayTransaction model**
- Acceptance Criteria:
  - Fields: id, orgId, gateway (stripe/razorpay/paypal), gatewayTransactionId, type (one_time/subscription/metered), amount, currency, status, billingModel (subscription/one_time/usage), metadata (JSON), idempotencyKey, createdAt

**Task 3.2.2: Create Subscription model (multi-gateway)**
- Acceptance Criteria:
  - Fields: id, orgId, gateway, gatewaySubscriptionId, plan, status, billingInterval, currentPeriodStart, currentPeriodEnd, createdAt

### Story 3.3: AI & Webhook Models

**Task 3.3.1: Create AIGeneration model**
- Acceptance Criteria:
  - Fields: id, orgId, userId, type (landing_page/marketing_copy/chatbot_response), provider, model, inputTokens, outputTokens, cost, cachedResponse (boolean), prompt (text), response (text), createdAt

**Task 3.3.2: Create WebhookEvent model**
- Acceptance Criteria:
  - Fields: id, source (stripe/razorpay/paypal), eventType, payload (JSON), status (received/processing/processed/failed/forwarded), forwardedTo (URL array), forwardStatus (JSON), retryCount, processedAt, createdAt

**Task 3.3.3: Create APIKey model**
- Acceptance Criteria:
  - Fields: id, orgId, name, keyHash, keyPrefix, scopes, rateLimit, lastUsedAt, isActive, createdAt

---

## Epic 4: Multi-Gateway Payment Integration

### Story 4.1: Payment Gateway Abstraction

**Task 4.1.1: Build unified gateway interface**
- Acceptance Criteria:
  - TypeScript interface: `IPaymentGateway`
  - Methods: createCheckout, createSubscription, cancelSubscription, refund, getInvoices, verifyWebhook
  - Implementations: StripeGateway, RazorpayGateway, PayPalGateway
  - Factory: `GatewayFactory.get(type)` returns appropriate implementation
  - All gateway operations return normalized response types

**Task 4.1.2: Implement StripeGateway**
- Acceptance Criteria:
  - Full Stripe SDK implementation
  - Checkout (one-time + subscription)
  - Subscription management (create, upgrade, downgrade, cancel)
  - Metered billing (usage records)
  - Refunds
  - Invoice retrieval

**Task 4.1.3: Implement RazorpayGateway**
- Acceptance Criteria:
  - Orders API for one-time
  - Subscriptions for recurring
  - Signature verification
  - Refunds
  - Amount conversion (paise)

**Task 4.1.4: Implement PayPalGateway**
- Acceptance Criteria:
  - Orders API for one-time
  - Subscriptions API for recurring
  - OAuth token management
  - Refunds
  - Amount as string

### Story 4.2: Payment Routing Engine

**Task 4.2.1: Build routing logic**
- Acceptance Criteria:
  - NestJS service: `PaymentRouter`
  - Routing rules (configurable by admin):
    - India (INR currency) → Razorpay (preferred for UPI, domestic cards)
    - US/EU (USD/EUR) → Stripe (preferred for cards, Apple Pay)
    - Rest of world → PayPal (widest international coverage)
    - Fallback: if preferred gateway fails, try next
  - User override: user can explicitly choose gateway at checkout
  - Routing decision logged for analytics
  - Code comment: "Payment routing optimizes for: conversion rate (local gateways have higher success), cost (some gateways cheaper for certain regions), and user preference."

**Task 4.2.2: Build unified checkout UI**
- Acceptance Criteria:
  - Single checkout component that adapts to selected gateway
  - Detects user's country (via IP or profile)
  - Suggests best gateway but shows alternatives
  - Stripe: redirect to Checkout or Stripe Elements inline
  - Razorpay: open checkout modal
  - PayPal: render Smart Buttons
  - Consistent experience regardless of gateway

### Story 4.3: Multi-Currency Support

**Task 4.3.1: Implement multi-currency**
- Acceptance Criteria:
  - Prices stored in base currency (USD)
  - Display prices in user's preferred currency
  - Conversion rates from API (or hardcoded for dev)
  - Gateway-specific currency handling:
    - Stripe: supports 135+ currencies
    - Razorpay: primarily INR
    - PayPal: supports 25+ currencies
  - Currency selection in user settings

### Story 4.4: Three Billing Models

**Task 4.4.1: Implement all three billing models**
- Acceptance Criteria:
  - **Subscriptions**: Monthly/Annual plans (Free/Pro/Enterprise) via any gateway
  - **One-time**: Credit top-up purchases via any gateway
  - **Usage-based (Metered)**: Track API usage, report to Stripe as usage records, bill overage
  - All three can coexist: user has a subscription + buys top-up credits + gets billed for overage
  - Unified billing page shows all three

### Story 4.5: Unified Webhook Processing

**Task 4.5.1: Build webhook router**
- Acceptance Criteria:
  - Three webhook endpoints: `/api/webhooks/stripe`, `/api/webhooks/razorpay`, `/api/webhooks/paypal`
  - Each verifies signature using gateway-specific method
  - Raw events stored in WebhookEvent table
  - Events normalized to internal format:
    ```typescript
    interface NormalizedEvent {
      type: 'payment.succeeded' | 'payment.failed' | 'subscription.created' | 'subscription.cancelled' | ...
      gateway: 'stripe' | 'razorpay' | 'paypal'
      data: { amount, currency, customerId, subscriptionId, metadata }
      rawEvent: object
    }
    ```
  - Normalized events processed by unified handler
  - Idempotent processing across all gateways

---

## Epic 5: Stripe Connect — All Three Types

### Story 5.1: Connect Type Selection

**Task 5.1.1: Build Connect type advisor**
- Acceptance Criteria:
  - When platform user wants to receive payments:
  - Show selection wizard explaining three types:
    - **Standard**: "Connect your existing Stripe account" — simplest, least control, users manage their own Stripe
    - **Express**: "We'll set up a payment account for you" — Stripe-hosted onboarding, good balance
    - **Custom**: "Full white-label experience" — we build everything, most control, most work
  - Recommend based on user's needs (questionnaire)
  - Code comment: "In production, most platforms choose ONE Connect type. We implement all three for learning. The decision matrix: Standard (marketplace where sellers already have Stripe), Express (gig economy, delivery), Custom (full white-label, financial platforms)."

### Story 5.2: Standard Connect (Recap from Project 3)

**Task 5.2.1: Implement Standard Connect**
- Acceptance Criteria:
  - OAuth authorization URL generation
  - Callback handler (exchange code for account ID)
  - Account status checking
  - Deauthorization webhook
  - All patterns from Project 3 applied here

### Story 5.3: Express Connect (Recap from Project 4)

**Task 5.3.1: Implement Express Connect**
- Acceptance Criteria:
  - Create Express account
  - Generate Account Links for onboarding
  - Return/Refresh URL handling
  - Account status monitoring
  - Express Dashboard login links
  - All patterns from Project 4 applied here

### Story 5.4: Custom Connect (Recap from Project 6)

**Task 5.4.1: Implement Custom Connect**
- Acceptance Criteria:
  - Create Custom account
  - Business info collection form
  - Representative info form
  - Beneficial owners
  - Identity verification (Stripe Identity)
  - Bank account collection
  - ToS acceptance
  - Requirements monitoring
  - All patterns from Project 6 applied here

### Story 5.5: Unified Connect Management

**Task 5.5.1: Build unified connected accounts dashboard**
- Acceptance Criteria:
  - Admin view: all connected accounts across all types
  - Per-account: type, status, capabilities, country, revenue
  - Unified payment distribution regardless of Connect type:
    - Standard: destination charges with application_fee_amount
    - Express: destination charges or separate charges and transfers
    - Custom: separate charges and transfers (most flexible)
  - Platform fee configurable per account/tier

---

## Epic 6: AI Landing Page Generator

### Story 6.1: Landing Page Generation

**Task 6.1.1: Build landing page generation endpoint (FastAPI)**
- Acceptance Criteria:
  - Endpoint: `POST /ai/landing-page/generate`
  - Accepts: productName, productDescription, targetAudience, features, tone, templateStyle
  - Uses Claude API (good at structured HTML generation) with streaming
  - System prompt generates: hero section, features section, pricing section, CTA, testimonials placeholder, footer
  - Returns: HTML + CSS (Tailwind classes) as streamed response
  - Token tracking and credit deduction

**Task 6.1.2: Build streaming UI for generation**
- Acceptance Criteria:
  - Real-time page building visualization
  - Section by section appears as Claude generates
  - SSE pipeline: FastAPI → NestJS (proxy) → Next.js (EventSource) → UI
  - "Stop generating" button
  - Edit sections after generation
  - Preview in iframe

### Story 6.2: Landing Page Customization

**Task 6.2.1: Build page editor**
- Acceptance Criteria:
  - Visual editor for generated landing pages
  - Edit text in place
  - Change colors/theme
  - Reorder sections
  - Add/remove sections
  - Mobile preview toggle
  - Save as HTML (store in SaaSProduct record)

---

## Epic 7: AI Marketing Copy Generator

### Story 7.1: Multi-Model Copy Generation

**Task 7.1.1: Build copy generation endpoint**
- Acceptance Criteria:
  - Endpoint: `POST /ai/marketing/generate`
  - Accepts: type (email/social/ad/blog), context, brand voice, model selection
  - Supports all three providers: OpenAI, Claude, Groq
  - Generate multiple variants (3 versions for A/B testing)
  - Streaming response
  - Token tracking per variant

---

## Epic 8: AI Chatbot Builder

### Story 8.1: Chatbot Configuration

**Task 8.1.1: Build chatbot config UI**
- Acceptance Criteria:
  - Page to configure chatbot per SaaS product
  - Fields: system prompt, knowledge base (upload docs), tone, allowed topics
  - Widget appearance: colors, position, avatar, greeting message
  - Test chatbot in preview

### Story 8.2: Embeddable Widget

**Task 8.2.1: Build chatbot embed**
- Acceptance Criteria:
  - Generate JavaScript embed snippet: `<script src="https://launchpad.local/widget/{productId}.js"></script>`
  - Widget loads as floating chat button
  - Opens chat interface on click
  - Sends queries to our AI endpoint (authenticated via product API key)
  - RAG-based responses from knowledge base
  - Conversation persistence per session

### Story 8.3: Chatbot Analytics

**Task 8.3.1: Build chatbot analytics**
- Acceptance Criteria:
  - Track: total conversations, messages, common questions, satisfaction
  - Dashboard per chatbot/product
  - Export conversation logs

---

## Epic 9: LLM Orchestration Layer (FastAPI)

### Story 9.1: Provider Abstraction

**Task 9.1.1: Build provider system**
- Acceptance Criteria:
  - Same pattern as Project 5 but production-hardened
  - Providers: OpenAI, Anthropic, Groq
  - Each provider: generate, stream, count_tokens, get_cost
  - Provider health checks

### Story 9.2: Fallback Chains

**Task 9.2.1: Build fallback logic**
- Acceptance Criteria:
  - Configurable chain: primary → secondary → tertiary
  - Auto-failover on: timeout (10s), rate limit (429), server error (500+), connection error
  - Circuit breaker per provider:
    - Track failures in Redis
    - After 5 consecutive failures: mark provider as "open" (skip for 60s)
    - After 60s: "half-open" (try one request)
    - If succeeds: "closed" (back to normal)
  - Log which provider served each request
  - Code comment: "Circuit breaker prevents wasting time on a known-dead provider. Instead of waiting for timeout on every request, we skip it and go to fallback immediately."

### Story 9.3: Response Caching

**Task 9.3.1: Build Redis response cache**
- Acceptance Criteria:
  - Cache key: hash of (prompt + model + temperature + max_tokens)
  - TTL: configurable per use case (landing page: 1 hour, marketing copy: 30 min, chatbot: no cache)
  - Cache hit: return cached response immediately (no AI API call, no token cost)
  - Cache miss: call AI, cache response, return
  - Cache metrics: hit rate, miss rate, saved tokens/cost
  - Invalidation: manual flush per user, per model, or global
  - Code comment: "If 100 users ask for 'SaaS landing page for CRM tool', there's no need to call GPT-4 100 times. Cache the response and serve instantly."

### Story 9.4: Token Budget Management

**Task 9.4.1: Build budget system**
- Acceptance Criteria:
  - Per-user monthly token budget (based on plan)
  - Per-organization budget (aggregate of member budgets)
  - Real-time budget tracking in Redis (fast reads)
  - Periodic sync to PostgreSQL (durability)
  - Budget check before every AI request
  - Budget alerts at 80%, 90%, 100%
  - Hard limit: reject requests when budget exceeded
  - Admin override: grant bonus budget

### Story 9.5: Streaming Across Services

**Task 9.5.1: Build SSE pipeline**
- Acceptance Criteria:
  - FastAPI: generates SSE stream from LLM provider
  - NestJS proxy: passes SSE stream through without buffering
  - Next.js: EventSource connects to NestJS, renders tokens in real-time
  - Token counting happens during streaming (accumulate as chunks arrive)
  - Handle: client disconnect (stop generation), provider error mid-stream
  - Code comment: "Streaming across three services: LLM API → FastAPI (SSE) → NestJS (passthrough proxy) → Browser (EventSource). Each hop must not buffer — stream each chunk immediately."

### Story 9.6: Request Queue

**Task 9.6.1: Build Redis-based job queue**
- Acceptance Criteria:
  - BullMQ (Node.js) or RQ (Python) for background jobs
  - Use cases: landing page generation (heavy), bulk marketing copy, chatbot training
  - Priority queues: Enterprise > Pro > Free
  - Job status tracking (queued → processing → completed → failed)
  - Frontend polls for job status
  - Retry failed jobs (3 retries with backoff)

---

## Epic 10: Webhook Management System

### Story 10.1: Incoming Webhooks

**Task 10.1.1: Build webhook receivers**
- Acceptance Criteria:
  - Three endpoints (Stripe, Razorpay, PayPal) as defined in Epic 4
  - Raw event storage in WebhookEvent table
  - Signature verification per gateway
  - Event normalization
  - Processing pipeline

### Story 10.2: Outgoing Webhooks (Forward to Users)

**Task 10.2.1: Build webhook forwarding system**
- Acceptance Criteria:
  - Platform users can register webhook URLs: `POST /api/webhooks/register { url, events: ['payment.succeeded', 'subscription.created'] }`
  - When internal event occurs: forward normalized event to registered URLs
  - Signing: sign outgoing webhooks with HMAC-SHA256 (each user gets a webhook secret)
  - Retry: if destination returns non-2xx, retry with exponential backoff (1s, 5s, 30s, 5m, 1h)
  - Max retries: 5
  - Webhook logs: full request/response per delivery attempt
  - Code comment: "This is how platforms like Stripe work. We're building the same pattern — our platform users get notified of events via webhooks they configure."

**Task 10.2.2: Build webhook management UI**
- Acceptance Criteria:
  - Page at `/dashboard/settings/webhooks`
  - Add webhook URL with event selection
  - Display webhook secret (show once, like API keys)
  - Test webhook (send sample event)
  - Webhook delivery logs (per endpoint)
  - Replay failed webhooks
  - Disable/delete webhooks

---

## Epic 11: API System

### Story 11.1: RESTful API

**Task 11.1.1: Build versioned API**
- Acceptance Criteria:
  - API versioned: `/api/v1/`
  - Endpoints: products, landing-pages, marketing-copy, chatbot, usage, billing
  - JSON:API or similar response format
  - Pagination, filtering, sorting on list endpoints
  - Rate limiting per API key (Redis)

### Story 11.2: API Key Management

**Task 11.2.1: Build API key system**
- Acceptance Criteria:
  - Same pattern as Project 5: generate, hash, store, authenticate
  - Scopes: read, write, ai_generate, billing
  - Rate limits per plan: Free (60/min), Pro (300/min), Enterprise (1000/min)
  - Usage tracking per key
  - Key rotation (generate new, deprecate old with grace period)

### Story 11.3: API Documentation

**Task 11.3.1: Build API docs**
- Acceptance Criteria:
  - Interactive API documentation page
  - Auto-generated from NestJS Swagger decorators
  - Code examples in curl, Python, JavaScript, Go
  - Authentication section
  - Webhook integration guide
  - Rate limiting documentation

---

## Epic 12: Admin Super-Dashboard

### Story 12.1: Platform Analytics

**Task 12.1.1: Build admin dashboard**
- Acceptance Criteria:
  - Total users, organizations, products
  - Revenue: total, by gateway (Stripe/Razorpay/PayPal), by billing model (subscription/one-time/metered)
  - AI usage: total tokens, cost, by provider, by feature (landing page/copy/chatbot)
  - Cache performance: hit rate, savings
  - API usage: requests per day, by endpoint
  - Webhook delivery: success rate, failures

### Story 12.2: Management

**Task 12.2.1: Build admin management pages**
- Acceptance Criteria:
  - User/Org management
  - Connected accounts (all types, all statuses)
  - Payment transactions (all gateways)
  - AI generation logs
  - Webhook event logs (incoming + outgoing)
  - API key overview
  - System health (all services)
  - Audit logs

---

## Epic 13: Security & Compliance

### Story 13.1: Multi-Service Security

**Task 13.1.1: Implement security across services**
- Acceptance Criteria:
  - NestJS: Helmet, CORS, ThrottlerModule (Redis-backed), class-validator
  - FastAPI: CORS middleware, Pydantic validation, rate limiting
  - Inter-service: JWT verification, service-to-service auth tokens
  - No sensitive data in logs (redaction across both services)
  - CSP allows all payment gateway scripts
  - Webhook signature verification for all three gateways

### Story 13.2: GDPR

**Task 13.2.1: Implement compliance**
- Acceptance Criteria:
  - Data export (across all services and databases)
  - Account deletion (cascade across all tables, both services)
  - Consent tracking
  - Privacy policy covering all data flows (three gateways, three AI providers)
  - Data processing records

### Story 13.3: Audit Logging

**Task 13.3.1: Comprehensive cross-service audit logging**
- Acceptance Criteria:
  - All financial events logged (all three gateways)
  - All Connect events logged (all three types)
  - All AI operations logged
  - All API key operations logged
  - All webhook events logged
  - Correlation IDs link audit entries across services

---

## Epic 14: Error Handling & Resilience

### Story 14.1: Circuit Breakers

**Task 14.1.1: Implement circuit breakers**
- Acceptance Criteria:
  - Circuit breaker for: each AI provider, each payment gateway, FastAPI service
  - States: CLOSED (normal) → OPEN (failing, skip) → HALF_OPEN (testing recovery)
  - Implementation: Redis-backed failure counters
  - Fallback responses when circuit is open:
    - AI provider: try next in chain
    - Payment gateway: show "temporarily unavailable, try another method"
    - FastAPI: return cached response or 503

### Story 14.2: Graceful Degradation

**Task 14.2.1: Implement degradation strategies**
- Acceptance Criteria:
  - If AI service is down: payment flows still work
  - If one payment gateway is down: others still work
  - If Redis is down: fall back to in-memory (degraded, not dead)
  - Health check endpoint reports overall status and per-service status
  - Admin alerted on any service degradation

---

## Epic 15: Testing

### Story 15.1: Unit Tests

**Task 15.1.1: Test payment routing logic**
- Acceptance Criteria:
  - Test routing decisions based on country/currency
  - Test gateway abstraction (each gateway's methods)
  - Test unified webhook normalization
  - Test credit/billing calculations

**Task 15.1.2: Test LLM orchestration**
- Acceptance Criteria:
  - Test fallback chain (mock provider failures)
  - Test circuit breaker (state transitions)
  - Test response caching (hit/miss)
  - Test token budget enforcement
  - Test streaming pipeline

### Story 15.2: Integration Tests

**Task 15.2.1: Test cross-service flows**
- Acceptance Criteria:
  - Test NestJS → FastAPI proxy (AI generation)
  - Test payment flow with each gateway (mock gateways)
  - Test Connect onboarding (all three types, mock Stripe)
  - Test webhook receive → process → forward chain

### Story 15.3: E2E Tests

**Task 15.3.1: Full platform flow**
- Acceptance Criteria:
  - Register → Create org → Connect Stripe → Create product → Generate landing page → Set up chatbot → Configure billing → Purchase credits → Generate marketing copy
  - Uses test modes for all gateways

---

## Epic 16: UI/UX

### Story 16.1: Design & Layout

**Task 16.1.1: Build responsive UI**
- Acceptance Criteria:
  - Dashboard with multiple views: overview, products, AI tools, billing, settings, API
  - Real-time streaming for AI generation
  - Multi-gateway checkout flow
  - Connect onboarding wizards (three variants)
  - Webhook management UI
  - API docs page
  - Dark mode
  - Responsive design
  - Loading states throughout

---

## Production Checklist

### Multi-Service
- [ ] Docker Compose runs all services
- [ ] Inter-service communication works
- [ ] JWT propagation across services
- [ ] Correlation IDs in all logs
- [ ] Health checks for all services
- [ ] Graceful degradation when a service is down

### Payment Routing
- [ ] All three gateways work (Stripe, Razorpay, PayPal)
- [ ] Routing engine selects correct gateway
- [ ] User can override gateway selection
- [ ] All three billing models work (subscription, one-time, metered)
- [ ] Multi-currency pricing displayed correctly
- [ ] Unified webhook processing for all gateways
- [ ] Webhook signature verification for all gateways

### Stripe Connect
- [ ] Standard Connect OAuth flow works
- [ ] Express Connect Account Links work
- [ ] Custom Connect full onboarding works
- [ ] All account types monitored via webhooks
- [ ] Payment distribution works for all Connect types
- [ ] Platform fees calculated correctly
- [ ] Payout schedules configurable

### LLM Orchestration
- [ ] All three providers work (OpenAI, Claude, Groq)
- [ ] Fallback chains activate on failure
- [ ] Circuit breakers prevent cascading failures
- [ ] Response caching reduces costs and latency
- [ ] Token budgets enforced per user/org
- [ ] Cost tracking accurate across providers
- [ ] Streaming works across service boundaries
- [ ] Job queue processes heavy operations asynchronously

### Webhooks
- [ ] Incoming webhooks verified and processed
- [ ] Outgoing webhooks signed with HMAC
- [ ] Retry logic with exponential backoff
- [ ] Webhook logs viewable and searchable
- [ ] Failed webhooks can be replayed
- [ ] Test webhook functionality works

### API
- [ ] Versioned API endpoints
- [ ] API key authentication works
- [ ] Rate limiting enforced per key/plan
- [ ] Usage tracking per key
- [ ] API documentation auto-generated and accurate

### Security
- [ ] All gateways: signature verification
- [ ] All services: input validation
- [ ] All services: rate limiting
- [ ] CORS properly configured
- [ ] Security headers on all responses
- [ ] No sensitive data in logs
- [ ] GDPR: consent, export, deletion
- [ ] Audit logging comprehensive and cross-service
