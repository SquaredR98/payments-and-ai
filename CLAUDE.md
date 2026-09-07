# Claude Instructions — Payment & AI Learning Roadmap

## What This Repo Is

This is a project-based learning roadmap for mastering payment integrations (Stripe, Razorpay, PayPal) and AI/LLM implementations. It contains 8 progressively complex projects with detailed story points and feature documentation.

**Every project is a portfolio piece.** The user is building a body of work that demonstrates professional-grade UI/UX, clean architecture, and deep understanding to potential clients. Nothing is throwaway — every feature must be designed and polished.

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
1. **Present the plan first** — share understanding of requirements and approach. NEVER jump into code.
2. **Negotiate design** — for every page/component, discuss whether the design is achievable, what it should look like, before implementing.
3. Scaffold the code (folders, components, pages, API routes, DB schemas)
4. Build the UI (full professional design with Tailwind, styled and laid out)
5. Create implementation placeholders with detailed `// TODO: IMPLEMENT` blocks containing:
   - What the code should do
   - What inputs/outputs to expect
   - What API methods to call
   - Step-by-step logic breakdown
   - Links to relevant docs
6. User implements the logic inside the placeholders
7. **Explain line by line** if the user asks — they need to understand everything in the codebase
8. Review together if user gets stuck
9. Mark feature as complete in `progress.md`
10. Go back to Phase 2 for the next feature

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

## Collaboration Rules (CRITICAL — applies to ALL projects)

These rules come from the user's explicit feedback. Follow them exactly.

### Planning & Communication
- **NEVER implement without presenting the plan first.** Share your understanding of the requirements and how you'll approach it. The user approves, then you build.
- **For every page/view, negotiate the design first.** Is it achievable? Does it match expectations? Agree before coding.
- **Share checklists, not code dumps.** Break work into small reviewable steps. Check items one by one.
- **No parallel execution.** One thing at a time so the user can review each change.
- **Keep the user involved.** Give them small tasks to do themselves. Explain the "how" and "why" of everything you do.
- **Line-by-line explanation when asked.** The user needs to know where things are and why decisions were made.

### Code Quality & Architecture
- **No inline styles.** Always use CSS files with `@apply` and BEM class naming, even for quick tests.
- **No inline SVGs when an icon library has it.** Use Lucide icons (or the project's icon library). Only use custom SVGs for truly custom graphics (logos, illustrations), and put those in a shared directory (e.g., `public/icons/` or `src/assets/`), not inline in JSX.
- **Proper component grouping.** Organize components by feature/domain, not dumped flat. Each component gets a folder with colocated styles (e.g., `ComponentName/index.tsx` + `ComponentName/styles.css`).
- **No spaghetti.** If a file is getting long, break it up. If logic is repeated, extract it. But don't over-abstract — three similar lines is fine.
- **Delete after replace, not before.** When replacing a component, build the new one first, wire it up, confirm it works, then delete the old one.

### Tools & Environment
- **Use pnpm** (not npm) for all package management.
- **Use Bash tool** (not PowerShell) for all shell commands.
- **Don't scan node_modules.** Ever.
- **No Co-Authored-By** in git commit messages.

### Design & Polish
- **Every project is a portfolio piece.** UI/UX must be professional-grade. Appearance shows clients how detailed you are.
- **Always suggest the thorough/reusable approach.** The user wants to stand out, not ship fast.
- **Design first, implement second.** For every screen, discuss the layout, typography, spacing, interactions before writing code.
- **Consistency matters.** Spacing, font sizes, colors, border-radius, shadows — they must be consistent within each project. Define design tokens and use them everywhere.

## Project-Specific Rules

### Project 1: PayMe (PayloadCMS + Next.js)
- **Admin panel:** All custom components use BEM + `@apply` with `@reference "tailwindcss"`. Theme tokens from `custom.scss` (`--theme-elevation-*`, `--theme-success-*`, `--theme-border-color`).
- **Frontend:** Uses shadcn/ui components that inherit from `globals.css` tokens. No hardcoded hex colors — use semantic Tailwind classes (`bg-background`, `text-foreground`, `text-primary`, etc.).
- **Custom views:** Registered via `admin.components.views` in collection configs. Server component wraps client component pattern.
- **Payload hooks:** Always use `useListQuery`, `useTableColumns`, `useConfig`, `useNav` from `@payloadcms/ui` — don't re-implement what Payload provides.
- **Component location:** `src/admin/components/` for admin panel, `src/components/` for frontend.

### Project 2: SubSync (Strapi + React Vite)
- **No Next.js.** Manual routing with React Router v6. Manual state management with Zustand.
- **UI library:** Radix UI primitives + Tailwind CSS (not shadcn/ui since that's Next.js-specific in the way we've used it).
- **Gateway abstraction:** Stripe and Razorpay must share a unified interface. Don't build two separate payment flows — build one abstraction.
- **Feature gating:** Subscription tier checks must be centralized (not scattered through components).

### Project 3: PromptVault (Sanity + Prisma + Next.js)
- **Dual data stores:** Content (prompts, categories, reviews) in Sanity. Transactional data (payments, connected accounts) in PostgreSQL via Prisma. Never mix these responsibilities.
- **Stripe Connect Standard:** OAuth flow for seller onboarding. Understand the difference between Standard, Express, and Custom before implementing.
- **OpenAI integration:** Server-side only. Never expose API keys to the client. Token counting for cost control.

### Project 4: GigBoard (Hono + Bun + TanStack Start)
- **Bun runtime.** Not Node.js. Different APIs, faster cold starts. Test that all dependencies work with Bun.
- **Stripe Connect Express:** Platform controls the onboarding experience (unlike Standard where Stripe hosts it).
- **Escrow pattern:** Hold funds until work is completed. Understand deferred payouts.
- **Claude API:** Function calling, tool use. Understand the difference from OpenAI's approach.

### Project 5: DocuMind (FastAPI + Next.js)
- **Python backend.** FastAPI with type hints, Pydantic models. Different ecosystem from Node.js — learn the patterns.
- **Stripe Metered Billing:** Usage-based pricing. Report usage to Stripe, let Stripe calculate the bill. Understand meter events.
- **RAG pipeline:** Embeddings, vector store, retrieval, generation. Multi-LLM support (OpenAI + Claude + others).

### Project 6: FlowHire (NestJS + React Vite)
- **NestJS architecture.** Modules, controllers, services, guards, interceptors. Understand dependency injection.
- **Stripe Connect Custom:** Full control over connected account onboarding. Most complex Connect type — identity verification, capability management, payout scheduling all on you.
- **Function calling:** LLM decides which tools to use. Build a proper tool registry.

### Project 7: ContentForge (PayloadCMS + TanStack Router)
- **PayloadCMS again** but with TanStack Router (not Next.js App Router). Learn the differences.
- **Deep Razorpay + PayPal.** Not just basic checkout — subscriptions, refunds, disputes, multiple currencies.
- **Multi-provider AI:** Abstract over OpenAI, Claude, and others with a unified interface.

### Project 8: LaunchPad (NestJS + FastAPI + Next.js)
- **Multi-service architecture.** NestJS for main API, FastAPI for AI services, Next.js for frontend. Service communication patterns.
- **All payment gateways.** Every integration from previous projects, unified.
- **LLM orchestration.** Multi-step AI workflows, agent patterns, routing between models.

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

## Quick Start for Claude

When the user says anything like "let's continue", "what's next", "resume", or just starts a new session:

1. Read `progress.md`
2. Identify current project, phase, and feature
3. **Present understanding and plan before implementing anything**
4. Continue from where we left off
5. Update `progress.md` after completing any step
