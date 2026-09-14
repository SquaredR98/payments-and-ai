# Progress Tracker

> **Last Updated:** 2026-09-14
> **Last Action:** Session 17 — Custom edit views for Invoices, Payments, AuditLogs + customer journey doc

---

## Current State

- **Active Project:** Project 1 — PayMe
- **Current Phase:** Phase 3 — Implementation
- **Current Feature:** Feature 03 — Complete. All 3 collections built with hooks, access control, audit logging.
- **Blocked:** No

---

## Phase 1: Story Points — ALL COMPLETE

| # | Project | Story Points | Status |
|---|---------|-------------|--------|
| 1 | PayMe | `project-1-payme/story-points.md` | ✅ Complete |
| 2 | SubSync | `project-2-subsync/story-points.md` | ✅ Complete |
| 3 | PromptVault | `project-3-promptvault/story-points.md` | ✅ Complete |
| 4 | GigBoard | `project-4-gigboard/story-points.md` | ✅ Complete |
| 5 | DocuMind | `project-5-documind/story-points.md` | ✅ Complete |
| 6 | FlowHire | `project-6-flowhire/story-points.md` | ✅ Complete |
| 7 | ContentForge | `project-7-contentforge/story-points.md` | ✅ Complete |
| 8 | LaunchPad | `project-8-launchpad/story-points.md` | ✅ Complete |

---

## Project 1: PayMe — Feature Progress

| # | Feature (Epic) | Doc | Implementation | Status |
|---|---------------|-----|----------------|--------|
| 01 | Project Setup & PayloadCMS Configuration | ✅ Approved | ✅ Complete | ✅ Done |
| 01.5 | Theming, Layout System & Admin Shell Customization | ✅ Approved | ✅ Complete | ✅ Done |
| 02 | Authentication & User Management | ✅ Approved | ✅ Complete (Steps 1-11) | ✅ Done |
| 03 | Database Schema & Data Layer | ✅ Approved | ✅ Complete (Steps 1-9) | ✅ Done |
| 04 | Dashboard & Analytics | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 05 | Invoice Management (CRUD) | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 06 | Payment Link Generation | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 07 | Stripe Checkout Integration | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 08 | PayPal Integration | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 09 | PDF Invoice Generation | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 10 | Email Notifications | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 11 | Security & Compliance | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 12 | Error Monitoring & Logging | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 13 | Testing | ⬜ Not started | ⬜ Not started | ⬜ Pending |
| 14 | UI/UX Polish & Responsive Design | ⬜ Not started | ⬜ Not started | ⬜ Pending |

---

## Feature 01.5 — Complete

**Frontend (Session 4):**
- ✅ CSS variable overhaul (globals.css) — blue-tinted neutral palette
- ✅ ThemeProvider wired up (next-themes, system preference, class-based)
- ✅ Theme toggle component (Sun/Moon dropdown)
- ✅ Layout shells created (public-layout, auth-layout, dashboard-layout)
- ✅ Homepage redesigned (hero, features grid, CTA)

**Admin Shell (Sessions 5-6):**
- ✅ Custom Nav with NavWrapper (sidebar: logo, quick create, dashboard link, collection groups with Lucide icons, footer with profile + logout)
- ✅ AppActions topbar (dynamic page title/welcome + quick action icon buttons + theme toggle)
- ✅ Dashboard stat cards (users, media, invoices placeholder, revenue placeholder)
- ✅ CSS theme overrides (custom.scss) — blue-tinted elevation variables, dark mode, sticky topbar, hidden breadcrumbs
- ✅ AdminProvider (brand context)
- ✅ RoleBadgeCell, VerifiedBadgeCell
- ✅ All components refactored: CSS classes in custom.scss (BEM naming), Payload Link component for internal routes, zero inline styles

**Admin Polish (Session 7):**
- ✅ Custom create-first-user view — replaced Payload's default with branded version
- ✅ QuickAccess dashboard widget — replaces default CollectionCards with compact pill-style items
- ✅ Removed `admin.group` from Users and Media collections

**Component Restructure & Edit View (Session 8):**
- ✅ Restructured all admin components into folder/index pattern with colocated styles.css
- ✅ ListCreateButton — portal-based + button injected into search bar actions
- ✅ Edit/create view CSS overrides (doc-controls, save button, card forms, tabs, inputs)

**Document Context Bridge (Session 9):**
- ✅ DocumentBridgeContext in AdminProvider — reactive document data across component tree
- ✅ DocumentBridge component (beforeDocumentControls on Users)
- ✅ AppActions reads bridge data — reactive name, email subtitle, role badge, verification status

**Edit View Polish & UI Overrides (Session 10):**
- ✅ SidebarSave component — portal-based save button below sidebar card
- ✅ Login page redesign — split layout with brand panel
- ✅ custom.scss reorganization (13 sections with TOC)
- ✅ Full `--theme-success-*` palette override (8 stops, both themes)
- ✅ UI component overrides (checkboxes, radios, toasts, banners, modals, drawers, loading, error states)
- ✅ Theme persistence fix (`admin.theme: 'all'`)

---

## Feature 02 — Authentication & User Management (In Progress)

**Step 1-2: Users Collection & Auth Config (Session 4):**
- ✅ Users collection extended with profile fields (firstName, lastName, phone), business fields (businessName, taxId), address group, tabbed layout
- ✅ Auth config: tokenExpiration (7 days), verify (email HTML/subject), forgotPassword (email HTML/subject), maxLoginAttempts (5), lockTime (10 min)
- ✅ Access control: public create, owner-only read/update, admin-only delete
- ✅ Role field (admin/user) with admin-only update access
- ✅ Logo upload field (sidebar)

**Step 3-6: Auth Pages (Session 11):**
- ✅ Zod validation schemas (`src/lib/validations/auth.ts`)
- ✅ `(auth)` route group layout — server-side auth check, redirects authenticated users to `/dashboard`
- ✅ Registration page (`/register`) — RHF form, per-field Zod errors, password show/hide toggle
- ✅ Login page (`/login`) — RHF form, `?registered=true` success banner, lockout message
- ✅ Forgot password page (`/forgot-password`) — generic success (prevents email enumeration)
- ✅ Reset password page (`/reset-password`) — reads `?token=` via useSearchParams
- ✅ Verify email page (`/verify-email`) — three states: loading, success, error

**Step 7-8: Route Protection & Auth Provider (Session 11):**
- ✅ `(dashboard)` route group layout — server-side auth guard, redirects to `/login`
- ✅ Dashboard placeholder page — "Welcome, {firstName}!"
- ✅ AuthProvider (`src/providers/auth-provider.tsx`) — initialUser prop, login/logout/refresh
- ✅ useAuth hook (`src/hooks/use-auth.ts`)

**Steps 9-11: Settings Pages (Session 15):**
- ✅ Step 9: Profile settings — firstName, lastName, phone, email (disabled), PATCH /api/users/{id}
- ✅ Step 10: Business settings — businessName, taxId, address fields (street, city, state, zip, country select)
- ✅ Step 11: Security settings — change password (current + new + confirm), change email (new email + current password)
- ✅ Settings page with horizontal tab navigation (Profile | Business | Security)
- ✅ usePageHeader hook + PageHeaderContext for dynamic page titles in DashboardLayout header
- ✅ API layer: PATCH client method, updateProfile(), changePassword() endpoints

---

## Admin Shell Enhancements (Sessions 12-14)

**Custom Admin Auth Views (Session 12):**
- ✅ AdminLogin — custom login view replacing Payload's default, branded split layout
- ✅ AdminForgotPassword — custom forgot password view
- ✅ AdminResetPassword — custom reset password view
- ✅ Deleted LoginBranding and LoginFooter components (replaced by custom views)

**Custom List View (Sessions 13-14):**
- ✅ CollectionListView — generic reusable server+client component pair for all collections
- ✅ CollectionListControls — custom search bar (debounced), columns dropdown (toggle columns with checkmarks), filter dropdown with FilterBuilder
- ✅ FilterBuilder — custom filter UI with CustomSelect components (field/operator/value rows, add/clear/apply), builds Payload where clauses
- ✅ DataTable — reusable table with clickable sort headers (asc/desc/clear cycle), reads from useTableColumns and useListQuery
- ✅ Registered CollectionListView on Users and Media collections
- ✅ Deleted ListCreateButton (create button now built into CollectionListControls)
- ✅ Cleaned up custom.scss: removed old list controls/search/table CSS overrides (sections 4b-4d)

**Custom User Edit View (Session 13):**
- ✅ UserEditView — custom edit view with tabbed layout
- ✅ Tabs: Account, Business, Address, Activity, Preferences
- ✅ EditViewSidebar component
- ✅ NameCell — combined first+last name cell for list view

**Sidebar Nav Cleanup (Session 14):**
- ✅ Collapse button (PanelLeftClose) added to right side of sidebar header
- ✅ Expand button (PanelLeftOpen) in AppActions topbar — shows only when sidebar is collapsed
- ✅ Hidden Payload's default NavToggler (`.nav-toggler { display: none }`)
- ✅ Removed theme toggle from sidebar footer (already in AppActions topbar)
- ✅ Removed mobile close button from sidebar bottom
- ✅ Cleaned up unused imports (Sun, Moon, Hamburger, useTheme from NavClient)

**Dashboard Shell & Codebase Cleanup (Session 15):**
- ✅ Sticky sidebar (lg:sticky lg:top-0 lg:h-screen)
- ✅ Active nav link fix — exact match for Dashboard route
- ✅ Coming Soon placeholders for invoices, links, payments subroutes
- ✅ Deleted 12 unused UI components (avatar, badge, card, dialog, select, sheet, skeleton, switch, table, tabs, textarea, toast)
- ✅ Deleted dead my-route endpoint
- ✅ Replaced inline SVGs with Lucide icons across ListControls (6 SVGs), FilterBuilder (3 SVGs), QuickAccess (3 SVGs)
- ✅ Created shared BrandIcon component, replaced duplicated logo SVGs in AdminLogin, AdminForgotPassword, AdminResetPassword
- ✅ Extracted admin graphic (Icon.tsx, Logo.tsx) inline styles to colocated styles.css

**Admin Polish (Session 15):**
- ✅ Inter font antialiasing (-webkit-font-smoothing: antialiased) on admin body
- ✅ Override --style-radius-s/m to 8px for consistent button border-radius
- ✅ Brand blue CTA styling for all admin auth FormSubmit buttons (section 6c in custom.scss)
- ✅ Removed duplicate BrandIcon from admin login brand panel (kept only on form column)

**Custom Collection Edit Views (Session 17):**
- ✅ InvoiceEditView — full edit view with Form/DocumentBridge, 3 tabs (Details, Financials, Payment), InvoiceSidebar (status badge, invoice number, total, payment link copy, owner, dates)
- ✅ PaymentEditView — read-only, blocked create ("Payments Cannot Be Created Manually"), transaction details, payer info, gateway response JSON
- ✅ AuditLogEditView — read-only, blocked create ("Audit Logs Cannot Be Created Manually"), event details, request context, previous/new data JSON
- ✅ All 3 registered in collection configs with import map
- ✅ Fixed TS type issues: Payload field component admin prop uses `as NumberFieldClient`/`DateFieldClient`/etc. for intersection type compatibility
- ✅ Fixed UserEditView/InvoiceEditView `docID` type mismatch (`undefined` → `null` coalescing)

---

## Feature 03 — Database Schema & Data Layer (Complete)

**Collections Built (Session 16):**
- ✅ Invoices — tab layout (Details/Financials/Payment), compound unique index (owner + invoiceNumber), field indexes, sidebar fields
- ✅ Payments — relationship to invoices, gateway/status fields, afterChange hook syncs invoice status
- ✅ AuditLogs — action/entity/entityId fields, JSON data snapshots, fully locked (no create/update/delete)

**Hooks (Session 16):**
- ✅ setOwner, guardStatus, generateInvoiceNumber (resolveNextInvoiceNumber helper), calculateTotals, generatePaymentLink, preventHardDelete, logInvoiceChange, syncInvoiceStatus, logAuditEvent utility

**Customer Journey Doc (Session 17):**
- ✅ `learning-roadmap/project-1-payme/customer-journey.md` — all user types, journeys, flow diagrams, feature mapping

---

## Design Implementation Tracker

- ✅ Phase 0 audit complete — color tokens match, component sizing gaps identified
- ⬜ Decision pending: Input height (42px vs 32px), Button height (46px vs 36px) — see `payme/.claude/design-implementation.md`

---

## Projects 2-8: Not Started

Feature tracking tables will be added when each project becomes active.

---

## Next Action

**Feature 03 is complete. Custom edit views done.** Next up: **Feature 04 — Dashboard & Analytics**.

**Remaining codebase cleanup (can be done alongside Feature 04):**
- Folder restructure: 13 components not in folder/index.tsx pattern (theme-toggle, public-layout, dashboard-layout, settings components, AdminProvider, cell components, providers, contexts)
- Extract CSS from inline Tailwind: 4 files with zero CSS (homepage page.tsx, public-layout.tsx, dashboard-layout.tsx, theme-toggle.tsx)

---

## Session Log

| Date | Session | What Was Done |
|------|---------|---------------|
| 2026-08-25 | Session 1 | Planned all 8 projects, created story-points.md for all 8 projects, created CLAUDE.md and progress.md |
| 2026-08-25 | Session 2 | Created feature-01-project-setup.md, feature-02-authentication.md |
| 2026-08-25 | Session 3 | Implemented Feature 01: Zod 4, Tailwind v4, shadcn/ui (17 components), env validation, admin branding, folder scaffolding |
| 2026-08-25 | Session 4 | Feature 02 Steps 1-2 (Users collection + auth config). Started Feature 01.5 frontend theming. |
| 2026-08-25 | Session 5 | Feature 01.5 admin shell: custom Nav, AppActions topbar, Dashboard stat cards, CSS theme overrides |
| 2026-08-26 | Session 6 | Feature 01.5 cleanup: BEM refactor, Payload Link component, removed inline styles |
| 2026-08-26 | Session 7 | Custom create-first-user view, QuickAccess dashboard widget, removed collection groups |
| 2026-08-27 | Session 8 | Component folder/index restructure, ListCreateButton, edit view CSS overrides |
| 2026-08-27 | Session 9 | DocumentBridgeContext, DocumentBridge component, reactive AppActions header |
| 2026-08-29 | Session 10 | SidebarSave portal, login redesign, custom.scss reorg, full theme palette override, UI component overrides, theme persistence fix |
| 2026-09-01 | Session 11 | Feature 02 Steps 3-8: all auth pages (register, login, forgot-password, reset-password, verify-email), auth guard layouts, AuthProvider + useAuth hook, dashboard placeholder |
| 2026-09-04 | Session 12 | Custom admin auth views (AdminLogin, AdminForgotPassword, AdminResetPassword), deleted LoginBranding/LoginFooter. Design audit (token alignment + component sizing gaps) |
| 2026-09-05 | Session 13 | Custom list view (CollectionListView, DataTable, ListControls, FilterBuilder, CustomSelect), UserEditView with tabbed layout, NameCell, SCSS cleanup |
| 2026-09-06 | Session 14 | Sidebar nav cleanup: collapse/expand buttons, hide default NavToggler, remove theme toggle from sidebar, remove mobile close button. Committed all outstanding components. |
| 2026-09-13 | Session 15 | Feature 02 Steps 9-11 complete (settings pages with horizontal tabs, usePageHeader hook, API layer). Dashboard shell: sticky sidebar, active link fix, Coming Soon pages. Codebase cleanup: deleted 12 unused UI components + dead route, replaced inline SVGs with Lucide/BrandIcon (12 replacements across 7 files), extracted admin graphic styles. Admin polish: font antialiasing, global 8px button radius, brand blue CTAs, removed duplicate logo from login panel. |
| 2026-09-14 | Session 16 | Feature 03 complete: Database Schema & Data Layer. Created feature doc. Built 3 collections (Invoices, Payments, AuditLogs) with full schema, hooks (generateInvoiceNumber, calculateTotals, generatePaymentLink, preventHardDelete, setOwner, guardStatus, syncInvoiceStatus, logInvoiceChange), access control (owner-scoped, admin override, read-only for payments/audit), audit logging utility (fire-and-forget logAuditEvent). Registered CollectionListView on all 3 new collections. Generated types. |
| 2026-09-14 | Session 17 | Custom edit views for all 3 new collections. InvoiceEditView (full edit with 3 tabs: Details/Financials/Payment, sidebar with status badge/invoice number/total/payment link copy). PaymentEditView (read-only, blocked create, displays transaction details/payer info/gateway response JSON). AuditLogEditView (read-only, blocked create, displays event details/request context/data diff JSON). Customer journey documentation. Fixed TS type issues with Payload field component admin prop intersection types. Fixed UserEditView docID type mismatch. |
