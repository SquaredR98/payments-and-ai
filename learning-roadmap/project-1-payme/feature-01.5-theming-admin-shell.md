# Feature 01.5: Complete Admin Panel Redesign & Theming

> **Project:** PayMe — Personal Invoice & Payment Link Generator
> **Epic:** 1.5 of 14 (inserted between Setup and Auth)
> **Phase:** Feature Documentation
> **Status:** Draft — Awaiting Approval

---

## Table of Contents

1. [What We Are Building](#what-we-are-building)
2. [Why We Are Building It This Way](#why-we-are-building-it-this-way)
3. [Architecture Overview](#architecture-overview)
4. [What Is Already Done](#what-is-already-done)
5. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
   - [Step 1: Admin CSS Theme (custom.scss)](#step-1-admin-css-theme-customscss)
   - [Step 2: Custom Admin Navigation (Nav)](#step-2-custom-admin-navigation-nav)
   - [Step 3: Custom Admin Header Bar](#step-3-custom-admin-header-bar)
   - [Step 4: Admin Theme Provider](#step-4-admin-theme-provider)
   - [Step 5: Custom Dashboard View](#step-5-custom-dashboard-view)
   - [Step 6: Custom List View Components](#step-6-custom-list-view-components)
   - [Step 7: Edit View Redesign (Users Collection)](#step-7-edit-view-redesign-users-collection)
   - [Step 8: Custom Edit View Enhancements](#step-8-custom-edit-view-enhancements)
   - [Step 9: Custom Field Components (Cells & Badges)](#step-9-custom-field-components-cells--badges)
   - [Step 10: Login Page Branding](#step-10-login-page-branding)
   - [Step 11: Wire Everything into payload.config.ts](#step-11-wire-everything-into-payloadconfigts)
6. [Folder Structure (After This Feature)](#folder-structure-after-this-feature)
7. [Common Mistakes & Pitfalls](#common-mistakes--pitfalls)
8. [Production Considerations](#production-considerations)
9. [Verification Checklist](#verification-checklist)
10. [References](#references)

---

## What We Are Building

A **complete visual overhaul** of the PayloadCMS admin panel — turning it from a generic gray CMS into a polished, branded SaaS-style administration dashboard that looks like it was custom-built for a paying client. Every page the admin sees will feel intentional and cohesive with the PayMe frontend.

### The Target Look

Inspired by modern SaaS admin dashboards (Linear, Vercel, Stripe):

```
┌─────────────────────┬──────────────────────────────────────────────────────────┐
│                     │  Documents                                     GitHub ↗ │
│  [Icon] PayMe Admin │──────────────────────────────────────────────────────────│
│                     │                                                          │
│  [+ Quick Create]   │  ┌─────────────────────┐  ┌─────────────────────┐       │
│                     │  │ Total Revenue   ↗12% │  │ New Customers  ↘20% │       │
│  LayoutDashboard    │  │ $1,250.00           │  │ 1,234               │       │
│  FileText Invoices  │  │ Trending up ↗       │  │ Needs attention     │       │
│  BarChart3 Analytics│  └─────────────────────┘  └─────────────────────┘       │
│  FolderOpen Projects│                                                          │
│  Users Team         │  ┌─────────────────────┐  ┌─────────────────────┐       │
│                     │  │ Active Accounts     │  │ Growth Rate     ↗4% │       │
│  Documents          │  │ 45,678         ↗12% │  │ 4.5%               │       │
│  Database Library   │  │ Strong retention ↗  │  │ Meets projections   │       │
│  ClipboardList Rpts │  └─────────────────────┘  └─────────────────────┘       │
│  PenTool Assistant  │                                                          │
│                     │  ┌──────────────────────────────────────────────┐       │
│  ···  More          │  │ Total Visitors                               │       │
│                     │  │ [3 months] [30 days] [7 days]               │       │
│  Settings           │  │ ▁▃▅▇▅▃▁▃▅▇▆▅▃▁▃▅▇▅▃▁▃▅▇▆▅▃▁ (chart)      │       │
│  LogOut             │  └──────────────────────────────────────────────┘       │
└─────────────────────┴──────────────────────────────────────────────────────────┘

(All sidebar icons are Lucide React components — clean, monoline SVGs)
```

### What Gets Redesigned

| Area | Default Payload | Our Custom Version |
|------|----------------|-------------------|
| **Sidebar Nav** | Plain gray list, collection names only | Branded sidebar with logo, Lucide icons per item, section labels, active state with blue indicator bar, Quick Create button, bottom-aligned settings & logout |
| **Header Bar** | Breadcrumbs + locale selector | Clean breadcrumb + user greeting + theme toggle (dark/light) + notifications placeholder |
| **Dashboard** | Grid of collection cards with doc counts | Stat cards with trend indicators (revenue, customers, invoices, growth), charts section, quick action buttons |
| **List Views** | Plain table on white bg | Branded header banner with collection stats, styled table with row hover, role/status badges in cells instead of plain text |
| **Edit Views (Users)** | Flat list of fields, no visual grouping | Tabbed layout: "Profile" / "Business" / "Address" tabs, collapsible sections, descriptions, sidebar role badge |
| **Edit Views (General)** | Form fields on white bg | Styled save button (branded blue), blue-tinted inputs and focus rings, cleaner spacing via CSS |
| **Login Page** | Generic form | Branded login with PayMe logo, blue accent, tagline |
| **Forms & Inputs** | Gray borders, gray focus rings | Blue-tinted borders, brand blue focus rings, blue-tinted surfaces |
| **Buttons** | Dark gray primary | Brand blue primary, subtle hover states |
| **Icons** | No icons / generic | Lucide React icons throughout (sidebar, dashboard, stat cards, quick actions) |
| **Dark Mode** | Payload default dark | Dark blue-black surfaces matching frontend dark mode |

---

## Why We Are Building It This Way

### Why not just CSS?

We tried pure CSS overrides in `custom.scss` during the last session. It broke things — Payload's internal selectors are fragile, and CSS can't change layout structure, add new UI elements, or alter component behavior. CSS is good for **tinting** the existing components (border colors, backgrounds, focus rings). For anything structural — sidebar layout, dashboard content, field badges — we need custom components.

**Our approach:** CSS variables for global color tinting (affects all built-in components at once) + custom component slots for structural changes (Nav, Dashboard, field cells).

### Why use Payload's component slot system?

PayloadCMS designed its admin panel to be overridden at specific extension points:

- **Root components** — `Nav`, `header`, `providers`, `beforeDashboard`, `afterDashboard`, `beforeLogin`, `afterLogin`, `logout.Button`
- **Collection components** — `beforeList`, `afterList`, `beforeListTable`, `afterListTable`, `edit.SaveButton`, `views.list`, `views.edit`
- **Field components** — `Field` (edit view), `Cell` (list view), `Label`, `Description`, `Error`
- **Full view replacement** — `views.dashboard`, `views.account`, and custom routes

These are **stable public APIs**. They won't break between Payload minor versions. Internal CSS class names like `.nav__link-label` or `.btn--style-primary` might change — but the component slot system is designed for exactly this use case.

### Why Server Components for data + Client Components for interactivity?

Payload's admin runs inside Next.js App Router. Custom components default to **Server Components** — they receive the `payload` instance directly and can query the database with zero HTTP overhead. Interactive components (sidebar active state, theme toggle, hamburger menu) need `'use client'`.

Our pattern:
- **Server Component** fetches data (collection counts, user info, nav groups) and passes it as props
- **Client Component** handles rendering and interactivity (click handlers, active route detection, animations)

This keeps the admin fast — data fetching happens on the server, not via API calls from the browser.

### Why override CSS variables instead of class-name selectors?

Payload's entire color system runs on `--theme-elevation-*` CSS variables (21 levels from 0 to 1000) plus `--theme-success-*`, `--theme-error-*`, and `--theme-warning-*` color palettes. Every built-in component references these variables.

By overriding just the variables, we re-skin **all** built-in components at once — buttons, inputs, cards, tables, modals, drawers — without touching a single selector. This is stable across Payload versions because the variable names are part of the public API.

---

## Architecture Overview

### Component Replacement Map

```
payload.config.ts
│
├── admin.components
│   ├── Nav ──────────────────▶ Custom branded sidebar (Server → Client)
│   ├── header[] ─────────────▶ Top bar: greeting + theme toggle (Client)
│   ├── providers[] ──────────▶ AdminProvider: brand context (Client)
│   ├── beforeDashboard[] ────▶ Stat cards + charts (Server)
│   ├── beforeLogin[] ────────▶ Branded tagline above login form (Server)
│   ├── graphics.Logo ────────▶ PayMe logo on login (existing)
│   ├── graphics.Icon ────────▶ Sidebar icon (existing)
│   └── logout.Button ────────▶ Styled logout button (Client)
│
├── collections.Users.admin.components
│   ├── beforeList[] ─────────▶ Users stats banner (Server)
│   ├── edit.SaveButton ──────▶ Blue branded save button (Server)
│   └── fields.role.Cell ─────▶ Role badge in list table (Client)
│
├── collections.Media.admin.components
│   └── beforeList[] ─────────▶ Media stats banner (Server)
│
└── custom.scss ──────────────▶ CSS variable overrides (blue-tinted palette)
```

### How Admin Components Get Data

```
┌─────────────────────────────────────────────────────┐
│  Server Component (e.g., Dashboard)                  │
│                                                       │
│  Props received automatically from Payload:           │
│  ├── payload  (Local API instance — query anything)   │
│  ├── user     (current admin user)                    │
│  ├── i18n     (translations)                          │
│  ├── locale   (current locale)                        │
│  └── permissions (what user can access)               │
│                                                       │
│  const userCount = await payload.count({              │
│    collection: 'users'                                │
│  })                                                   │
│                                                       │
│  return <StatCard count={userCount} />                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Client Component (e.g., Nav sidebar)                │
│                                                       │
│  Hooks from @payloadcms/ui:                           │
│  ├── useConfig()   → admin routes, collection config  │
│  ├── useAuth()     → current user, token, logout      │
│  ├── useNav()      → navOpen, setNavOpen, navRef      │
│  ├── useTranslation() → i18n instance                 │
│  ├── useField()    → field value, setValue (in forms)  │
│  └── usePreferences() → user's saved UI prefs         │
│                                                       │
│  Next.js hooks:                                       │
│  └── usePathname() → current URL for active state     │
└─────────────────────────────────────────────────────┘
```

### CSS Cascade

```
1. Payload's base styles      (@payloadcms/next/css)
2. Payload's component styles  (component-level .scss)
3. Your custom.scss            (src/app/(payload)/custom.scss)  ← We override here
   ↓
   Overrides --theme-elevation-* variables
   Overrides --theme-success-* variables (brand blue)
   ↓
   All built-in components pick up the new colors automatically
```

---

## What Is Already Done

These items were completed in previous sessions and do NOT need to be re-implemented:

| Item | File | Status |
|------|------|--------|
| Frontend CSS variable palette (blue-tinted oklch) | `globals.css` | Done |
| ThemeProvider (next-themes, class-based) | `providers/theme-provider.tsx` | Done |
| Theme toggle component (Sun/Moon) | `components/theme-toggle.tsx` | Done |
| Frontend layout wired (ThemeProvider, Toaster) | `(frontend)/layout.tsx` | Done |
| Public layout shell | `components/layouts/public-layout.tsx` | Done |
| Auth layout shell | `components/layouts/auth-layout.tsx` | Done |
| Dashboard layout shell | `components/layouts/dashboard-layout.tsx` | Done |
| Homepage redesigned | `(frontend)/page.tsx` | Done |
| Admin Logo graphic | `admin/graphics/Logo.tsx` | Done |
| Admin Icon graphic | `admin/graphics/Icon.tsx` | Done |
| Admin meta (title, favicon) | `payload.config.ts` | Done |
| Users collection (auth, profile fields, access control) | `collections/Users.ts` | Done |

**Also created (needs testing/fixing):**
- `admin/components/Nav.tsx` — Server component (scaffolded, not tested)
- `admin/components/NavClient.tsx` — Client component (scaffolded, not tested)
- `payload.config.ts` — Nav wired as `'/admin/components/Nav#AdminNav'`

---

## Step-by-Step Implementation Guide

### Step 1: Admin CSS Theme (custom.scss)

**What:** Override Payload's CSS custom properties to apply our blue-tinted color palette to ALL built-in admin components — every form, button, input, table, modal, and card inherits the new colors without touching individual selectors.

**Why this is Step 1:** This is the highest-impact, lowest-risk change. One file of CSS variable overrides instantly re-skins the entire admin panel. Even if we do nothing else, the admin will already feel branded after this step.

**File:** `src/app/(payload)/custom.scss`

**What to override:**

Payload's color system uses `--theme-elevation-*` variables (0-1000) for all neutrals, where 0 is the base background and 1000 is the strongest foreground. We add a subtle blue tint to these. Payload also uses `--theme-success-*` for accent colors (buttons, toggles, active states) — we replace these with our brand blue.

```scss
/* ── Light Theme ─────────────────────────────────── */
:root {
  /* Elevation: blue-tinted neutrals (hue ~220) */
  --theme-elevation-0:    hsl(220, 30%, 99%);   /* Page background */
  --theme-elevation-50:   hsl(220, 25%, 97%);   /* Subtle raised bg */
  --theme-elevation-100:  hsl(220, 20%, 95%);   /* Card bg, inputs */
  --theme-elevation-150:  hsl(220, 18%, 92%);
  --theme-elevation-200:  hsl(220, 15%, 88%);   /* Borders, dividers */
  --theme-elevation-250:  hsl(220, 12%, 83%);
  --theme-elevation-300:  hsl(220, 10%, 76%);   /* Muted text */
  --theme-elevation-350:  hsl(220, 10%, 68%);
  --theme-elevation-400:  hsl(220, 10%, 60%);
  --theme-elevation-450:  hsl(220, 10%, 52%);
  --theme-elevation-500:  hsl(220, 12%, 44%);   /* Secondary text */
  --theme-elevation-550:  hsl(220, 14%, 38%);
  --theme-elevation-600:  hsl(220, 16%, 32%);
  --theme-elevation-650:  hsl(220, 18%, 26%);
  --theme-elevation-700:  hsl(220, 20%, 22%);
  --theme-elevation-750:  hsl(220, 22%, 18%);
  --theme-elevation-800:  hsl(220, 24%, 14%);
  --theme-elevation-850:  hsl(220, 26%, 11%);
  --theme-elevation-900:  hsl(220, 28%, 8%);
  --theme-elevation-950:  hsl(220, 30%, 5%);
  --theme-elevation-1000: hsl(220, 32%, 3%);    /* Headings, primary text */

  /* Accent → brand blue #2563eb */
  --theme-success-500: #2563eb;
  --theme-success-600: #1d4ed8;
  --theme-success-650: #1e40af;

  /* Borders & inputs */
  --theme-border-color: hsl(220, 15%, 88%);
  --theme-input-bg: hsl(220, 20%, 99%);
}

/* ── Dark Theme ──────────────────────────────────── */
html[data-theme='dark'] {
  /* Elevation: dark blue-black */
  --theme-elevation-0:    hsl(222, 30%, 7%);    /* Page bg */
  --theme-elevation-50:   hsl(222, 25%, 9%);
  --theme-elevation-100:  hsl(222, 22%, 12%);
  --theme-elevation-150:  hsl(222, 20%, 15%);
  --theme-elevation-200:  hsl(222, 18%, 18%);   /* Borders */
  --theme-elevation-250:  hsl(222, 16%, 22%);
  --theme-elevation-300:  hsl(222, 14%, 28%);
  --theme-elevation-350:  hsl(222, 12%, 35%);
  --theme-elevation-400:  hsl(222, 10%, 42%);
  --theme-elevation-450:  hsl(222, 8%, 50%);
  --theme-elevation-500:  hsl(222, 8%, 58%);    /* Muted text */
  --theme-elevation-550:  hsl(222, 8%, 65%);
  --theme-elevation-600:  hsl(222, 8%, 72%);
  --theme-elevation-650:  hsl(222, 8%, 78%);
  --theme-elevation-700:  hsl(222, 10%, 82%);
  --theme-elevation-750:  hsl(222, 12%, 86%);
  --theme-elevation-800:  hsl(222, 14%, 89%);
  --theme-elevation-850:  hsl(222, 16%, 92%);
  --theme-elevation-900:  hsl(222, 18%, 94%);
  --theme-elevation-950:  hsl(222, 20%, 96%);
  --theme-elevation-1000: hsl(222, 22%, 98%);   /* Primary text */

  /* Accent → lighter blue for contrast */
  --theme-success-500: #3b82f6;
  --theme-success-600: #2563eb;
  --theme-success-650: #1d4ed8;

  /* Borders & inputs */
  --theme-border-color: hsl(222, 18%, 18%);
  --theme-input-bg: hsl(222, 25%, 9%);
}
```

**What this changes automatically:**
- All backgrounds (page, cards, modals, drawers) → subtle blue tint
- All text → blue-tinted neutrals instead of pure gray
- All borders → blue-tinted
- All buttons (primary) → brand blue instead of dark gray
- All focus rings → brand blue
- All active/selected states → brand blue
- All toggles, checkboxes → brand blue
- Dark mode → dark blue-black instead of pure black

**What this does NOT change (needs custom components):**
- Sidebar layout/structure → Step 2
- Header content → Step 3
- Dashboard content → Step 5
- Cell rendering (badges) → Step 8

---

### Step 2: Custom Admin Navigation (Nav)

**What:** Replace Payload's default sidebar with a branded navigation that matches the reference screenshot — logo header, Quick Create button, icon-based links, section labels, active state with accent color.

**File:** `src/admin/components/Nav.tsx` (Server Component) + `src/admin/components/NavClient.tsx` (Client Component)

**Why two files:** The Server Component (`Nav.tsx`) receives Payload's `ServerProps` (including `payload`, `permissions`, `visibleEntities`, `i18n`), computes the grouped nav items, and passes them to the Client Component (`NavClient.tsx`) which handles interactivity (active state detection, mobile hamburger toggle, click navigation).

**Layout spec:**

```
┌────────────────────────────┐
│  [PayMe Icon] PayMe Admin  │  ← Logo + brand name, links to /admin
│────────────────────────────│
│  [+ Quick Create ──────] ✉ │  ← Button + notification icon
│────────────────────────────│
│  LayoutDashboard  Dashboard│  ← Lucide icon + label
│  FileText  Invoices        │  ← Future collections auto-appear
│  BarChart3  Analytics      │
│  FolderOpen  Projects      │
│  Users  Team               │
│                            │
│  Documents ────────────────│  ← Section label (from admin.group)
│  Database  Data Library    │
│  ClipboardList  Reports    │
│  PenTool  Word Assistant   │
│                            │
│  MoreHorizontal  More ─────│  ← Collapse overflow
│                            │
│────────────────────────────│
│  Settings  Settings        │  ← Bottom-aligned
│  LogOut  Logout            │
└────────────────────────────┘
```

**Icons:** We use `lucide-react` (already installed as a dependency of shadcn/ui). Lucide components render as inline SVGs — they require zero CSS framework, so they work in admin components where Tailwind is unavailable. Each collection slug maps to a Lucide icon:

```typescript
import { Users, Image, FileText, CreditCard, LayoutDashboard, Settings, LogOut, ... } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  users: Users,
  media: Image,
  invoices: FileText,
  payments: CreditCard,
  'audit-logs': ClipboardList,
}
```

**Active state:** Current page link gets a tinted background (`rgba(37, 99, 235, 0.08)`) and brand blue text + icon color. A 3px-wide accent bar (brand blue) appears on the left edge.

**Key implementation details:**

1. **Read collections dynamically** from `useConfig()` — new collections auto-appear without code changes
2. **Group by `admin.group`** — collections with the same `admin.group` string are grouped under a section label. Collections without a group go under a default section.
3. **Lucide icon mapping** — map collection slugs to Lucide icon components. Unknown slugs get `<FolderOpen />` as fallback. Icons rendered at `size={18}` with `strokeWidth={1.75}`.
4. **Active detection** — use `usePathname()` and compare against `formatAdminURL({ adminRoute, path: '/collections/${slug}' })`
5. **Mobile** — use `useNav()` hook for `navOpen`/`setNavOpen`, render Payload's `Hamburger` component for the close button
6. **Logout** — render Payload's `<Logout />` component in the footer (with Lucide `LogOut` icon prepended)
7. **Quick Create** — links to most recently used collection's create page, or shows a dropdown of all collections. Uses Lucide `Plus` icon.
8. **Style with inline styles** — Tailwind is NOT available in admin. Use CSS variables (`var(--theme-elevation-*)`) for theme-aware colors so light/dark mode works automatically.

**Available Payload hooks:**
- `useConfig()` → collections list, admin routes
- `useNav()` → `navOpen`, `setNavOpen`, `navRef`, `hydrated`
- `useTranslation()` → `i18n` for label translation
- `useAuth()` → current user (for greeting)
- `usePathname()` → current URL (from next/navigation)

**Available Payload components:**
- `<Link>` from `@payloadcms/ui` — Next.js Link wrapper
- `<Logout>` from `@payloadcms/ui` — handles logout logic
- `<Hamburger>` from `@payloadcms/ui` — mobile menu icon
- `<NavGroup>` from `@payloadcms/ui` — collapsible group (persists open/closed state to user preferences)

**Available utilities:**
- `formatAdminURL({ adminRoute, path })` from `payload/shared` — builds admin URLs
- `groupNavItems(entities, permissions, i18n)` from `@payloadcms/ui/shared` — groups entities by `admin.group`
- `EntityType.collection` / `EntityType.global` from `@payloadcms/ui/shared`

---

### Step 3: Custom Admin Header Bar

**What:** Add a top bar across all admin pages with user greeting, theme toggle, and contextual info.

**File:** `src/admin/components/Header.tsx` (Client Component)

**Why client:** Needs `useAuth()` for user info and interactive theme toggle button.

**Layout spec:**

```
┌──────────────────────────────────────────────────────────────┐
│  Welcome, {firstName}                    [🌙 Dark] [👤 You]  │
└──────────────────────────────────────────────────────────────┘
```

**Important:** This renders **above** Payload's built-in header (which shows breadcrumbs, save button, etc.). It should be a thin, subtle bar — not competing with Payload's header.

**Key implementation details:**

1. Use `useAuth()` to get user's `firstName` or fall back to `email`
2. Theme toggle: read current theme from `document.documentElement.getAttribute('data-theme')`, toggle between `'light'` and `'dark'`. Payload handles persistence in `payload-preferences`.
3. Profile link: navigate to `/admin/collections/users/${user.id}`
4. Style with inline styles + Payload CSS variables
5. Keep it minimal — thin bar, small font, muted colors

---

### Step 4: Admin Theme Provider

**What:** Wrap the entire admin in a context provider that supplies brand constants to all custom components.

**File:** `src/admin/components/AdminProvider.tsx` (Client Component)

**What it provides:**

```typescript
interface AdminBrandContext {
  brandName: string        // 'PayMe'
  brandColor: string       // '#2563eb'
  brandColorMuted: string  // 'rgba(37, 99, 235, 0.08)'
}
```

**Why:** Instead of hardcoding `'#2563eb'` in every custom component, they all call `useAdminBrand()` and get the color from context. If we ever rebrand, one change propagates everywhere.

**Implementation:** Simple React context + provider wrapping `{children}`. Payload passes the entire admin UI as children to providers.

---

### Step 5: Custom Dashboard View

**What:** Replace the default dashboard with a branded welcome page showing stat cards with trend indicators and quick actions — matching the reference screenshot.

**File:** `src/admin/components/Dashboard.tsx` (Server Component)

**Why server:** Needs `payload.count()` to query collection stats directly.

**Layout spec:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Welcome back, {firstName}                                         │
│  Here's your PayMe admin overview.                                 │
│                                                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐              │
│  │ [Users]              │  │ [Image]              │              │
│  │ Total Users     ↗12% │  │ Media Files          │              │
│  │ 42                   │  │ 156                   │              │
│  │ Active accounts      │  │ Storage overview      │              │
│  └──────────────────────┘  └──────────────────────┘              │
│                                                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐              │
│  │ [FileText]           │  │ [DollarSign]         │              │
│  │ Invoices             │  │ Revenue              │              │
│  │ Coming Soon          │  │ Coming Soon           │              │
│  │ Feature 05           │  │ Feature 07            │              │
│  └──────────────────────┘  └──────────────────────┘              │
│                                                                    │
│  Quick Actions                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ [Plus] User  │  │ [Plus] Upload│  │ [Book] Docs  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

All icons are Lucide React components (`Users`, `Image`, `FileText`, `DollarSign`, `Plus`, `BookOpen`, `TrendingUp`, `TrendingDown`).

**Stat card anatomy (from reference screenshot):**

```
┌────────────────────────────────────┐
│  Label (muted)           ↗ +12.5% │  ← Trend badge (green/red)
│  $1,250.00                         │  ← Large bold number
│                                     │
│  Trending up this month ↗          │  ← Description + trend icon
│  Visitors for the last 6 months    │  ← Subtext (muted)
└────────────────────────────────────┘
```

**Key implementation details:**

1. Registered via `admin.components.beforeDashboard` — renders above Payload's default collection cards
2. Use `payload.count({ collection: 'users' })` and `payload.count({ collection: 'media' })` for live stats
3. Get user from `payload.auth({ headers: await import('next/headers').then(m => m.headers()) })`
4. "Coming Soon" cards for features not yet built (invoices, revenue) — shows vision/roadmap
5. Quick action buttons link to `/admin/collections/{slug}/create`
6. Style stat cards with inline styles: white card bg (`var(--theme-elevation-100)`), subtle border, rounded corners
7. Trend badges: green for positive, red for negative (hardcoded for now since we don't have historical data yet — these become real when invoices/payments are implemented)
8. 2-column grid on desktop, 1-column on mobile

---

### Step 6: Custom List View Components

**What:** Add branded headers above collection list views with stats and description, plus styled empty states.

**Files:**
- `src/admin/components/UsersListBanner.tsx` (Server Component)
- `src/admin/components/MediaListBanner.tsx` (Server Component)

**Layout spec (Users list):**

```
┌──────────────────────────────────────────────────────────────┐
│  [Users icon] Users Management                               │
│  Manage registered users, their roles, and account status.   │
│                                                               │
│  Total: 42 users  •  Admins: 3  •  Verified: 38             │
└──────────────────────────────────────────────────────────────┘
  ┌ Payload's list table below ───────────────────────────────┐
  │ Email         | First Name | Last Name | Role     | ...   │
  │ john@ex.com   | John       | Doe       | [Admin]  | ...   │  ← Blue badge
  │ jane@ex.com   | Jane       | Smith     | [User]   | ...   │  ← Gray badge
  └───────────────────────────────────────────────────────────┘
```

Banner icon uses Lucide `Users` component. Media banner uses Lucide `Image`.

**Key implementation details:**

1. Register via `collections.Users.admin.components.beforeList`
2. Use `payload.count()` for stats
3. For Users: show total count, admin count (`where: { role: { equals: 'admin' } }`), verified count (`where: { _verified: { equals: true } }`)
4. For Media: show total count, total file sizes if available
5. Styled card with subtle border and blue-tinted background
6. These are enhancements — the list table itself works fine with CSS theming from Step 1

---

### Step 7: Edit View Redesign (Users Collection)

**What:** Reorganize the Users collection edit form from a flat field list into a tabbed, well-structured layout that feels like a polished profile editor — not a generic CMS form.

**Why:** The current Users edit page renders all fields (firstName, lastName, phone, businessName, taxId, address group, logo) as a flat vertical list. It's functional but doesn't communicate structure. A freelancer looking at their profile should see clear sections: personal info, business details, address. Payload's built-in `tabs`, `collapsible`, and `group` field types let us restructure the form layout purely through collection config — no custom components needed for this.

**File:** `src/collections/Users.ts` (modify existing)

**Current structure (flat):**

```
[firstName] [lastName]     ← row
[phone]                     ← standalone
[businessName]              ← standalone
[taxId]                     ← standalone
[address]                   ← group (street, city/state, zip/country)
[logo]                      ← upload
                            SIDEBAR: [role]
```

**Target structure (tabbed):**

```
┌─────────────────────────────────────────────────────────────┐
│  [Profile]  [Business]  [Address]                   SIDEBAR │
│─────────────────────────────────────────────────── ┌───────┐│
│                                                     │ Role  ││
│  Profile tab:                                       │[Admin]││
│  ┌──────────────┐ ┌──────────────┐                 │       ││
│  │ First Name   │ │ Last Name    │                 │ Logo  ││
│  └──────────────┘ └──────────────┘                 │[Upload]│
│  ┌─────────────────────────────────┐               │       ││
│  │ Phone                           │               └───────┘│
│  └─────────────────────────────────┘                        │
│                                                              │
│  Business tab:                                               │
│  ┌─────────────────────────────────┐                        │
│  │ Business Name                   │                        │
│  │ Appears on invoices             │                        │
│  └─────────────────────────────────┘                        │
│  ┌─────────────────────────────────┐                        │
│  │ Tax ID / GST / VAT Number       │                        │
│  │ Your tax identification number  │                        │
│  └─────────────────────────────────┘                        │
│                                                              │
│  Address tab:                                                │
│  ┌─────────────────────────────────┐                        │
│  │ Street Address                  │                        │
│  └─────────────────────────────────┘                        │
│  ┌──────────────┐ ┌──────────────┐                          │
│  │ City         │ │ State        │                          │
│  └──────────────┘ └──────────────┘                          │
│  ┌──────────────┐ ┌──────────────┐                          │
│  │ ZIP Code     │ │ Country      │                          │
│  └──────────────┘ └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**How to implement (collection config only — no custom components):**

Payload supports a `tabs` field type that renders tabbed sections in the edit view. We restructure the `fields` array:

```typescript
fields: [
  {
    type: 'tabs',
    tabs: [
      {
        label: 'Profile',
        description: 'Personal information and contact details.',
        fields: [
          { type: 'row', fields: [
            { name: 'firstName', ... },
            { name: 'lastName', ... },
          ]},
          { name: 'phone', ... },
        ],
      },
      {
        label: 'Business',
        description: 'Business details that appear on your invoices.',
        fields: [
          { name: 'businessName', ... },
          { name: 'taxId', ... },
        ],
      },
      {
        label: 'Address',
        description: 'Business address for invoices and correspondence.',
        fields: [
          { name: 'address', type: 'group', fields: [...] },
        ],
      },
    ],
  },
  // Sidebar fields (outside tabs)
  {
    name: 'role',
    admin: { position: 'sidebar' },
    ...
  },
  {
    name: 'logo',
    admin: { position: 'sidebar' },  // Move logo to sidebar
    ...
  },
]
```

**Key implementation details:**

1. **Tabs field** — `type: 'tabs'` is a built-in Payload field type. Each tab has a `label`, optional `description`, and `fields` array. Payload renders these as horizontal tabs above the form content.
2. **Move logo to sidebar** — The business logo is more of a "settings" item than a form field. Moving it to `admin.position: 'sidebar'` puts it next to the role badge, making the sidebar useful.
3. **Tab descriptions** — Each tab gets a short description explaining what the section is for. Renders as muted text under the tab content.
4. **Address stays as a group** — The `address` group field already renders its sub-fields together. Putting it in its own tab keeps the form clean.
5. **CSS theming handles the rest** — Tab styling (active tab color, border, background) is handled by the CSS variable overrides from Step 1. Active tab uses `--theme-success-*` which we've set to brand blue.
6. **No custom components needed** — This is purely a collection config change. Payload's built-in tab UI handles everything.
7. **Field admin enhancements** — Add `admin.placeholder` to text fields for better UX, `admin.description` for context.

**Database impact:** None. `tabs` is a presentational field type — it doesn't create columns. Field names stay the same, API stays the same, types stay the same.

---

### Step 8: Custom Edit View Enhancements

**What:** Customize the edit view experience with a branded save button and subtle improvements.

**Files:**
- `src/admin/components/SaveButton.tsx` (Server Component)

**What changes:**

1. **Branded Save Button** — Payload's default save button uses `--theme-success-*` which we've already overridden to brand blue. But we can further customize it by replacing the `SaveButton` component to add:
   - Custom text: "Save Changes" instead of "Save"
   - Subtle animation on hover
   - Consistent styling with our design language

2. **Sidebar role display** — The role field in the sidebar already shows as a select dropdown. With CSS theming from Step 1, it will have blue-tinted borders and focus. We don't need to replace the entire field component — the CSS override handles it.

**Key implementation details:**

1. Register via `collections.Users.admin.components.edit.SaveButton`
2. The SaveButton receives `ServerProps` + `{ label?: string }` as props
3. Import Payload's built-in `SaveButton` from `@payloadcms/ui` and wrap it, or build a custom one using `useDocumentInfo()` hooks
4. Keep it simple — the CSS theming from Step 1 does most of the heavy lifting for forms

---

### Step 9: Custom Field Components (Cells & Badges)

**What:** Replace how specific fields render in the list table to show visual badges instead of plain text.

**Files:**
- `src/admin/components/cells/RoleBadgeCell.tsx` (Client Component)

**What it renders:**

In the Users list table, the "Role" column shows:
- `admin` → Blue pill badge with blue bg: `[● Admin]`
- `user` → Gray pill badge: `[● User]`

Instead of plain text "admin" or "user".

**Key implementation details:**

1. Register via `fields.role.admin.components.Cell` in the Users collection
2. The Cell component receives `{ cellData, rowData }` — `cellData` is the field value ("admin" or "user")
3. Render a styled `<span>` with inline styles: pill shape, colored background
4. Use Payload CSS variables for colors so it works in both themes:
   - Admin badge: brand blue bg (`var(--theme-success-500)` at 10% opacity), blue text
   - User badge: neutral bg (`var(--theme-elevation-200)`), default text

**Why only role badge?** Most fields don't need custom cells — strings, emails, dates all render fine as text. Role is a special case because the visual badge instantly communicates the user's permission level. If we had invoice status, we'd do the same (green badge for paid, yellow for pending, red for overdue). Only customize cells where the visual improvement is significant.

---

### Step 10: Login Page Branding

**What:** Add a branded tagline above the login form and ensure the login page feels cohesive.

**File:** `src/admin/components/LoginBranding.tsx` (Server Component)

**What it renders:**

```
┌────────────────────────────────────┐
│                                      │
│         [PayMe Logo]                 │  ← Already done (graphics.Logo)
│                                      │
│   Professional invoicing made easy   │  ← NEW: tagline
│                                      │
│   ┌────────────────────────────┐    │
│   │ Email                       │    │  ← Payload's login form
│   ├────────────────────────────┤    │
│   │ Password                    │    │  ← Already themed by CSS (Step 1)
│   ├────────────────────────────┤    │
│   │       [Log In]              │    │  ← Brand blue button (from CSS)
│   └────────────────────────────┘    │
│                                      │
└────────────────────────────────────┘
```

**Key implementation details:**

1. Register via `admin.components.beforeLogin`
2. Simple server component — renders a centered tagline with muted text
3. The login form itself is already themed by CSS variable overrides (Step 1)
4. The Logo is already custom (existing `graphics.Logo`)
5. Minimal addition — don't overcomplicate the login page

---

### Step 11: Wire Everything into payload.config.ts

**What:** Register all custom components in the Payload config and update collection configs.

**Target payload.config.ts admin section:**

```typescript
admin: {
  user: Users.slug,
  importMap: { baseDir: path.resolve(dirname) },
  components: {
    graphics: {
      Logo: '/admin/graphics/Logo',
      Icon: '/admin/graphics/Icon',
    },
    Nav: '/admin/components/Nav#AdminNav',
    header: ['/admin/components/Header#AdminHeader'],
    providers: ['/admin/components/AdminProvider#AdminProvider'],
    beforeDashboard: ['/admin/components/Dashboard#AdminDashboard'],
    beforeLogin: ['/admin/components/LoginBranding#LoginBranding'],
  },
  meta: {
    titleSuffix: ' — PayMe Admin',
    icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/logo-icon.svg' }],
  },
}
```

**Target Users collection updates:**

```typescript
admin: {
  group: 'Users',
  useAsTitle: 'email',
  defaultColumns: ['email', 'firstName', 'lastName', 'role', '_verified'],
  components: {
    beforeList: ['/admin/components/UsersListBanner#UsersListBanner'],
  },
}

// Fields restructured with tabs (Step 7):
fields: [
  {
    type: 'tabs',
    tabs: [
      { label: 'Profile', fields: [/* firstName, lastName, phone */] },
      { label: 'Business', fields: [/* businessName, taxId */] },
      { label: 'Address', fields: [/* address group */] },
    ],
  },
  // Sidebar fields:
  { name: 'role', admin: { position: 'sidebar', components: {
    Cell: '/admin/components/cells/RoleBadgeCell#RoleBadgeCell',
  }}},
  { name: 'logo', admin: { position: 'sidebar' } },
]
```

**After wiring:**
1. Run `pnpm dev` — Payload regenerates the import map
2. Run `pnpm generate:types` — Update TypeScript types
3. Test each component individually
4. Test both light and dark modes

---

## Folder Structure (After This Feature)

```
src/
├── admin/
│   ├── graphics/
│   │   ├── Logo.tsx                         ← Login page logo (existing)
│   │   └── Icon.tsx                         ← Sidebar icon (existing)
│   └── components/
│       ├── Nav.tsx                           ← Server: nav data fetching
│       ├── NavClient.tsx                     ← Client: interactive sidebar
│       ├── Header.tsx                        ← Client: top bar (greeting, theme)
│       ├── AdminProvider.tsx                 ← Client: brand context provider
│       ├── Dashboard.tsx                     ← Server: stat cards + quick actions
│       ├── UsersListBanner.tsx               ← Server: stats above Users list
│       ├── MediaListBanner.tsx               ← Server: stats above Media list
│       ├── SaveButton.tsx                    ← Server: branded save button
│       ├── LoginBranding.tsx                 ← Server: tagline above login
│       ├── cells/
│       │   └── RoleBadgeCell.tsx             ← Client: role badge in list table
│       └── icons.ts                         ← Lucide icon mapping (slug → component)
├── app/
│   ├── (frontend)/
│   │   ├── globals.css                      ← Frontend theme (existing)
│   │   ├── layout.tsx                       ← Frontend layout (existing)
│   │   └── page.tsx                         ← Homepage (existing)
│   └── (payload)/
│       └── custom.scss                      ← Admin CSS variable overrides (REWRITTEN)
├── collections/
│   ├── Users.ts                             ← MODIFIED (add component refs)
│   └── Media.ts                             ← MODIFIED (add component refs)
├── components/
│   ├── layouts/                             ← Frontend layouts (existing)
│   ├── theme-toggle.tsx                     ← Frontend theme toggle (existing)
│   └── ui/                                  ← shadcn/ui components (existing)
├── providers/
│   └── theme-provider.tsx                   ← Frontend ThemeProvider (existing)
└── payload.config.ts                        ← MODIFIED (wire all admin components)
```

---

## Common Mistakes & Pitfalls

### 1. Using Tailwind CSS in Admin Components

**Mistake:** `className="bg-blue-500 text-white rounded-lg"` in admin components.

**Why it fails:** Payload's admin at `(payload)/` does NOT load Tailwind CSS. Classes have zero effect.

**Fix:** Use inline `style={{}}` or CSS Modules. Use `var(--theme-elevation-*)` variables for theme-aware colors.

### 2. Importing shadcn/ui Components into Admin

**Mistake:** `import { Button } from '@/components/ui/button'` in an admin component.

**Why it fails:** shadcn/ui components use Tailwind classes internally. They render unstyled in admin. They may also import frontend-only dependencies that break.

**Fix:** Use Payload's own `<Button>` from `@payloadcms/ui`, or build simple styled elements with inline styles for admin-specific components.

**Exception:** `lucide-react` is safe to import in admin components. Lucide icons render as pure inline SVGs with zero CSS dependency. They work everywhere.

### 3. Wrong Component Path Syntax

**Mistake:**
```typescript
Nav: AdminNav                              // Component reference, not a string
Nav: '/admin/components/Nav.tsx#AdminNav'   // Includes .tsx extension
Nav: '/src/admin/components/Nav#AdminNav'   // Includes src/ prefix
```

**Fix:**
```typescript
Nav: '/admin/components/Nav#AdminNav'       // String path, no extension, relative to importMap.baseDir
```

### 4. Forgetting 'use client' on Interactive Components

**Mistake:** Using `useState`, `usePathname()`, or `onClick` in a component without `'use client'`.

**Fix:** Any component using React hooks or event handlers must have `'use client'` at the top. Server Components can only do data fetching and render static content.

### 5. Targeting Payload CSS Class Names Instead of Variables

**Mistake:**
```scss
.btn--style-primary { background: #2563eb; }
.nav__link { color: blue; }
```

**Why it's bad:** These internal class names can change between Payload versions. You're fighting the framework.

**Fix:** Override `--theme-success-500: #2563eb;` — the primary button automatically uses this variable. One override, all components updated.

### 6. Not Testing Dark Mode

**Mistake:** Custom components look great in light mode, unreadable in dark mode because colors are hardcoded.

**Fix:** Use Payload CSS variables everywhere: `var(--theme-text)` for text, `var(--theme-elevation-100)` for card backgrounds. These automatically flip in dark mode.

### 7. Hardcoding Nav Links Instead of Reading Config

**Mistake:** Hardcoding `{ href: '/admin/collections/users', label: 'Users' }` in the Nav.

**Why it breaks:** When you add new collections (invoices, payments), they won't appear in the nav.

**Fix:** Read collections from `useConfig()` and generate links dynamically. Use `groupNavItems()` to respect `admin.group` settings.

### 8. Heavy Dashboard Queries

**Mistake:** `await payload.find({ collection: 'invoices', limit: 0 })` in the Dashboard to count all invoices.

**Fix:** Use `payload.count({ collection: 'invoices' })` — it's a COUNT query, not a full document fetch. Much faster.

### 9. Not Wrapping Admin in NavProvider Context

**Mistake:** Custom Nav component uses `useNav()` but the component isn't inside Payload's NavProvider.

**Why it works:** Payload wraps the admin in NavProvider automatically. `useNav()` works out of the box in any admin component. You don't need to add your own NavProvider.

### 10. Breaking the Admin by Removing Required Structure

**Mistake:** Custom Nav doesn't include a mobile close button, so the nav overlay covers the screen on mobile with no way to dismiss.

**Fix:** Always include the hamburger close button. Use Payload's `<Hamburger>` component and `useNav()` hook for `setNavOpen(false)`.

---

## Production Considerations

### Performance

- **CSS variable overrides** — zero runtime cost. The browser resolves variables once during paint.
- **Server Component data queries** — run on the server with direct database access via Local API. No HTTP round-trips.
- **`payload.count()`** — uses SQL COUNT, not document hydration. Fast even with millions of rows.
- **Import map generation** — happens once at build time in production. No runtime overhead.

### Maintainability

- **Payload version upgrades** — Our approach uses two stable surfaces: CSS variables (`--theme-elevation-*`) and component slot config (`admin.components.Nav`). Both are public API. Internal CSS class names might change, but we don't target those.
- **New collections** — If the Nav reads from `useConfig()`, new collections appear automatically. Only the icon mapping needs updating.
- **Theme changes** — All brand colors flow from the AdminProvider context and CSS variables. One change propagates everywhere.

### Security

- **No access control changes** — Custom components only change presentation, not data access. Payload's `access` config on collections and fields still governs what data is returned.
- **No sensitive data in client components** — Don't pass API keys or secrets through `clientProps` or admin context.
- **Login page unchanged** — We add branding above the form but don't touch the authentication logic.

---

## Verification Checklist

### CSS Theme (Step 1)
- [ ] Admin backgrounds have a visible blue tint (compare against default gray)
- [ ] Primary buttons are brand blue (not dark gray)
- [ ] Input focus rings are brand blue
- [ ] Table row hover has a blue tint
- [ ] Modal/drawer backgrounds are blue-tinted
- [ ] Dark mode: backgrounds are dark blue-black (not pure black)
- [ ] Dark mode: all text is readable against dark backgrounds
- [ ] Login page inherits the blue theme

### Navigation (Step 2)
- [ ] Custom Nav renders with PayMe logo + brand name
- [ ] Dashboard link at top with Lucide `LayoutDashboard` icon
- [ ] All visible collections appear as nav links with Lucide icons (not emojis)
- [ ] Collections grouped by `admin.group`
- [ ] Active link has blue background tint + left accent bar
- [ ] Clicking a link navigates correctly
- [ ] Logout button at bottom works (with Lucide `LogOut` icon)
- [ ] Mobile: hamburger close button dismisses nav overlay
- [ ] Nav looks correct in both light and dark mode

### Header (Step 3)
- [ ] Thin header bar renders above Payload's breadcrumb header
- [ ] Shows "Welcome, {firstName}" (or email fallback)
- [ ] Theme toggle switches between light and dark
- [ ] Profile link navigates to current user's edit page

### Dashboard (Step 5)
- [ ] Stat cards render with collection counts
- [ ] Cards show trend indicators (placeholder for now)
- [ ] Quick action buttons link to create pages
- [ ] 2-column grid on desktop, 1-column on mobile
- [ ] Works in both themes

### List Views (Step 6)
- [ ] Users list shows branded banner with stats (total, admins, verified)
- [ ] Media list shows branded banner
- [ ] Banners styled consistently with dashboard

### Edit View Redesign (Step 7)
- [ ] Users edit page shows 3 tabs: Profile, Business, Address
- [ ] Profile tab: firstName + lastName in a row, phone below
- [ ] Business tab: businessName, taxId with descriptions
- [ ] Address tab: street, city/state row, zip/country row
- [ ] Logo field moved to sidebar (below role)
- [ ] Tabs styled with brand blue active indicator (via CSS theming)
- [ ] Switching tabs preserves unsaved changes

### Edit View Enhancements (Step 8)
- [ ] Save button is brand blue
- [ ] Form fields have blue-tinted borders and blue focus rings
- [ ] Sidebar fields look clean

### Field Components (Step 9)
- [ ] Role column in Users list shows colored badge (blue=admin, gray=user)
- [ ] Badge readable in both themes

### Login (Step 10)
- [ ] Tagline renders below logo, above form
- [ ] Login button is brand blue
- [ ] Overall login page looks professional

### General
- [ ] No console errors
- [ ] No TypeScript build errors
- [ ] Frontend pages are NOT affected by admin changes
- [ ] `pnpm dev` starts without import map errors

---

## References

- [PayloadCMS Custom Components Overview](https://payloadcms.com/docs/admin/components)
- [PayloadCMS Root Components](https://payloadcms.com/docs/admin/components#root-components)
- [PayloadCMS Collection Admin Options](https://payloadcms.com/docs/configuration/collections#admin-options)
- [PayloadCMS Field Components](https://payloadcms.com/docs/fields/overview)
- [PayloadCMS Custom Dashboard](https://payloadcms.com/docs/custom-components/dashboard)
- [PayloadCMS CSS Customization](https://payloadcms.com/docs/admin/customizing-css)
- [PayloadCMS Admin Hooks (useConfig, useAuth, useField)](https://payloadcms.com/docs/admin/hooks)
- [@payloadcms/ui Package](https://www.npmjs.com/package/@payloadcms/ui)
