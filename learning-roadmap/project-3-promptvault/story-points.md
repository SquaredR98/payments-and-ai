# Project 3: PromptVault — AI Prompt Marketplace

## Project Overview

**What it is:** A marketplace where users sell and buy AI prompts. Sellers connect their Stripe accounts via Standard Connect (OAuth flow), buyers purchase prompts, and the platform takes a commission. Buyers can preview prompts using OpenAI before purchasing. Think Gumroad meets PromptBase.

**Tech Stack:**
- **Backend/CMS:** Sanity (cloud-hosted headless CMS, GROQ query language, Sanity Studio, real-time)
- **Frontend:** Next.js 14+ (App Router)
- **Authentication:** NextAuth.js (Credentials + GitHub + Google)
- **Database:** Sanity as primary content store + PostgreSQL (via Prisma) for transactional data (payments, connected accounts)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe Connect Standard (OAuth), Stripe Checkout with Application Fees
- **AI:** OpenAI API (GPT-4, text completions for prompt preview)
- **Deployment:** Local development only

**Why this architecture:** Sanity handles content (prompts, categories, reviews) beautifully with its real-time Studio and GROQ. But financial/transactional data (payments, connected accounts, audit logs) belongs in a relational database — hence PostgreSQL via Prisma for those concerns. This is a common production pattern: CMS for content, SQL for transactions.

**What You Will Learn:**
1. Sanity fundamentals — schemas, GROQ queries, Sanity Studio, real-time updates, image handling
2. NextAuth.js — multi-provider auth (credentials, GitHub, Google), session management, callbacks
3. Stripe Connect Standard — OAuth flow, account linking, connected account management
4. Application fees — platform commission on connected account payments
5. Destination charges — payment flows through platform to connected accounts
6. OpenAI API basics — chat completions, token counting, rate limiting
7. API key management — secure storage, server-side usage only
8. Marketplace architecture — seller onboarding, buyer experience, platform economics

---

## Feature List Summary

1. Sanity project setup with custom schemas and Studio
2. PostgreSQL setup for transactional data (Prisma)
3. NextAuth.js authentication (Credentials + GitHub + Google)
4. Role-based access (Buyer, Seller, Admin)
5. Seller onboarding via Stripe Connect Standard (OAuth)
6. Connected account status management and monitoring
7. Prompt listing CRUD (create, edit, publish, archive)
8. Prompt categories and tagging system
9. Prompt discovery (search, filters, sort)
10. Prompt detail page with preview content
11. Purchase flow (Stripe Checkout with application fees / destination charges)
12. Webhook handling for payment and connect events
13. Buyer prompt library (purchased prompts with full content access)
14. AI prompt preview feature (OpenAI integration with token tracking)
15. Rate limiting for AI preview (free vs registered limits)
16. Reviews and ratings system
17. Seller dashboard (earnings, sales analytics)
18. Admin panel (moderation, revenue, connected accounts)
19. Email notifications (purchase, sale, account events)
20. PDF receipt generation
21. Security (CSP, CORS, rate limiting, input validation)
22. GDPR compliance
23. PCI-DSS awareness
24. Audit logging for financial events
25. Testing
26. Responsive UI with dark mode and SEO

---

## Epic 1: Project Setup & Configuration

### Story 1.1: Initialize Sanity Project

**Task 1.1.1: Create Sanity project**
- Acceptance Criteria:
  - Sanity project created via `npm create sanity@latest`
  - Sanity Studio embedded in Next.js app (at `/studio` route)
  - Project ID and dataset configured in environment variables
  - Sanity Studio accessible and functional locally

**Task 1.1.2: Configure Sanity client**
- Acceptance Criteria:
  - `@sanity/client` configured in `src/lib/sanity.ts`
  - Read client (CDN, for public queries) and Write client (API, for mutations) created
  - GROQ query helper functions created
  - Image URL builder configured (`@sanity/image-url`)
  - Token-based authentication for write operations

**Task 1.1.3: Configure Sanity Studio**
- Acceptance Criteria:
  - Studio customized with project branding (logo, title)
  - Document actions customized (publish, unpublish, delete)
  - Preview panes configured for prompt content
  - Structure builder configured for organized navigation

### Story 1.2: Initialize PostgreSQL + Prisma

**Task 1.2.1: Setup Prisma for transactional data**
- Acceptance Criteria:
  - Prisma installed with PostgreSQL provider
  - Models defined for: ConnectedAccount, Payment, AuditLog, UsageTracking
  - Database connection string in `.env`
  - Prisma Client generated
  - Initial migration run

**Task 1.2.2: Document the dual-database architecture**
- Acceptance Criteria:
  - Code comments explaining: "Sanity = content (prompts, reviews, categories), PostgreSQL = transactions (payments, connected accounts, audit logs)"
  - Clear separation in code: `src/lib/sanity.ts` for content, `src/lib/prisma.ts` for transactions
  - README section explaining the pattern

### Story 1.3: Configure Next.js Project

**Task 1.3.1: Setup Next.js with App Router**
- Acceptance Criteria:
  - Next.js 14+ with App Router
  - TypeScript strict mode
  - Tailwind CSS + shadcn/ui configured
  - Environment variables: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN, DATABASE_URL, STRIPE keys, OPENAI_API_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL

**Task 1.3.2: Configure environment validation**
- Acceptance Criteria:
  - Zod schema validates all env vars at startup
  - Missing variables cause immediate startup failure with clear error message
  - `.env.example` with all required variables documented

---

## Epic 2: Authentication (NextAuth.js)

### Story 2.1: Configure NextAuth.js

**Task 2.1.1: Setup NextAuth with multiple providers**
- Acceptance Criteria:
  - NextAuth configured in `app/api/auth/[...nextauth]/route.ts`
  - Providers: Credentials (email/password), GitHub OAuth, Google OAuth
  - Session strategy: JWT
  - Custom pages: `/login`, `/register` (not NextAuth default pages)

**Task 2.1.2: Configure Credentials provider**
- Acceptance Criteria:
  - Users stored in Sanity (User document type) with hashed passwords (bcrypt)
  - Login validates email + password against Sanity user document
  - Returns user object with: id, email, name, role, image

**Task 2.1.3: Configure GitHub OAuth provider**
- Acceptance Criteria:
  - GitHub OAuth app created
  - Client ID and Secret in env vars
  - On first login: creates user in Sanity with GitHub profile data
  - On subsequent logins: links to existing user (matched by email)

**Task 2.1.4: Configure Google OAuth provider**
- Acceptance Criteria:
  - Google Cloud OAuth configured
  - Client ID and Secret in env vars
  - Same create/link behavior as GitHub

**Task 2.1.5: Configure NextAuth callbacks**
- Acceptance Criteria:
  - `jwt` callback: include userId, role, stripeConnectedAccountId in token
  - `session` callback: expose userId, role, stripeConnectedAccountId in session
  - `signIn` callback: block unverified email accounts (for credentials provider)

### Story 2.2: User Registration

**Task 2.2.1: Build registration page and API**
- Acceptance Criteria:
  - Page at `/register`
  - Fields: name, email, password, confirm password
  - Role selection: "I want to buy prompts" (buyer) / "I want to sell prompts" (seller) / "Both"
  - Server action or API route: validates input, hashes password, creates user in Sanity
  - Sends verification email
  - Auto-login after registration

**Task 2.2.2: Handle OAuth registration edge cases**
- Acceptance Criteria:
  - If user registers with email/password, then tries Google OAuth with same email: link accounts
  - If user registers with GitHub, then tries Google with same email: link accounts
  - Conflict detection and resolution logic in signIn callback

### Story 2.3: Session & Route Protection

**Task 2.3.1: Create auth middleware**
- Acceptance Criteria:
  - Next.js middleware protects `/dashboard/*`, `/studio/*` routes
  - Unauthenticated users redirected to `/login?callbackUrl=...`
  - Seller-only routes (e.g., `/dashboard/seller/*`) check role
  - Admin routes check admin role

**Task 2.3.2: Create useSession hook wrapper**
- Acceptance Criteria:
  - Custom `useAuth()` hook wraps NextAuth's `useSession()`
  - Returns: user, isAuthenticated, isSeller, isAdmin, isLoading
  - Convenience methods: hasPurchased(promptId), isConnectedToStripe

### Story 2.4: User Profile Management

**Task 2.4.1: Build profile page**
- Acceptance Criteria:
  - Page at `/dashboard/settings/profile`
  - Edit: name, bio, avatar (upload to Sanity), website URL, social links
  - Seller-specific: display name, about section, specializations
  - Save with loading state and success toast

---

## Epic 3: Database Schema Design

### Story 3.1: Sanity Content Schemas

**Task 3.1.1: Create User schema in Sanity**
- Acceptance Criteria:
  - Document type: `user`
  - Fields: name, email, hashedPassword (hidden from Studio), role (buyer/seller/admin), avatar (image), bio, website, socialLinks, emailVerified (boolean), createdAt
  - Access: read by all authenticated users (public profile), write by owner only

**Task 3.1.2: Create Prompt schema in Sanity**
- Acceptance Criteria:
  - Document type: `prompt`
  - Fields:
    - `title` (string, required, max 100)
    - `slug` (slug, generated from title)
    - `description` (text, what the prompt does)
    - `previewContent` (text — shown to all users, teaser)
    - `fullContent` (text — the actual prompt, hidden until purchased)
    - `category` (reference to Category)
    - `tags` (array of strings)
    - `price` (number, in dollars, min 0.99)
    - `currency` (string, default USD)
    - `seller` (reference to User)
    - `images` (array of images — screenshots of prompt output)
    - `aiModel` (string — "GPT-4", "Claude", "DALL-E", "Midjourney", etc.)
    - `status` (string: draft, published, archived, rejected)
    - `totalSales` (number, denormalized for performance)
    - `averageRating` (number, denormalized)
    - `reviewCount` (number, denormalized)
    - `createdAt`, `updatedAt`

**Task 3.1.3: Create Category schema in Sanity**
- Acceptance Criteria:
  - Document type: `category`
  - Fields: name, slug, description, icon (image), parentCategory (self-reference for subcategories), sortOrder
  - Seed categories: Writing, Coding, Marketing, Design, Business, Education, Fun/Creative

**Task 3.1.4: Create Review schema in Sanity**
- Acceptance Criteria:
  - Document type: `review`
  - Fields: prompt (reference), reviewer (reference to User), rating (1-5), title, body, createdAt
  - Validation: only one review per user per prompt
  - Access: readable by all, writable by authenticated users who purchased the prompt

### Story 3.2: Prisma Transactional Schemas

**Task 3.2.1: Create ConnectedAccount model**
- Acceptance Criteria:
  - Model: ConnectedAccount
  - Fields: id, userId (unique — Sanity user ID), stripeAccountId, chargesEnabled, payoutsEnabled, detailsSubmitted, country, defaultCurrency, businessType, createdAt, updatedAt
  - Indexed on: userId, stripeAccountId

**Task 3.2.2: Create Payment model**
- Acceptance Criteria:
  - Model: Payment
  - Fields: id, buyerId, sellerId, promptId (Sanity ID), stripeSessionId, stripePaymentIntentId, amount, platformFee, sellerAmount, currency, status (pending/succeeded/failed/refunded), idempotencyKey (unique), paidAt, refundedAt, metadata (JSON)
  - Indexed on: stripeSessionId, stripePaymentIntentId, buyerId, sellerId, idempotencyKey

**Task 3.2.3: Create AuditLog model**
- Acceptance Criteria:
  - Model: AuditLog
  - Fields: id, action, entity, entityId, userId, ipAddress, details (JSON), createdAt
  - Append-only (no update/delete operations exposed)

**Task 3.2.4: Create UsageTracking model**
- Acceptance Criteria:
  - Model: UsageTracking
  - Fields: id, userId, action (enum: ai_preview), tokensUsed, model, cost (decimal), createdAt
  - Tracks AI API usage per user for rate limiting and cost tracking

---

## Epic 4: Seller Onboarding (Stripe Connect Standard)

### Story 4.1: Stripe Connect Platform Configuration

**Task 4.1.1: Register as Stripe Connect platform**
- Acceptance Criteria:
  - Stripe Dashboard: enable Connect (platform settings)
  - Configure: platform name, icon, brand color
  - Set: redirect URI for OAuth (`{APP_URL}/api/stripe/connect/callback`)
  - Note client_id (different from API key — this is the Connect platform client ID)
  - Store `STRIPE_CONNECT_CLIENT_ID` in env

**Task 4.1.2: Understand Standard Connect flow**
- Acceptance Criteria:
  - Documentation comment explaining:
    1. Seller clicks "Connect Stripe Account"
    2. Redirected to Stripe's OAuth page (Stripe-hosted)
    3. Seller logs in or creates Stripe account on Stripe's site
    4. Stripe redirects back to our callback URL with authorization code
    5. We exchange code for connected account ID
    6. We can now create charges on behalf of this seller

### Story 4.2: OAuth Authorization Flow

**Task 4.2.1: Build Connect authorization endpoint**
- Acceptance Criteria:
  - API route: `GET /api/stripe/connect/authorize`
  - Generates Stripe OAuth URL: `https://connect.stripe.com/oauth/authorize`
  - Parameters: `client_id`, `scope: read_write`, `response_type: code`, `redirect_uri`, `state` (CSRF token)
  - State parameter stored in session for verification on callback
  - Returns redirect URL
  - Only accessible by authenticated sellers

**Task 4.2.2: Build Connect callback endpoint**
- Acceptance Criteria:
  - API route: `GET /api/stripe/connect/callback`
  - Receives: `code` and `state` from Stripe
  - Verifies `state` matches session (CSRF protection)
  - Exchanges code for connected account ID via `stripe.oauth.token({ code })`
  - Receives: `stripe_user_id` (the connected account ID), `access_token`, `refresh_token`
  - Creates ConnectedAccount record in PostgreSQL
  - Fetches account details from Stripe to check capabilities
  - Redirects seller to dashboard with success message

**Task 4.2.3: Handle OAuth errors**
- Acceptance Criteria:
  - Handle: `access_denied` (seller declined), `invalid_client` (bad client_id), `unsupported_response_type`
  - Display appropriate error message to seller
  - Log error for debugging
  - Redirect to seller dashboard with error state

### Story 4.3: Connected Account Management

**Task 4.3.1: Check account capabilities**
- Acceptance Criteria:
  - After OAuth callback: fetch `stripe.accounts.retrieve(connectedAccountId)`
  - Check `charges_enabled` and `payouts_enabled`
  - If both true: seller is fully onboarded
  - If not: seller needs to complete additional steps on Stripe Dashboard
  - Store capabilities in ConnectedAccount record
  - Link to Stripe Express Dashboard for sellers to manage their account

**Task 4.3.2: Build seller onboarding status UI**
- Acceptance Criteria:
  - Seller dashboard shows: "Stripe Account Connected" with status badge
  - Green: fully verified (charges + payouts enabled)
  - Yellow: partially verified (needs more info)
  - Red: not connected
  - "Connect Stripe Account" button for unconnected sellers
  - "View Stripe Dashboard" link for connected sellers
  - Account country and currency displayed

### Story 4.4: Handle Account Deauthorization

**Task 4.4.1: Build deauthorization webhook handler**
- Acceptance Criteria:
  - Webhook event: `account.application.deauthorized`
  - When seller disconnects our platform from their Stripe account
  - Update ConnectedAccount: clear stripeAccountId, set status to disconnected
  - Seller's prompts remain listed but marked as "payment unavailable"
  - Email notification to seller about disconnection
  - Log audit event

**Task 4.4.2: Build manual disconnect flow**
- Acceptance Criteria:
  - "Disconnect Stripe" button in seller settings
  - Confirmation dialog: "Buyers won't be able to purchase your prompts. Are you sure?"
  - Calls `stripe.oauth.deauthorize({ stripe_user_id: connectedAccountId })`
  - Updates local records
  - Prompts marked as payment unavailable

---

## Epic 5: Prompt Listing Management (Seller Side)

### Story 5.1: Create Prompt

**Task 5.1.1: Build prompt creation form**
- Acceptance Criteria:
  - Page at `/dashboard/seller/prompts/new`
  - Fields: title, description (rich text), preview content, full content (hidden from buyers), category (dropdown from Sanity), tags (multi-input), price (number with currency), AI model (dropdown), images (upload up to 5)
  - Form validation with Zod
  - Auto-save as draft every 30 seconds
  - Preview tab shows how the prompt will look to buyers

**Task 5.1.2: Handle prompt content separation**
- Acceptance Criteria:
  - `previewContent`: visible to all (used for browsing and AI preview feature)
  - `fullContent`: visible only to seller and buyers who purchased
  - GROQ queries enforce this separation (never return fullContent in public queries)
  - API routes also enforce: check purchase record before returning fullContent

**Task 5.1.3: Implement image upload**
- Acceptance Criteria:
  - Images uploaded to Sanity's asset pipeline
  - Image validation: max 5MB per image, jpg/png/webp only
  - Image optimization via Sanity's image CDN (automatic resizing)
  - Drag and drop upload area
  - Image preview and reorder

### Story 5.2: Edit & Manage Prompts

**Task 5.2.1: Build prompt edit page**
- Acceptance Criteria:
  - Page at `/dashboard/seller/prompts/[id]/edit`
  - Pre-populated with existing data
  - Only accessible by prompt owner
  - Save updates to Sanity
  - Version note: buyers who already purchased get the updated content

**Task 5.2.2: Build prompt list for sellers**
- Acceptance Criteria:
  - Page at `/dashboard/seller/prompts`
  - Table: title, status, price, sales count, average rating, actions
  - Actions: edit, publish/unpublish, archive, duplicate
  - Filter by status, sort by date/sales/rating

**Task 5.2.3: Implement prompt status management**
- Acceptance Criteria:
  - Draft: only visible to seller
  - Published: visible to all buyers
  - Archived: hidden from marketplace but buyers retain access
  - Rejected: hidden, with admin feedback shown to seller
  - Status transitions validated (can't publish without all required fields)

---

## Epic 6: Prompt Discovery & Browsing (Buyer Side)

### Story 6.1: Marketplace Catalog

**Task 6.1.1: Build marketplace page**
- Acceptance Criteria:
  - Page at `/marketplace` (or homepage)
  - Grid of prompt cards
  - Each card: title, preview image, price, seller name, rating, category badge
  - Infinite scroll or pagination (GROQ supports pagination via slicing)
  - GROQ query fetches: title, slug, previewContent, price, seller->{name, avatar}, category->{name}, averageRating, totalSales

**Task 6.1.2: Build category browsing**
- Acceptance Criteria:
  - Category sidebar or top navigation
  - Clicking category filters prompt list
  - URL updates with category: `/marketplace?category=coding`
  - Category page shows description and prompt count

### Story 6.2: Search & Filters

**Task 6.2.1: Implement search**
- Acceptance Criteria:
  - Search bar at top of marketplace
  - Searches: title, description, tags
  - GROQ text search: `*[_type == "prompt" && (title match $query || description match $query)]`
  - Debounced search (300ms delay)
  - Search results highlighted

**Task 6.2.2: Implement filters**
- Acceptance Criteria:
  - Filter by: category, price range (min/max slider), rating (minimum stars), AI model, date (newest/oldest)
  - Sort by: popular (totalSales), newest, highest rated, price low-high, price high-low
  - Filters reflected in URL query params
  - Clear all filters button
  - Active filter count badge

### Story 6.3: Prompt Detail Page

**Task 6.3.1: Build prompt detail page**
- Acceptance Criteria:
  - Page at `/marketplace/[slug]`
  - Shows: title, description, preview content, images (gallery), price, seller info, category, tags, AI model
  - "Buy Now" button (if not purchased)
  - "Try with AI" button (preview feature, Epic 8)
  - If already purchased: show full content with "Copy to Clipboard" button
  - Reviews section below
  - Related prompts sidebar
  - SEO: meta tags, Open Graph, structured data (JSON-LD)

**Task 6.3.2: Build seller profile page**
- Acceptance Criteria:
  - Page at `/sellers/[slug]`
  - Shows: name, avatar, bio, join date, total sales, average rating, total prompts
  - List of all published prompts by this seller
  - Review summary

---

## Epic 7: Purchase Flow (Stripe Checkout with Application Fees)

### Story 7.1: Create Checkout Session with Connected Account

**Task 7.1.1: Build purchase endpoint**
- Acceptance Criteria:
  - API route: `POST /api/payments/create-checkout`
  - Accepts: promptId
  - Validates: user is authenticated, prompt exists, user hasn't already purchased, prompt is published, seller has active connected account
  - Retrieves seller's connected account ID from PostgreSQL
  - Creates Stripe Checkout Session with:
    - `mode: 'payment'`
    - `line_items`: [{ price_data: { currency, unit_amount (cents), product_data: { name, description } }, quantity: 1 }]
    - `payment_intent_data`:
      - `application_fee_amount`: calculated platform commission (e.g., 20% of price)
      - `transfer_data`: `{ destination: connectedAccountId }` (destination charges)
      - `metadata`: { buyerId, sellerId, promptId }
    - `success_url`, `cancel_url`
    - `metadata`: { buyerId, sellerId, promptId }
    - `customer_email`: buyer's email
  - Returns: `{ sessionUrl }`

**Task 7.1.2: Understand destination charges vs direct charges**
- Acceptance Criteria:
  - Code comments explaining:
    - **Destination charges**: Platform creates the charge, Stripe automatically transfers to connected account minus application fee. Platform is the merchant of record. Simpler.
    - **Direct charges**: Charge created directly on connected account, platform takes application fee. Connected account is merchant of record.
    - **Separate charges and transfers**: Platform charges customer, then manually transfers to connected account. Most flexible but most complex.
  - We use destination charges for this project (simplest for marketplace)

**Task 7.1.3: Calculate platform commission**
- Acceptance Criteria:
  - Platform fee percentage configurable (env var or admin setting, default 20%)
  - Fee calculation: `Math.round(price * feePercentage / 100)` (in cents)
  - Minimum fee: $0.50 (Stripe's minimum application fee)
  - Fee amount stored in Payment record for reconciliation
  - Seller sees: net amount after platform fee in their dashboard

### Story 7.2: Handle Purchase Success

**Task 7.2.1: Build purchase success page**
- Acceptance Criteria:
  - Page at `/marketplace/[slug]/success?session_id=xxx`
  - Verifies session is completed via Stripe API
  - Shows: "Purchase Successful!", prompt title, amount, "Go to Library" button
  - Does NOT grant access here — webhook is the source of truth

### Story 7.3: Webhook: checkout.session.completed

**Task 7.3.1: Process purchase webhook**
- Acceptance Criteria:
  - Extract: buyerId, sellerId, promptId from session metadata
  - Idempotency check (already processed this session?)
  - Create Payment record in PostgreSQL (buyerId, sellerId, promptId, amount, platformFee, sellerAmount, status: succeeded)
  - Grant buyer access to prompt fullContent:
    - Create a "purchase" document in Sanity linking buyer to prompt
    - OR track purchases in PostgreSQL (simpler for transactional data)
  - Update prompt's totalSales count in Sanity (increment)
  - Log audit event
  - Send email: purchase confirmation to buyer, sale notification to seller

**Task 7.3.2: Handle connected account not found**
- Acceptance Criteria:
  - If seller's connected account was deauthorized between checkout creation and completion
  - Log error with full context
  - Refund the payment (platform can't transfer to disconnected account)
  - Notify both buyer (refund) and seller (account issue)
  - This is an edge case but must be handled

### Story 7.4: Refund Flow

**Task 7.4.1: Build refund endpoint**
- Acceptance Criteria:
  - API route: `POST /api/payments/refund`
  - Admin-only action (buyers request, admin approves)
  - Creates Stripe Refund: `stripe.refunds.create({ payment_intent, reverse_transfer: true, refund_application_fee: true })`
  - `reverse_transfer: true` — claws back the transfer from connected account
  - `refund_application_fee: true` — refunds the platform fee too
  - Updates Payment record status to "refunded"
  - Revokes buyer's access to prompt fullContent
  - Log audit event

### Story 7.5: Handle Disputes/Chargebacks

**Task 7.5.1: Build dispute webhook handler**
- Acceptance Criteria:
  - Handle `charge.dispute.created` event
  - Log dispute with all details
  - Notify admin
  - Notify seller
  - Track dispute status updates
  - Understand: with destination charges, the platform is the merchant of record and handles disputes

---

## Epic 8: AI Prompt Preview Feature (OpenAI Integration)

### Story 8.1: OpenAI API Setup

**Task 8.1.1: Configure OpenAI client**
- Acceptance Criteria:
  - `openai` npm package installed
  - OpenAI client singleton in `src/lib/openai.ts`
  - API key in `OPENAI_API_KEY` env var
  - Key NEVER exposed to client (all API calls server-side)
  - Model selection configurable (default: gpt-3.5-turbo for previews, cost-effective)

**Task 8.1.2: Understand API key security**
- Acceptance Criteria:
  - Code comment explaining: "OpenAI API key = money. If leaked, anyone can make API calls billed to you."
  - Key only used in server-side API routes (never in client components)
  - Key not logged in any log output
  - Key not included in error responses

### Story 8.2: Prompt Preview Endpoint

**Task 8.2.1: Build AI preview endpoint**
- Acceptance Criteria:
  - API route: `POST /api/ai/preview`
  - Accepts: promptId, userInput (the input the buyer wants to test the prompt with)
  - Fetches prompt's `previewContent` from Sanity (NOT fullContent)
  - Constructs OpenAI API call:
    - system message: the prompt's preview content
    - user message: buyer's test input
    - `max_tokens: 150` (truncated preview — incentivize purchase for full output)
    - `temperature`: from prompt settings or default 0.7
  - Returns: `{ response: string, tokensUsed: number, truncated: boolean }`
  - Response truncated with "... [Purchase to see full output]"

**Task 8.2.2: Implement token counting**
- Acceptance Criteria:
  - Use `tiktoken` library to count tokens before sending request
  - Count: input tokens (prompt + user input) + estimated output tokens
  - Display estimated cost to user before running
  - Record actual tokens used in UsageTracking (PostgreSQL)

### Story 8.3: Rate Limiting for AI Preview

**Task 8.3.1: Implement tiered rate limiting**
- Acceptance Criteria:
  - Anonymous users: 0 previews (must register)
  - Registered users: 5 previews per day
  - Track usage in UsageTracking table
  - Reset daily at midnight UTC
  - Return 429 when limit exceeded with: `{ error: 'preview_limit_exceeded', limit: 5, used: 5, resetAt: 'timestamp' }`
  - Show remaining previews in UI: "3 of 5 free previews remaining today"

### Story 8.4: OpenAI Error Handling

**Task 8.4.1: Handle all OpenAI API errors**
- Acceptance Criteria:
  - Rate limit errors (429): show "AI service is busy, please try again in a moment"
  - Timeout errors: show "Request timed out, please try again"
  - Content policy violations: show "This input was flagged by our safety system"
  - Invalid API key: log critical error, show "AI preview is temporarily unavailable"
  - Network errors: show generic "Unable to generate preview"
  - All errors logged server-side with full context
  - Never expose OpenAI error details to client

---

## Epic 9: Buyer Library & Downloads

### Story 9.1: Purchased Prompts Library

**Task 9.1.1: Build buyer library page**
- Acceptance Criteria:
  - Page at `/dashboard/library`
  - Lists all purchased prompts
  - Each item: title, seller, purchase date, rating (if reviewed), category
  - Click to view full prompt content
  - Search within library

**Task 9.1.2: Build prompt access page**
- Acceptance Criteria:
  - Page at `/dashboard/library/[promptId]`
  - Shows FULL prompt content (the actual prompt text)
  - "Copy to Clipboard" button with success toast
  - "Download as .txt" button
  - "Download as .md" button
  - Purchase receipt info (date, amount, transaction ID)
  - "Leave a Review" button (if not yet reviewed)

### Story 9.2: Purchase History

**Task 9.2.1: Build purchase history page**
- Acceptance Criteria:
  - Page at `/dashboard/purchases`
  - Table: prompt title, seller, amount, date, status, receipt
  - Receipt link opens payment details
  - Paginated

---

## Epic 10: Reviews & Ratings

### Story 10.1: Submit Review

**Task 10.1.1: Build review submission**
- Acceptance Criteria:
  - Review form on prompt detail page (only visible if purchased and not yet reviewed)
  - Fields: rating (1-5 stars interactive), title, review text
  - Validation: rating required, text min 10 chars max 500 chars
  - Creates review document in Sanity
  - Updates prompt's averageRating and reviewCount (denormalized update)
  - Cannot review your own prompts (seller self-review blocked)

**Task 10.1.2: Build review display**
- Acceptance Criteria:
  - Reviews listed on prompt detail page
  - Shows: reviewer name, avatar, rating, title, text, date
  - Sorted by most recent first
  - Average rating summary at top (star distribution bar chart)
  - Pagination for reviews

### Story 10.2: Review Moderation

**Task 10.2.1: Build review moderation (admin)**
- Acceptance Criteria:
  - Admin can flag/remove inappropriate reviews
  - Flagged reviews hidden from public view
  - Seller can report reviews (creates moderation request for admin)
  - Removed reviews update the prompt's averageRating recalculation

---

## Epic 11: Seller Dashboard & Analytics

### Story 11.1: Seller Earnings Overview

**Task 11.1.1: Build seller dashboard**
- Acceptance Criteria:
  - Page at `/dashboard/seller`
  - Stats cards: Total Earnings (net of platform fee), This Month Earnings, Total Sales, Average Rating
  - Earnings chart (line chart, daily/weekly/monthly)
  - Recent sales list (last 10)

**Task 11.1.2: Build per-prompt analytics**
- Acceptance Criteria:
  - Page at `/dashboard/seller/prompts/[id]/analytics`
  - Stats: total views, total purchases, conversion rate, revenue, average rating
  - Sales over time chart
  - Review summary

### Story 11.2: Payout Information

**Task 11.2.1: Display payout info**
- Acceptance Criteria:
  - Link to Stripe Express Dashboard (Standard Connect accounts manage payouts on Stripe's site)
  - Explanation: "Payouts are managed by Stripe. Click below to view your balance and payout schedule."
  - Show: connected account status, country, default currency
  - Platform fee percentage displayed: "Platform takes X% on each sale"

---

## Epic 12: Admin Panel

### Story 12.1: Admin Dashboard

**Task 12.1.1: Build admin overview**
- Acceptance Criteria:
  - Page at `/admin` (admin role required)
  - Stats: total users, total sellers, total prompts, total revenue (platform fees collected), total sales volume
  - Charts: sales volume over time, new users over time
  - Recent activity feed

### Story 12.2: Content Moderation

**Task 12.2.1: Build prompt moderation**
- Acceptance Criteria:
  - List of prompts pending review (status: draft/submitted)
  - Admin can: approve (publish), reject (with reason), flag
  - Rejection reason sent to seller via email
  - Bulk moderation actions

**Task 12.2.2: Build user management**
- Acceptance Criteria:
  - User list with search and filters
  - View user profile, purchase history, seller stats
  - Actions: suspend user, change role, delete account
  - Suspension blocks login and hides published prompts

### Story 12.3: Financial Overview

**Task 12.3.1: Build revenue analytics**
- Acceptance Criteria:
  - Platform fee revenue chart
  - Revenue by category
  - Top selling prompts
  - Top sellers
  - Transaction log with search and filters

### Story 12.4: Connected Accounts Overview

**Task 12.4.1: Build connected accounts management**
- Acceptance Criteria:
  - List all connected accounts with status
  - Show: seller name, account status (verified/pending/disconnected), country, total sales
  - Alert for accounts with issues (charges not enabled)

---

## Epic 13: Security & Compliance

### Story 13.1: PCI-DSS

**Task 13.1.1: Ensure PCI compliance**
- Acceptance Criteria:
  - Stripe Checkout handles all card data (SAQ-A)
  - No card data in logs, database, or server memory
  - Documented in codebase

### Story 13.2: GDPR

**Task 13.2.1: Implement GDPR requirements**
- Acceptance Criteria:
  - Cookie consent banner
  - Privacy policy page
  - Data export endpoint (user data from both Sanity and PostgreSQL)
  - Account deletion (anonymize in Sanity + PostgreSQL, retain financial records)
  - Consent tracking

### Story 13.3: Security Headers

**Task 13.3.1: Configure security headers**
- Acceptance Criteria:
  - CSP configured (allow Stripe JS, Sanity CDN)
  - HSTS, X-Frame-Options, X-Content-Type-Options
  - Configured in `next.config.js`

### Story 13.4: Rate Limiting

**Task 13.4.1: Implement rate limiting**
- Acceptance Criteria:
  - Auth endpoints: 5/min per IP
  - Payment endpoints: 10/min per IP
  - AI preview: as defined in Epic 8
  - Search: 30/min per IP
  - Webhook endpoints: 100/min per IP

### Story 13.5: Input Validation & Sanitization

**Task 13.5.1: Validate all inputs**
- Acceptance Criteria:
  - Zod validation on all API routes
  - Sanity content sanitized (no script injection in prompt content)
  - GROQ injection prevention (parameterized queries)
  - File upload validation (type, size, content)

### Story 13.6: Audit Logging

**Task 13.6.1: Comprehensive audit logging**
- Acceptance Criteria:
  - All payment events logged (PostgreSQL)
  - All Connect events logged
  - All auth events logged
  - All moderation actions logged
  - Audit log viewer in admin panel

---

## Epic 14: Email Notifications

### Story 14.1: Email Templates

**Task 14.1.1: Build all email templates**
- Acceptance Criteria:
  - Welcome email (registration)
  - Purchase confirmation (buyer) — amount, prompt title, library link
  - Sale notification (seller) — amount, prompt title, net earnings
  - Stripe account connected confirmation
  - Stripe account disconnected notification
  - Review received notification (seller)
  - Prompt approved/rejected notification (seller)
  - All emails responsive and branded

---

## Epic 15: Testing

### Story 15.1: Unit Tests

**Task 15.1.1: Test payment logic**
- Acceptance Criteria:
  - Test platform fee calculation (edge cases: minimum fee, rounding)
  - Test idempotency check
  - Test purchase access verification

**Task 15.1.2: Test AI preview logic**
- Acceptance Criteria:
  - Test token counting
  - Test rate limiting logic
  - Test response truncation
  - Mock OpenAI API responses

### Story 15.2: Integration Tests

**Task 15.2.1: Test Connect OAuth flow**
- Acceptance Criteria:
  - Test authorization URL generation
  - Test callback processing (mock Stripe OAuth response)
  - Test account status checking

**Task 15.2.2: Test purchase flow**
- Acceptance Criteria:
  - Test checkout session creation with connected account
  - Test webhook processing
  - Test access granting after purchase

### Story 15.3: E2E Tests

**Task 15.3.1: Full purchase flow**
- Acceptance Criteria:
  - Seller connects Stripe → Creates prompt → Buyer browses → Buyer purchases → Buyer accesses full content
  - Uses Stripe test mode

---

## Epic 16: UI/UX

### Story 16.1: Design System

**Task 16.1.1: Configure design system**
- Acceptance Criteria:
  - Tailwind theme with marketplace-appropriate colors
  - shadcn/ui components installed
  - Dark mode support
  - Consistent typography and spacing

### Story 16.2: Marketplace UI

**Task 16.2.1: Build responsive marketplace**
- Acceptance Criteria:
  - Homepage with featured prompts, categories, search
  - Prompt card component (reusable)
  - Responsive grid (4 cols desktop, 2 tablet, 1 mobile)
  - Skeleton loading for cards

### Story 16.3: SEO

**Task 16.3.1: Implement SEO**
- Acceptance Criteria:
  - Dynamic metadata per prompt page (Next.js generateMetadata)
  - Open Graph tags (title, description, image)
  - JSON-LD structured data (Product schema)
  - Sitemap generation
  - robots.txt

---

## Production Checklist

### Stripe Connect
- [ ] Platform registered in Stripe Dashboard
- [ ] OAuth redirect URI configured correctly
- [ ] CSRF protection on OAuth flow (state parameter)
- [ ] Connected account status checked before creating charges
- [ ] Account deauthorization webhook handled
- [ ] Application fees calculated correctly
- [ ] Destination charges configured with proper transfer_data
- [ ] Refunds reverse transfers and application fees
- [ ] Connected account dashboard link provided to sellers

### Payments
- [ ] Checkout sessions include metadata for traceability
- [ ] Webhook signatures verified
- [ ] All events processed idempotently
- [ ] Edge cases handled (disconnected account, already purchased)
- [ ] Payment records reconcile with Stripe

### AI Integration
- [ ] API key server-side only (never in client bundle)
- [ ] Token counting before API calls
- [ ] Rate limiting per user per day
- [ ] All OpenAI errors handled gracefully
- [ ] Cost tracked per request
- [ ] Response truncated for preview (incentivize purchase)

### Security
- [ ] PCI-DSS SAQ-A compliance
- [ ] GDPR: consent, export, deletion
- [ ] Security headers configured
- [ ] Rate limiting on all endpoints
- [ ] Input validation (Zod)
- [ ] GROQ injection prevention
- [ ] Audit logging for financial events

### Content
- [ ] Preview vs full content separation enforced at API level
- [ ] GROQ queries never return fullContent without purchase verification
- [ ] Content moderation workflow for sellers
- [ ] Image upload validation and optimization
