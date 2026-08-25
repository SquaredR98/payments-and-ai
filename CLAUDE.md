# Claude Instructions — Payment & AI Learning Roadmap

## What This Repo Is

This is a project-based learning roadmap for mastering payment integrations (Stripe, Razorpay, PayPal) and AI/LLM implementations. It contains 8 progressively complex projects with detailed story points and feature documentation.

## How To Resume Work

**ALWAYS read `progress.md` first.** It tells you:
- Which project is currently active
- Which phase we're in (story-points / feature-docs / implementation)
- Which feature is currently being worked on
- What was completed last
- What needs to be done next

## The Workflow (NEVER deviate from this)

### Phase 1: Story Points (COMPLETED for all 8 projects)
All `story-points.md` files exist under `learning-roadmap/project-X-name/`.

### Phase 2: Feature Documentation (per project, per feature)
For the ACTIVE project (check `progress.md`):
1. Take the next feature/epic from `story-points.md`
2. Create a detailed feature doc: `learning-roadmap/project-X-name/feature-XX-name.md`
3. The feature doc must contain:
   - **What** we are building
   - **Why** we are building it this way (senior engineer reasoning)
   - **Architecture/flow** explanation (with diagrams in text where helpful)
   - **Database schema** changes (if applicable)
   - **API contracts** (request/response shapes)
   - **Step-by-step implementation guide** (detailed enough for intermediate dev)
   - **Common Mistakes & Pitfalls** section with real examples
   - **Production considerations** (compliance, security, edge cases)
   - **References** to official docs (URLs)
4. User reviews and approves the doc
5. Move to Phase 3 for that feature

### Phase 3: Implementation (per feature, after doc approval)
1. Scaffold the code (folders, components, pages, API routes, DB schemas)
2. Build the UI (full professional design with Tailwind, styled and laid out)
3. Create implementation placeholders with detailed `// TODO: IMPLEMENT` blocks containing:
   - What the code should do
   - What inputs/outputs to expect
   - What API methods to call
   - Step-by-step logic breakdown
   - Links to relevant docs
4. User implements the logic inside the placeholders
5. Review together if user gets stuck
6. Mark feature as complete in `progress.md`
7. Go back to Phase 2 for the next feature

### Phase 4: Move to next project
When all features of a project are complete, update `progress.md` and start Phase 2 for the next project.

## Important Rules

1. **NEVER skip features or jump ahead.** Sequential, one feature at a time.
2. **ALWAYS update `progress.md`** after completing any step.
3. **The user does NOT design UI/UX** — Claude does. The user implements logic.
4. **Every placeholder must have detailed explanations** — the user is intermediate level.
5. **Production-grade features required** — GDPR, PCI-DSS, audit logs, security headers, rate limiting, etc.
6. **Feature docs explain the "why" not just the "what"** — like a senior engineer mentoring.
7. **Common mistakes section is mandatory** in every feature doc.

## Project List

| # | Project | Backend | Frontend | Payment | AI |
|---|---------|---------|----------|---------|-----|
| 1 | PayMe | PayloadCMS | Next.js | Stripe Checkout, PayPal | — |
| 2 | SubSync | Strapi | React Vite | Stripe Subs, Razorpay Subs | — |
| 3 | PromptVault | Sanity + Prisma | Next.js | Stripe Connect Standard | OpenAI |
| 4 | GigBoard | Hono + Bun | TanStack Start | Stripe Connect Express, Escrow | Claude API |
| 5 | DocuMind | FastAPI | Next.js | Stripe Metered Billing | RAG, Multi-LLM |
| 6 | FlowHire | NestJS | React Vite | Stripe Connect Custom | Function Calling |
| 7 | ContentForge | PayloadCMS | TanStack Router | Razorpay, PayPal deep | Multi-provider |
| 8 | LaunchPad | NestJS + FastAPI | Next.js | All gateways, all Connect | LLM Orchestration |

## Folder Structure

```
stripe-connect/
├── CLAUDE.md                          ← You are here (instructions for Claude)
├── progress.md                        ← Current state tracker (READ THIS FIRST)
├── learning-roadmap/
│   ├── project-1-payme/
│   │   ├── story-points.md            ← Full feature breakdown
│   │   ├── feature-01-setup.md        ← Per-feature docs (created as we go)
│   │   ├── feature-02-auth.md
│   │   └── ...
│   ├── project-2-subsync/
│   │   ├── story-points.md
│   │   └── ...
│   └── ... (projects 3-8)
└── projects/                          ← Actual code lives here (created during implementation)
    ├── payme/
    ├── subsync/
    └── ...
```

## Quick Start for Claude

When the user says anything like "let's continue", "what's next", "resume", or just starts a new session:

1. Read `progress.md`
2. Identify current project, phase, and feature
3. Continue from where we left off
4. Update `progress.md` after completing any step
