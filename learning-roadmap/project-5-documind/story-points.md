# Project 5: DocuMind — AI Document Analysis SaaS

## Project Overview

**What it is:** Upload documents (PDF, DOCX), and the AI analyzes, summarizes, and lets you ask questions about them using RAG (Retrieval Augmented Generation). Multi-LLM provider support (OpenAI, Claude, Groq for open-source models). Billing is usage-based via Stripe Metered Billing with a credit system.

**Tech Stack:**
- **Backend (AI Service):** Python FastAPI (custom backend for AI/ML workloads)
- **Frontend + API Gateway:** Next.js 14+ (App Router with API routes proxying to FastAPI)
- **Database:** Supabase (PostgreSQL + pgvector for embeddings + Auth + Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe Metered Billing (usage-based), Stripe Subscriptions (tiered plans)
- **AI:** OpenAI (GPT-4, embeddings), Anthropic Claude, Groq (Llama/Mixtral)
- **Deployment:** Local development only

**Why FastAPI for AI:** Python has the best ecosystem for AI/ML — tiktoken, langchain, document processing (PyPDF2, python-docx), embeddings. FastAPI gives you async, type-safe, auto-documented APIs. The Next.js frontend proxies AI requests to FastAPI.

**What You Will Learn:**
1. RAG architecture — chunking, embeddings, vector search, context assembly
2. Vector databases — pgvector in Supabase
3. Multi-LLM provider abstraction — swap between OpenAI, Claude, Groq
4. Token counting and cost estimation
5. Streaming responses — SSE from FastAPI to Next.js to browser
6. Usage-based billing — Stripe Metered Billing and credit system
7. API key generation and management (for programmatic access)
8. Python + JavaScript interop (two-service architecture)
9. Document processing pipeline
10. Supabase deep dive — Auth, Storage, PostgreSQL, pgvector, Row Level Security

---

## Feature List Summary

1. FastAPI backend setup (Python AI service)
2. Next.js frontend + API gateway setup
3. Supabase configuration (Auth, DB, Storage, pgvector)
4. Authentication (Supabase Auth — email + Google)
5. Document upload and storage (Supabase Storage)
6. Document processing pipeline (extract → chunk → embed → store)
7. PDF text extraction (PyPDF2/pdfplumber)
8. DOCX text extraction (python-docx)
9. Text chunking with overlap strategy
10. Embedding generation (OpenAI text-embedding-3-small)
11. Vector storage in pgvector
12. RAG-based Q&A (query → embed → search → assemble → LLM → response)
13. Response streaming (SSE)
14. Multi-LLM provider system (OpenAI, Claude, Groq)
15. Provider selection UI (user picks model)
16. Provider fallback chain
17. Token counting and cost estimation
18. Per-query usage recording
19. Credit system (plans grant credits, queries cost credits)
20. Stripe Metered Billing (report usage to Stripe)
21. Subscription plans (Free/Pro/Enterprise) with credit allocations
22. Top-up credits (one-time purchase)
23. API key generation for programmatic access
24. API key auth, scopes, rate limiting
25. Document management (library, delete, share)
26. Conversation history (multi-turn chat per document)
27. Export analysis as PDF/Markdown
28. Security (file validation, signed URLs, CSP, rate limiting)
29. GDPR (document data privacy, encryption, retention)
30. Audit logging
31. Testing
32. Responsive chat UI with dark mode

---

## Epic 1: Project Setup & Architecture

### Story 1.1: Initialize FastAPI Backend

**Task 1.1.1: Create FastAPI project**
- Acceptance Criteria:
  - Python 3.11+ project with FastAPI
  - Project structure: `app/main.py`, `app/routers/`, `app/services/`, `app/models/`, `app/utils/`, `app/providers/`
  - Virtual environment with `requirements.txt` or `pyproject.toml`
  - Dependencies: fastapi, uvicorn, python-multipart, pydantic, python-dotenv, openai, anthropic, httpx, tiktoken, PyPDF2, python-docx, supabase-py
  - Server runs on `localhost:8000`
  - Auto-generated API docs at `/docs` (Swagger) and `/redoc`

**Task 1.1.2: Configure Supabase connection from Python**
- Acceptance Criteria:
  - `supabase-py` client configured
  - Direct PostgreSQL connection via `asyncpg` or `psycopg2` for pgvector queries
  - Supabase URL and Service Key in env vars
  - Connection pooling configured

**Task 1.1.3: Configure CORS and middleware**
- Acceptance Criteria:
  - CORS allows Next.js frontend origin
  - Request logging middleware
  - Error handling middleware
  - Request ID middleware (for tracing across services)

### Story 1.2: Initialize Next.js Frontend

**Task 1.2.1: Setup Next.js project**
- Acceptance Criteria:
  - Next.js 14+ with App Router
  - TypeScript strict mode
  - Tailwind CSS + shadcn/ui
  - Supabase client configured (`@supabase/ssr` for server components)
  - API proxy routes to forward requests to FastAPI

**Task 1.2.2: Configure API proxy**
- Acceptance Criteria:
  - Next.js API routes proxy AI-related requests to FastAPI:
    - `/api/ai/*` → `http://localhost:8000/*`
  - Proxy adds Supabase JWT to FastAPI requests (auth forwarding)
  - Error handling in proxy (FastAPI down, timeout)

### Story 1.3: Supabase Project Setup

**Task 1.3.1: Configure Supabase**
- Acceptance Criteria:
  - Supabase project created (local via `supabase init` or cloud)
  - Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector`
  - Configure Storage bucket: `documents` (private, signed URLs)
  - Auth providers: Email/Password + Google OAuth
  - Row Level Security (RLS) policies configured for all tables
  - Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

**Task 1.3.2: Enable and configure pgvector**
- Acceptance Criteria:
  - pgvector extension enabled
  - Vector dimension set to match embedding model (1536 for text-embedding-3-small)
  - HNSW or IVFFlat index created for fast similarity search
  - Code comment explaining: "pgvector stores vector embeddings and enables similarity search. When a user asks a question, we embed the question, then find the most similar document chunks using cosine similarity."

---

## Epic 2: Authentication & User Management

### Story 2.1: Supabase Auth Setup

**Task 2.1.1: Configure auth providers**
- Acceptance Criteria:
  - Email/Password auth enabled
  - Google OAuth configured
  - Auth redirect URLs configured
  - Email templates customized (verification, reset)

**Task 2.1.2: Build auth pages**
- Acceptance Criteria:
  - Login page at `/login` (email + password, Google OAuth button)
  - Register page at `/register` (email, password, confirm password, name)
  - Forgot password page
  - Email verification handling
  - Auth state managed via Supabase's `onAuthStateChange`

**Task 2.1.3: Create user profile table**
- Acceptance Criteria:
  - Table: `profiles` (extends auth.users)
  - Fields: id (FK to auth.users), full_name, avatar_url, current_plan (free/pro/enterprise), credits_balance (integer), stripe_customer_id, created_at, updated_at
  - RLS: users can read/update their own profile
  - Trigger: auto-create profile on auth.users insert

### Story 2.2: Auth in FastAPI

**Task 2.2.1: Build JWT verification middleware for FastAPI**
- Acceptance Criteria:
  - FastAPI dependency: `get_current_user`
  - Extracts JWT from Authorization header
  - Verifies against Supabase JWT secret
  - Returns user ID and email
  - 401 if invalid/missing

---

## Epic 3: Database Schema Design

### Story 3.1: Document Tables

**Task 3.1.1: Create documents table**
- Acceptance Criteria:
  - Table: `documents`
  - Fields: id (uuid), user_id (FK to auth.users), title, file_name, file_type (pdf/docx), file_size (bytes), storage_path (Supabase Storage path), status (uploading/processing/ready/failed), page_count, word_count, processing_error (text, nullable), created_at, updated_at
  - RLS: users can CRUD their own documents only
  - Indexes on: user_id, status

**Task 3.1.2: Create document_chunks table**
- Acceptance Criteria:
  - Table: `document_chunks`
  - Fields: id (uuid), document_id (FK), chunk_index (integer), content (text — the chunk text), embedding (vector(1536) — pgvector type), metadata (jsonb — page number, section heading, etc.), token_count (integer), created_at
  - RLS: inherit from parent document (users can read chunks of their own documents)
  - Index: HNSW index on embedding column for fast similarity search

### Story 3.2: Conversation Tables

**Task 3.2.1: Create conversations table**
- Acceptance Criteria:
  - Table: `conversations`
  - Fields: id (uuid), user_id (FK), document_id (FK), title (auto-generated from first query), model_used (string), created_at, updated_at
  - RLS: user can CRUD own conversations

**Task 3.2.2: Create messages table**
- Acceptance Criteria:
  - Table: `messages`
  - Fields: id (uuid), conversation_id (FK), role (user/assistant/system), content (text), sources (jsonb — array of chunk references used for this response), tokens_used (integer), model (string), cost (decimal), created_at
  - RLS: inherit from conversation
  - Ordered by created_at

### Story 3.3: Usage & Billing Tables

**Task 3.3.1: Create usage_records table**
- Acceptance Criteria:
  - Table: `usage_records`
  - Fields: id (uuid), user_id (FK), action (query/embed/upload), model (string), input_tokens (integer), output_tokens (integer), total_tokens (integer), credits_consumed (integer), cost_usd (decimal), document_id (FK, nullable), conversation_id (FK, nullable), created_at
  - RLS: user can read own records, admin can read all

**Task 3.3.2: Create api_keys table**
- Acceptance Criteria:
  - Table: `api_keys`
  - Fields: id (uuid), user_id (FK), name (string), key_hash (string — bcrypt hash, never store plain text), key_prefix (string — first 8 chars for display: "dk_a1b2..."), scopes (text array — ['read', 'query', 'upload']), last_used_at (timestamp), expires_at (timestamp, nullable), is_active (boolean), created_at
  - RLS: user can CRUD own keys
  - On create: return plain text key ONCE, then only store hash

**Task 3.3.3: Create subscriptions table**
- Acceptance Criteria:
  - Table: `subscriptions`
  - Fields: id, user_id (FK unique), plan (free/pro/enterprise), stripe_subscription_id, stripe_price_id, status (active/past_due/cancelled), current_period_start, current_period_end, credits_per_period (integer), created_at, updated_at
  - RLS: user reads own

### Story 3.4: Audit Log Table

**Task 3.4.1: Create audit_logs table**
- Acceptance Criteria:
  - Table: `audit_logs`
  - Fields: id, action, entity, entity_id, user_id, ip_address, details (jsonb), created_at
  - RLS: admin only
  - No update/delete permissions

---

## Epic 4: Document Upload & Processing Pipeline

### Story 4.1: File Upload

**Task 4.1.1: Build upload UI**
- Acceptance Criteria:
  - Page at `/dashboard/documents`
  - Drag-and-drop upload zone
  - File type validation: PDF, DOCX only
  - Size limit: 10MB for free, 50MB for pro, 100MB for enterprise
  - Upload progress bar
  - Multiple file upload support (one at a time processing)

**Task 4.1.2: Build upload API**
- Acceptance Criteria:
  - Next.js API route: `POST /api/documents/upload`
  - Validates: file type, file size against plan limits, storage quota
  - Uploads to Supabase Storage (private bucket)
  - Creates document record with status "uploading" → "processing"
  - Triggers processing pipeline (calls FastAPI)
  - Returns: document ID and status

**Task 4.1.3: Implement file security validation**
- Acceptance Criteria:
  - Check MIME type matches extension (don't trust extension alone)
  - Read file magic bytes to verify actual file type
  - Reject files that claim to be PDF but aren't
  - Scan for embedded scripts in PDFs (basic check)
  - Max file name length: 255 chars
  - Sanitize file name (remove special chars)

### Story 4.2: Document Processing Pipeline (FastAPI)

**Task 4.2.1: Build PDF text extraction**
- Acceptance Criteria:
  - FastAPI endpoint: `POST /process/document`
  - Download file from Supabase Storage (using signed URL)
  - PDF extraction using `pdfplumber` (better than PyPDF2 for tables/layouts)
  - Extract text page by page
  - Preserve page numbers in metadata
  - Handle: encrypted PDFs (reject), scanned PDFs (note: OCR not supported, return error)
  - Handle: very large PDFs (100+ pages) — process in batches

**Task 4.2.2: Build DOCX text extraction**
- Acceptance Criteria:
  - Use `python-docx` for DOCX extraction
  - Extract: paragraphs, tables (as text), headers
  - Preserve section structure in metadata
  - Handle: corrupted files (return error gracefully)

**Task 4.2.3: Build text chunking**
- Acceptance Criteria:
  - Chunking strategy: Recursive Character Text Splitting
  - Chunk size: 1000 characters (configurable)
  - Chunk overlap: 200 characters (ensures context isn't lost at boundaries)
  - Code comment explaining: "We overlap chunks because if important info falls at a chunk boundary, it would be split. Overlap ensures context from both sides is preserved."
  - Metadata per chunk: page_number, chunk_index, document_id
  - Token count per chunk (using tiktoken)

**Task 4.2.4: Build embedding generation**
- Acceptance Criteria:
  - Use OpenAI `text-embedding-3-small` model (cost-effective, 1536 dimensions)
  - Batch embedding: send multiple chunks in one API call (up to 2048 per batch)
  - Track tokens used for embedding
  - Handle rate limits (retry with exponential backoff)
  - Code comment explaining: "Embeddings convert text into a numerical vector. Similar text produces similar vectors. This is how we find relevant chunks when the user asks a question."

**Task 4.2.5: Store embeddings in pgvector**
- Acceptance Criteria:
  - Insert chunks with embeddings into `document_chunks` table
  - Use pgvector's `vector` type for embedding column
  - Verify HNSW index is used for queries (EXPLAIN ANALYZE)
  - Batch insert for performance

**Task 4.2.6: Update document status**
- Acceptance Criteria:
  - Pipeline stages: uploading → processing → extracting → chunking → embedding → ready
  - Status updated at each stage (real-time progress visible to user)
  - On error: status → failed, processing_error set with message
  - On success: status → ready, page_count and word_count populated
  - Processing time logged

### Story 4.3: Processing Error Handling

**Task 4.3.1: Build retry logic**
- Acceptance Criteria:
  - If embedding API fails (rate limit, timeout): retry with exponential backoff (3 retries)
  - If extraction fails: mark document as failed with error message
  - User can "Retry Processing" from UI
  - Failed documents don't consume credits

---

## Epic 5: RAG-Based Q&A System

### Story 5.1: Query Pipeline (FastAPI)

**Task 5.1.1: Build query embedding**
- Acceptance Criteria:
  - FastAPI endpoint: `POST /query`
  - Accepts: question (text), document_id, model (string), conversation_id (optional)
  - Step 1: Embed the user's question using same embedding model (text-embedding-3-small)
  - Code comment: "We embed the question with the same model used for document chunks. This ensures they're in the same vector space — necessary for similarity comparison."

**Task 5.1.2: Build vector similarity search**
- Acceptance Criteria:
  - Step 2: Search document_chunks using pgvector cosine similarity
  - Query: `SELECT *, 1 - (embedding <=> $1) AS similarity FROM document_chunks WHERE document_id = $2 ORDER BY similarity DESC LIMIT $3`
  - `<=>` is pgvector's cosine distance operator
  - Return top 5 most relevant chunks
  - Minimum similarity threshold: 0.7 (ignore irrelevant chunks)
  - Code comment explaining cosine similarity

**Task 5.1.3: Build context assembly**
- Acceptance Criteria:
  - Step 3: Assemble prompt with retrieved chunks
  - Format:
    ```
    System: You are a helpful document analysis assistant. Answer questions based ONLY on the provided context. If the answer isn't in the context, say "I couldn't find this information in the document."

    Context from document:
    [Chunk 1 - Page 3]
    {chunk text}

    [Chunk 2 - Page 7]
    {chunk text}
    ...

    Previous conversation:
    User: {previous question}
    Assistant: {previous answer}

    User: {current question}
    ```
  - Include conversation history for multi-turn chat (last 5 messages)
  - Token budget: ensure total prompt doesn't exceed model's context window

**Task 5.1.4: Build LLM query**
- Acceptance Criteria:
  - Step 4: Send assembled prompt to selected LLM provider
  - Default: OpenAI GPT-3.5-turbo (cost-effective)
  - Stream response back (SSE)
  - Track: input tokens, output tokens, model, cost
  - Deduct credits from user balance
  - Save message to database (both user query and AI response)
  - Include source references (which chunks were used)

### Story 5.2: Response Streaming

**Task 5.2.1: Implement SSE streaming from FastAPI**
- Acceptance Criteria:
  - FastAPI endpoint returns `StreamingResponse` with `text/event-stream` content type
  - Each chunk of the AI response sent as an SSE event
  - Format: `data: {"content": "chunk text", "done": false}\n\n`
  - Final event: `data: {"content": "", "done": true, "tokens": {...}, "sources": [...]}\n\n`
  - Handles: stream interruption, client disconnect, provider errors mid-stream

**Task 5.2.2: Build streaming chat UI**
- Acceptance Criteria:
  - Chat interface with message bubbles
  - User message appears immediately
  - AI response streams in character by character (typewriter effect)
  - "Stop generating" button during streaming
  - Source citations shown below AI response (expandable)
  - Scroll-to-bottom behavior during streaming

### Story 5.3: Conversation Management

**Task 5.3.1: Build conversation persistence**
- Acceptance Criteria:
  - Each document can have multiple conversations
  - Conversation list sidebar (like ChatGPT)
  - Each conversation shows: title (first query), message count, last updated
  - Switch between conversations
  - Delete conversation

**Task 5.3.2: Build follow-up questions**
- Acceptance Criteria:
  - After each AI response: suggest 3 follow-up questions based on the context
  - Click to ask suggested question
  - Follow-up questions generated by the LLM as part of the response

---

## Epic 6: Multi-LLM Provider System

### Story 6.1: Provider Abstraction Layer (Python)

**Task 6.1.1: Create LLM provider interface**
- Acceptance Criteria:
  - Abstract base class: `LLMProvider`
  - Methods:
    - `async generate(messages, model, temperature, max_tokens) -> str`
    - `async stream(messages, model, temperature, max_tokens) -> AsyncGenerator[str]`
    - `count_tokens(text, model) -> int`
    - `get_cost(input_tokens, output_tokens, model) -> float`
    - `get_available_models() -> List[ModelInfo]`
  - `ModelInfo`: name, context_window, cost_per_input_token, cost_per_output_token, speed_tier

**Task 6.1.2: Implement OpenAI provider**
- Acceptance Criteria:
  - Implements `LLMProvider` using `openai` Python SDK
  - Models: gpt-4, gpt-4-turbo, gpt-3.5-turbo
  - Token counting with `tiktoken`
  - Streaming via `client.chat.completions.create(stream=True)`
  - Error handling: rate limits, timeouts, content policy

**Task 6.1.3: Implement Anthropic/Claude provider**
- Acceptance Criteria:
  - Implements `LLMProvider` using `anthropic` Python SDK
  - Models: claude-3-opus, claude-3-sonnet, claude-3-haiku
  - Token counting with Anthropic's tokenizer
  - Streaming via `client.messages.create(stream=True)`
  - System message handling (Claude uses separate system param)

**Task 6.1.4: Implement Groq provider (open-source models)**
- Acceptance Criteria:
  - Implements `LLMProvider` using Groq API (OpenAI-compatible)
  - Models: llama-3-70b, mixtral-8x7b
  - Fast inference (Groq's hardware acceleration)
  - Token counting (approximate, tiktoken-based)
  - Code comment: "Groq runs open-source models on custom hardware. Same models as you'd self-host, but with API access and fast inference."

### Story 6.2: Provider Selection & Fallback

**Task 6.2.1: Build provider selection UI**
- Acceptance Criteria:
  - Dropdown in chat interface: select model before querying
  - Shows: model name, provider, speed indicator, cost per query (estimate)
  - Free tier: only gpt-3.5-turbo and llama-3 (cheapest)
  - Pro tier: all models
  - Enterprise: all models + priority queue

**Task 6.2.2: Build fallback chain**
- Acceptance Criteria:
  - Configurable fallback: primary → secondary → tertiary
  - Example: GPT-4 → Claude Sonnet → Llama-3 via Groq
  - Auto-switch if primary provider returns error (rate limit, timeout, 500)
  - Log which provider was used for each query
  - Notify user if fallback was used: "Using Claude (GPT-4 was temporarily unavailable)"

### Story 6.3: Provider Error Handling

**Task 6.3.1: Handle provider-specific errors**
- Acceptance Criteria:
  - OpenAI: rate limits (429), content policy (400), context length exceeded
  - Claude: overloaded (529), context length, content policy
  - Groq: rate limits, model unavailable
  - All errors mapped to user-friendly messages
  - All errors logged with: provider, model, error type, request context

---

## Epic 7: Token Management & Cost Tracking

### Story 7.1: Token Counting

**Task 7.1.1: Build token counting service**
- Acceptance Criteria:
  - FastAPI service: count tokens before sending request
  - OpenAI: use `tiktoken` (exact count)
  - Claude: use `anthropic.count_tokens()` or approximate
  - Groq: approximate using tiktoken (close enough for open-source models)
  - Count both input (prompt + context) and estimated output tokens
  - Reject queries that would exceed model's context window

**Task 7.1.2: Build cost estimation**
- Acceptance Criteria:
  - Before each query: estimate cost based on input tokens + expected output
  - Cost rates per model stored in config (easy to update)
  - Display to user: "This query will cost ~X credits (Y tokens)"
  - User confirms before expensive queries (above threshold)

### Story 7.2: Usage Recording

**Task 7.2.1: Build usage tracking**
- Acceptance Criteria:
  - After each AI query: record in usage_records table
  - Record: input_tokens, output_tokens, model, cost_usd, credits_consumed
  - After each embedding: record separately (embedding operations are cheaper)
  - Deduct credits from user's balance atomically (prevent race conditions)

### Story 7.3: Usage Dashboard

**Task 7.3.1: Build usage analytics page**
- Acceptance Criteria:
  - Page at `/dashboard/usage`
  - Credit balance display (prominent)
  - Usage chart (tokens over time)
  - Breakdown by: model, document, action type
  - Cost breakdown (estimated USD equivalent)
  - Table of recent queries with tokens used
  - Current period usage vs plan limit
  - "Low credits" warning banner when below 10%

---

## Epic 8: Credit System & Stripe Billing

### Story 8.1: Plan Configuration

**Task 8.1.1: Define plans and credit allocations**
- Acceptance Criteria:
  - Free: 100 credits/month, gpt-3.5-turbo and llama only, 5 documents, 10MB per doc
  - Pro ($29/mo): 5000 credits/month, all models, 50 documents, 50MB per doc
  - Enterprise ($99/mo): 25000 credits/month, all models, unlimited documents, 100MB per doc, priority queue, API access
  - Credit costs: gpt-3.5-turbo = 1 credit per query, gpt-4 = 10 credits, claude-sonnet = 5 credits, llama = 1 credit
  - Plan details stored in database, configurable

### Story 8.2: Stripe Subscription Setup

**Task 8.2.1: Build subscription creation**
- Acceptance Criteria:
  - Next.js API route: `POST /api/billing/create-checkout`
  - Creates Stripe Checkout Session with `mode: 'subscription'`
  - Stripe Products and Prices pre-created for each plan
  - Metadata: userId, plan
  - On success: subscription active, credits allocated

**Task 8.2.2: Build subscription webhook handling**
- Acceptance Criteria:
  - Handle: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted
  - On invoice.paid: reset credits to plan allocation for new period
  - On payment_failed: warning banner, dunning emails
  - On subscription.deleted: downgrade to free, reset credits to 100

### Story 8.3: Stripe Metered Billing (Usage Reporting)

**Task 8.3.1: Report usage to Stripe**
- Acceptance Criteria:
  - For Enterprise plan: usage-based overage charges
  - When user exceeds plan credits: report overage to Stripe
  - `stripe.subscriptionItems.createUsageRecord(subscriptionItemId, { quantity: overageCredits, timestamp, action: 'increment' })`
  - Overage pricing: configured in Stripe (e.g., $0.01 per credit over limit)
  - Code comment: "Metered billing reports usage to Stripe. Stripe adds overage charges to the next invoice automatically."

**Task 8.3.2: Build overage tracking**
- Acceptance Criteria:
  - Track when user exceeds plan credits
  - Show overage warning: "You've used X credits beyond your plan. Overage charges: $Y"
  - Option to buy credit top-up instead of overage rates

### Story 8.4: Credit Top-Up

**Task 8.4.1: Build top-up purchase**
- Acceptance Criteria:
  - API route: `POST /api/billing/top-up`
  - One-time Stripe Checkout Session (mode: 'payment')
  - Packages: 500 credits ($5), 2000 credits ($15), 5000 credits ($30)
  - On success: add credits to user balance
  - Top-up credits don't expire (unlike plan credits which reset monthly)

### Story 8.5: Billing Dashboard

**Task 8.5.1: Build billing page**
- Acceptance Criteria:
  - Page at `/dashboard/billing`
  - Current plan card with: plan name, credits remaining/total, renewal date
  - Upgrade/Downgrade buttons
  - Credit top-up buttons
  - Invoice history (from Stripe)
  - Payment method management (Stripe Customer Portal link)
  - Usage-based charges breakdown (if enterprise)

---

## Epic 9: API Key Management

### Story 9.1: Key Generation

**Task 9.1.1: Build API key generation endpoint**
- Acceptance Criteria:
  - API route: `POST /api/keys/generate`
  - Accepts: name (label), scopes (array: read, query, upload), expires_at (optional)
  - Generates cryptographically random key: `dk_` prefix + 48 random chars
  - Hashes key with bcrypt before storing
  - Returns plain text key ONCE in response (never retrievable again)
  - UI shows: "Copy this key now. You won't be able to see it again."
  - Stores: key_hash, key_prefix (first 8 chars for identification)

**Task 9.1.2: Build API key management UI**
- Acceptance Criteria:
  - Page at `/dashboard/settings/api-keys`
  - List of keys: name, prefix, scopes, created date, last used, status
  - "Generate New Key" button
  - Key generation dialog showing key once
  - "Revoke" button per key (with confirmation)
  - Enterprise plan only (or limit free/pro to 1 key)

### Story 9.2: Key Authentication

**Task 9.2.1: Build API key auth middleware (FastAPI)**
- Acceptance Criteria:
  - Alternative auth method: `Authorization: Bearer dk_xxxxx`
  - Middleware: hash incoming key, search for matching hash in database
  - Validate: key is active, not expired, scopes match requested action
  - Update last_used_at on successful auth
  - Rate limit per key: 60 requests/minute (free), 300/min (pro), 1000/min (enterprise)
  - Deduct credits same as web usage

### Story 9.3: API Documentation

**Task 9.3.1: Build API docs page**
- Acceptance Criteria:
  - Page at `/docs/api`
  - Endpoints documented: upload document, query document, list documents, get usage
  - Code examples in: curl, Python, JavaScript
  - Authentication section explaining API key usage
  - Rate limits documented per plan

---

## Epic 10: Document Management

### Story 10.1: Document Library

**Task 10.1.1: Build document library page**
- Acceptance Criteria:
  - Page at `/dashboard/documents`
  - Grid or list view of uploaded documents
  - Each item: title, file type icon, page count, upload date, status badge, conversation count
  - Status: processing (spinner), ready (green), failed (red with retry)
  - Click to open document chat page

**Task 10.1.2: Build document actions**
- Acceptance Criteria:
  - Delete document (cascade: delete chunks, embeddings, conversations)
  - Rename document
  - View document info (pages, words, chunks, storage used)
  - Re-process document (re-extract and re-embed)

### Story 10.2: Document Sharing

**Task 10.2.1: Build document sharing**
- Acceptance Criteria:
  - Generate shareable link with token (time-limited, 24 hours default)
  - Shared view: read-only, can ask questions but limited to 5 queries
  - Link deactivation on demand
  - Track who accessed shared documents

### Story 10.3: Storage Quota

**Task 10.3.1: Implement storage limits**
- Acceptance Criteria:
  - Free: 5 documents, 50MB total storage
  - Pro: 50 documents, 500MB total storage
  - Enterprise: unlimited documents, 5GB storage
  - Check quota before upload
  - Storage usage displayed in dashboard
  - "Storage full" warning with upgrade prompt

---

## Epic 11: Export & Reporting

### Story 11.1: Export Conversations

**Task 11.1.1: Build export functionality**
- Acceptance Criteria:
  - Export conversation as Markdown: all Q&A pairs with sources
  - Export conversation as PDF: formatted report with cover page, table of contents, Q&A sections
  - Export document summary: AI generates a comprehensive summary, exported as PDF/MD
  - Download button on conversation page

---

## Epic 12: Security & Compliance

### Story 12.1: Document Security

**Task 12.1.1: Secure document access**
- Acceptance Criteria:
  - Supabase Storage: private bucket, signed URLs (expire in 1 hour)
  - RLS on all tables (users only access own data)
  - FastAPI validates user owns the document before processing
  - File content encrypted in storage (Supabase handles at rest encryption)
  - No document content in URL parameters (POST only)
  - Document previews served via signed URLs (not public URLs)

### Story 12.2: GDPR

**Task 12.2.1: Document data privacy**
- Acceptance Criteria:
  - Document data is highly sensitive — treat as PII
  - Data export: export all user data including document metadata (not the raw files — too large)
  - Account deletion: delete all documents, chunks, embeddings, conversations, API keys
  - Data retention policy: documents auto-deleted 90 days after account deletion
  - Cookie consent
  - Privacy policy explaining document handling

### Story 12.3: Security Hardening

**Task 12.3.1: Implement security measures**
- Acceptance Criteria:
  - CSP headers (allow OpenAI, Anthropic, Stripe domains)
  - Rate limiting on all endpoints
  - File upload validation (type, size, content)
  - API key hashing (bcrypt)
  - SQL injection prevention (parameterized queries)
  - XSS prevention in chat UI (sanitize AI responses before rendering)
  - Audit logging for: document access, AI queries, billing events, API key operations

---

## Epic 13: Error Handling & Monitoring

### Story 13.1: Error Handling

**Task 13.1.1: FastAPI error handling**
- Acceptance Criteria:
  - Global exception handler
  - Pydantic validation errors → 422 with field details
  - LLM provider errors → 503 with fallback suggestion
  - Document processing errors → tracked and retryable
  - Structured logging (Python logging with JSON formatter)

**Task 13.1.2: Next.js error handling**
- Acceptance Criteria:
  - Error boundaries for: chat interface, document upload, billing
  - API proxy error handling (FastAPI down, timeout)
  - Toast notifications for user-facing errors

### Story 13.2: Health Checks

**Task 13.2.1: Build health check endpoints**
- Acceptance Criteria:
  - FastAPI: `GET /health` — checks: DB connection, OpenAI API, Supabase connection
  - Next.js: `GET /api/health` — checks: FastAPI reachable, Supabase connection, Stripe API
  - Returns: `{ status, services: { db, openai, supabase, stripe } }`

---

## Epic 14: Testing

### Story 14.1: Python Tests

**Task 14.1.1: Unit tests (pytest)**
- Acceptance Criteria:
  - Test text chunking (correct sizes, overlap, metadata)
  - Test token counting (various models)
  - Test cost calculation
  - Test provider abstraction (mock each provider)
  - Test credit deduction logic

**Task 14.1.2: Integration tests**
- Acceptance Criteria:
  - Test document processing pipeline (mock file, real chunking, mock embeddings)
  - Test RAG query pipeline (mock vector search, mock LLM)
  - Test API key authentication
  - Test streaming responses

### Story 14.2: Frontend Tests

**Task 14.2.1: Component tests**
- Acceptance Criteria:
  - Test chat interface (message display, streaming simulation)
  - Test document upload (validation, progress)
  - Test billing components

### Story 14.3: E2E Tests

**Task 14.3.1: Full flow test**
- Acceptance Criteria:
  - Upload document → Wait for processing → Ask question → Get answer with sources
  - Uses mock LLM responses
  - Verifies credits deducted

---

## Epic 15: UI/UX

### Story 15.1: Chat Interface

**Task 15.1.1: Build document chat UI**
- Acceptance Criteria:
  - ChatGPT-like interface but per-document
  - Left sidebar: document list + conversation list
  - Main area: chat with message bubbles
  - Bottom: input bar with model selector
  - AI responses render Markdown (headings, code blocks, lists)
  - Source citations expandable below AI responses
  - Streaming animation during response generation
  - "New conversation" button
  - Responsive (works on mobile)

### Story 15.2: Dashboard

**Task 15.2.1: Build dashboard UI**
- Acceptance Criteria:
  - Overview: recent documents, credit balance, quick actions
  - Document processing status (real-time updates)
  - Usage charts (daily queries, credits consumed)
  - Dark mode with toggle
  - Loading states and skeletons throughout

---

## Production Checklist

### RAG Pipeline
- [ ] Chunking produces consistent, meaningful segments
- [ ] Embeddings stored with correct dimensions
- [ ] pgvector index created for fast search
- [ ] Similarity threshold filters irrelevant results
- [ ] Context assembly respects token limits
- [ ] Conversation history included in context
- [ ] Source citations accurate (correct page numbers)

### Multi-LLM
- [ ] All three providers work (OpenAI, Claude, Groq)
- [ ] Provider fallback chain works
- [ ] Token counting accurate per provider
- [ ] Cost calculation correct per model
- [ ] Streaming works across all providers
- [ ] Provider errors handled gracefully

### Billing
- [ ] Plans enforce credit limits
- [ ] Credits deducted atomically (no race conditions)
- [ ] Metered billing reports to Stripe correctly
- [ ] Top-up credits added on purchase
- [ ] Monthly credits reset on invoice.paid
- [ ] Free tier limits enforced (models, documents, storage)
- [ ] Overage charges calculated correctly

### Security
- [ ] Documents accessible only by owner (RLS)
- [ ] API keys hashed, shown once
- [ ] API key rate limiting per plan
- [ ] File upload validation (type, size, content)
- [ ] Signed URLs for storage access
- [ ] AI responses sanitized before rendering
- [ ] GDPR: consent, export, deletion
- [ ] Audit logging for all sensitive operations

### Reliability
- [ ] Document processing retryable on failure
- [ ] LLM fallback chain prevents downtime
- [ ] Health checks for all services
- [ ] Error boundaries in UI
- [ ] Structured logging across both services
- [ ] Request correlation between Next.js and FastAPI
