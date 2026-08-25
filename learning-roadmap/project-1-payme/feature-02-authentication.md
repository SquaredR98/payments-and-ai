# Feature 02: Authentication & User Management

> **Project:** PayMe — Personal Invoice & Payment Link Generator
> **Epic:** 2 of 14
> **Phase:** Feature Documentation
> **Status:** Draft — Awaiting Approval

---

## Table of Contents

1. [What We Are Building](#what-we-are-building)
2. [Why We Are Building It This Way](#why-we-are-building-it-this-way)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema Changes](#database-schema-changes)
5. [API Contracts](#api-contracts)
6. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
   - [Step 1: Extend Users Collection with Profile Fields](#step-1-extend-users-collection-with-profile-fields)
   - [Step 2: Configure Auth Settings (Tokens, Lockout, Verification)](#step-2-configure-auth-settings-tokens-lockout-verification)
   - [Step 3: Build the Registration Page](#step-3-build-the-registration-page)
   - [Step 4: Build the Login Page](#step-4-build-the-login-page)
   - [Step 5: Implement Email Verification Flow](#step-5-implement-email-verification-flow)
   - [Step 6: Implement Password Reset Flow](#step-6-implement-password-reset-flow)
   - [Step 7: Create Auth Middleware for Protected Routes](#step-7-create-auth-middleware-for-protected-routes)
   - [Step 8: Create Auth Context Provider and useAuth Hook](#step-8-create-auth-context-provider-and-useauth-hook)
   - [Step 9: Build User Profile Settings Page](#step-9-build-user-profile-settings-page)
   - [Step 10: Build Business Details Section](#step-10-build-business-details-section)
   - [Step 11: Build Account Security Section](#step-11-build-account-security-section)
7. [Common Mistakes & Pitfalls](#common-mistakes--pitfalls)
8. [Production Considerations](#production-considerations)
9. [Verification Checklist](#verification-checklist)
10. [References](#references)

---

## What We Are Building

This feature implements the complete authentication and user management system for PayMe:

1. **Email/password registration and login** — with client-side Zod validation and server-side PayloadCMS validation.
2. **Email verification** — new users receive a verification email with a token link. Unverified users see a banner prompting them to verify.
3. **Password reset flow** — forgot password sends a reset email with a time-limited token.
4. **Account lockout** — after 5 failed login attempts, the account is locked for 10 minutes.
5. **Route protection** — all `/dashboard/*` routes require authentication. Unauthenticated users are redirected to `/login`.
6. **Auth context provider** — a React context/hook (`useAuth`) that provides the current user, loading state, and auth actions (login, logout, refresh) throughout the frontend.
7. **User profile management** — settings pages where users edit their personal info, business details (auto-populated on invoices), and account security (change password, change email).

**What we are NOT building in this feature:**
- Google OAuth (originally in Story 2.2) — deferred to a stretch goal. PayloadCMS doesn't include a built-in OAuth strategy. Adding it requires a third-party plugin like `payload-authjs` or custom implementation. The core email/password auth is what matters for learning payment integration fundamentals. We'll add it later if desired.
- Two-factor authentication (TOTP) — marked as optional stretch goal in the story points.

---

## Why We Are Building It This Way

### Why PayloadCMS's Built-in Auth (not NextAuth, not Clerk)?

PayloadCMS has a **first-party authentication system** that's deeply integrated with its collections, access control, and hooks. Using it means:

- **Zero additional dependencies.** No `next-auth`, no `@clerk/nextjs`, no third-party auth services. PayloadCMS handles password hashing (bcrypt), JWT generation, session management, email verification, password reset, and account lockout out of the box.
- **Unified access control.** When you set `access.read: ({ req: { user } }) => user.id === doc.owner` on the Invoices collection, PayloadCMS automatically knows who the user is because it handles the auth. With a separate auth system, you'd need to bridge that gap manually.
- **Local API consistency.** In server components, `payload.auth({ headers })` returns the user directly. No extra middleware or adapter needed.

### Why JWT in httpOnly Cookies (not localStorage)?

- **XSS protection.** Tokens in `localStorage` can be stolen by any JavaScript running on the page (malicious script, compromised dependency, XSS vulnerability). httpOnly cookies cannot be read by JavaScript at all.
- **Automatic transmission.** Cookies are sent automatically with every request to the same domain. No need to manually attach `Authorization: Bearer <token>` headers.
- **PayloadCMS default.** This is how PayloadCMS works out of the box. The token is set as a `payload-token` httpOnly cookie.

### Why Server-Side Auth Checks (not Client-Side Only)?

- **Security.** Client-side auth checks are cosmetic — they hide UI but don't protect data. A user could disable JavaScript, modify the React state, or call the API directly. Server-side checks in PayloadCMS access control functions are the actual security boundary.
- **SEO and SSR.** Server components can check auth and render different content (or redirect) before any JavaScript loads in the browser. No flash of unauthorized content.

### Why Defer Google OAuth?

PayloadCMS 3 does not ship with a built-in OAuth/social login strategy. Implementing it requires either:
- The `payload-authjs` community plugin (wraps Auth.js/NextAuth), or
- A custom authentication strategy

Both add complexity that isn't relevant to learning payment integrations. Email/password auth covers 100% of the authentication patterns we need for invoicing. OAuth can be layered on later without changing any existing code.

---

## Architecture Overview

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Registration Flow                            │
│                                                                   │
│  Browser                    Server                   Database     │
│    │                          │                          │        │
│    ├─── POST /api/users ─────▶│                          │        │
│    │    { email, password,    ││  1. Validate fields      │        │
│    │      firstName, ... }    ││  2. Hash password (bcrypt)│        │
│    │                          ││  3. Generate verify token │        │
│    │                          │├── INSERT user ──────────▶│        │
│    │                          ││                          │        │
│    │                          ││  4. Send verification     │        │
│    │                          ││     email (Resend)        │        │
│    │◀── { user, token } ──────│                          │        │
│    │                          │                          │        │
│    │  Set payload-token       │                          │        │
│    │  httpOnly cookie         │                          │        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Login Flow                                │
│                                                                   │
│  Browser                    Server                   Database     │
│    │                          │                          │        │
│    ├─── POST /login ─────────▶│                          │        │
│    │    { email, password }   ││  1. Find user by email   │        │
│    │                          │├── SELECT user ──────────▶│        │
│    │                          ││                          │        │
│    │                          ││  2. Check lockout status  │        │
│    │                          ││  3. Compare password hash │        │
│    │                          ││  4. Generate JWT          │        │
│    │                          ││  5. Reset failed attempts │        │
│    │◀── { user, token, exp }──│                          │        │
│    │                          │                          │        │
│    │  Set payload-token       │                          │        │
│    │  httpOnly cookie         │                          │        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Route Protection Flow                          │
│                                                                   │
│  Browser                    Server                               │
│    │                          │                                   │
│    ├─── GET /dashboard ──────▶│                                   │
│    │    (with cookie)         ││  1. Read payload-token cookie    │
│    │                          ││  2. Verify JWT signature         │
│    │                          ││  3. Decode user from token       │
│    │                          ││                                   │
│    │                          ││  If valid:                        │
│    │◀── Render dashboard ─────││    → Render page with user data  │
│    │                          ││                                   │
│    │                          ││  If invalid/missing:              │
│    │◀── Redirect /login ──────││    → redirect() to /login        │
└─────────────────────────────────────────────────────────────────┘
```

### Auth Architecture in the App

```
src/
├── collections/
│   └── Users.ts               ← Auth config, fields, access control, hooks
├── app/(frontend)/
│   ├── (auth)/                ← Auth pages (no sidebar, centered layout)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── layout.tsx         ← Centered card layout
│   ├── (dashboard)/           ← Protected pages (sidebar layout)
│   │   ├── dashboard/page.tsx
│   │   ├── settings/
│   │   │   ├── profile/page.tsx
│   │   │   ├── business/page.tsx
│   │   │   └── security/page.tsx
│   │   └── layout.tsx         ← Auth check + sidebar layout
├── providers/
│   └── AuthProvider.tsx       ← React context for auth state
├── hooks/
│   └── useAuth.ts             ← useAuth() hook
├── lib/
│   └── auth.ts                ← Server-side auth helpers
└── payload-hooks/
    └── users/
        └── beforeChange.ts    ← Password validation hook
```

---

## Database Schema Changes

### Users Collection (Extended)

PayloadCMS auto-creates `email`, `hash`, `salt`, `loginAttempts`, `lockUntil`, and `_verified` fields when `auth: true` is set. We add the following custom fields:

```typescript
// Fields added to Users collection
{
  // Personal Info
  firstName:    string    // required, min 1, max 100
  lastName:     string    // required, min 1, max 100
  phone:        string    // optional, phone format validation

  // Business Info (auto-populates on invoices)
  businessName: string    // optional
  taxId:        string    // optional (GST/VAT/EIN)
  address: {              // group field
    street:     string    // optional
    city:       string    // optional
    state:      string    // optional
    zip:        string    // optional
    country:    string    // optional, select field with country list
  }

  // Branding
  logo:         relationship → Media   // optional, upload ref

  // System
  role:         'user' | 'admin'       // default: 'user'
}
```

### Fields Auto-Added by PayloadCMS Auth

These exist on every auth collection — you don't define them, but you should know they're there:

| Field | Type | Purpose |
|-------|------|---------|
| `email` | string | Login identifier (unique, indexed) |
| `hash` | string | Bcrypt password hash |
| `salt` | string | Bcrypt salt |
| `loginAttempts` | number | Failed login counter |
| `lockUntil` | date | Lockout expiry timestamp |
| `_verified` | boolean | Email verification status |
| `_verificationToken` | string | Token for email verification |
| `resetPasswordToken` | string | Token for password reset |
| `resetPasswordExpiration` | date | Reset token expiry |

---

## API Contracts

PayloadCMS auto-generates these endpoints when `auth: true` is set on a collection. You do NOT need to create these routes manually.

### POST /api/users (Register)

```typescript
// Request
{
  email: string        // required, unique
  password: string     // required, min 8 chars
  firstName: string    // required
  lastName: string     // required
}

// Response 201
{
  message: "User created",
  doc: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "user"
    _verified: false
    createdAt: string
    updatedAt: string
  }
}

// Response 400 (validation error)
{
  errors: [
    { message: "...", field: "email" }
  ]
}
```

### POST /api/users/login

```typescript
// Request
{
  email: string
  password: string
}

// Response 200
{
  user: { id, email, firstName, lastName, ... }
  token: string      // JWT
  exp: number        // Expiry timestamp
}
// Also sets payload-token httpOnly cookie

// Response 401
{
  errors: [{ message: "The email or password provided is incorrect." }]
}

// Response 403 (locked)
{
  errors: [{ message: "This account has been locked due to too many failed login attempts." }]
}
```

### GET /api/users/me

```typescript
// Response 200 (authenticated)
{
  user: { id, email, firstName, lastName, ... }
  token: string
  exp: number
}

// Response 200 (not authenticated)
{
  user: null
}
```

### POST /api/users/logout

```typescript
// Response 200
{
  message: "You have been logged out."
}
// Clears payload-token cookie
```

### POST /api/users/refresh-token

```typescript
// Response 200
{
  user: { id, email, ... }
  refreshedToken: string
  exp: number
}
// Updates payload-token cookie with new token
```

### POST /api/users/forgot-password

```typescript
// Request
{
  email: string
}

// Response 200 (always — don't reveal if email exists)
{
  message: "If a user with that email exists, a password reset email will be sent."
}
```

### POST /api/users/reset-password

```typescript
// Request
{
  token: string       // From the reset email URL
  password: string    // New password
}

// Response 200
{
  user: { id, email, ... }
  token: string       // New JWT (auto-logged in)
}
```

### POST /api/users/verify/{token}

```typescript
// Response 200
{
  message: "Email verified successfully."
}

// Response 400
{
  errors: [{ message: "Verification token is invalid." }]
}
```

---

## Step-by-Step Implementation Guide

### Step 1: Extend Users Collection with Profile Fields

**What:** Add personal info, business details, address, logo, and role fields to the Users collection.

**Why:** The Users collection currently only has email (auto-added by auth). We need profile fields so users can set their business identity, which auto-populates on invoices they create.

#### Implementation

Update `src/collections/Users.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 604800,     // 7 days in seconds
    verify: true,                // Enable email verification
    maxLoginAttempts: 5,         // Lock after 5 failed attempts
    lockTime: 600 * 1000,       // 10 minutes lockout (milliseconds)
  },
  admin: {
    group: 'Users',
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', '_verified'],
  },
  access: {
    // Anyone can create an account (registration)
    create: () => true,
    // Users can read their own profile, admins can read all
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Users can update their own profile only
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
  fields: [
    // --- Personal Info ---
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          minLength: 1,
          maxLength: 100,
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          minLength: 1,
          maxLength: 100,
        },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        placeholder: '+1 (555) 123-4567',
      },
    },

    // --- Business Info ---
    {
      name: 'businessName',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Appears on invoices as the sender business name.',
      },
    },
    {
      name: 'taxId',
      type: 'text',
      label: 'Tax ID / GST / VAT Number',
      admin: {
        description: 'Your business tax identification number. Appears on invoices.',
      },
    },

    // --- Address ---
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text' },
            { name: 'state', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'zip', type: 'text', label: 'ZIP / Postal Code' },
            {
              name: 'country',
              type: 'select',
              options: [
                { label: 'United States', value: 'US' },
                { label: 'United Kingdom', value: 'GB' },
                { label: 'Canada', value: 'CA' },
                { label: 'Australia', value: 'AU' },
                { label: 'India', value: 'IN' },
                { label: 'Germany', value: 'DE' },
                { label: 'France', value: 'FR' },
                { label: 'Japan', value: 'JP' },
                { label: 'Brazil', value: 'BR' },
                { label: 'Other', value: 'OTHER' },
              ],
            },
          ],
        },
      ],
    },

    // --- Branding ---
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Your business logo. Appears on invoices and payment pages. Max 2MB, JPG/PNG only.',
      },
    },

    // --- System ---
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        position: 'sidebar',
        description: 'User role. Only admins can modify this.',
      },
    },
  ],
}
```

#### Key Decisions

- **`tokenExpiration: 604800`** — 7 days. This is a development/learning app. In production with real financial data, you'd use a shorter duration (e.g., 1 hour) with refresh token rotation.
- **`verify: true`** — PayloadCMS handles the full verification flow: generates a token, calls your email handler, verifies the token on the endpoint. We just need to configure the email template (Step 5).
- **`maxLoginAttempts: 5`** — Standard brute-force protection. After 5 wrong passwords, the account is locked for 10 minutes. PayloadCMS tracks this automatically.
- **`access.create: () => true`** — Anyone can register. This is intentional — you can't require auth to create an account.
- **`access.read` with query constraint** — Returns `{ id: { equals: user.id } }` instead of `true/false`. This is a PayloadCMS pattern — returning a query object means "allow, but only for documents matching this filter." This way, `GET /api/users` only returns the current user's own document, not everyone's.
- **`role` field with update access control** — Regular users can see their role but can't change it. Only admins can promote/demote users.

---

### Step 2: Configure Auth Settings (Tokens, Lockout, Verification)

**What:** Already handled in Step 1 via the `auth` property on the Users collection. This step explains what each setting does.

**Why:** Understanding these settings is important because they directly affect security and user experience.

#### Auth Settings Breakdown

| Setting | Value | What Happens |
|---------|-------|------|
| `tokenExpiration` | `604800` (7 days) | JWT and cookie expire after 7 days. User must log in again. |
| `verify` | `true` | After registration, PayloadCMS sets `_verified: false` and generates a `_verificationToken`. It calls your configured email handler to send a verification email. The `POST /api/users/verify/{token}` endpoint flips `_verified` to `true`. |
| `maxLoginAttempts` | `5` | Each failed login increments `loginAttempts` on the user document. At 5, the user is locked out. |
| `lockTime` | `600000` (10 min) | After lockout, `lockUntil` is set to `now + 10 minutes`. Login attempts during lockout return 403 regardless of correct password. After the lock expires, `loginAttempts` resets. |

#### Cookie Behavior

PayloadCMS automatically sets these cookie properties:

```
Name:     payload-token
Value:    <JWT>
HttpOnly: true        ← JavaScript cannot read this
Secure:   true        ← Only sent over HTTPS (in production)
SameSite: Lax         ← Prevents CSRF from cross-origin requests
Path:     /           ← Available on all routes
```

You don't need to configure this — it's PayloadCMS's default behavior.

---

### Step 3: Build the Registration Page

**What:** A registration form at `/register` with email, password, confirm password, first name, and last name fields. Client-side validation with Zod, server-side validation by PayloadCMS.

**Why:** This is the entry point for new users. The form needs to be clean, validate properly, and handle errors gracefully.

#### Route Structure

- Page: `src/app/(frontend)/(auth)/register/page.tsx`
- Layout: `src/app/(frontend)/(auth)/layout.tsx` (shared centered layout for all auth pages)

#### Auth Layout

The auth layout wraps login, register, forgot-password, reset-password, and verify-email pages in a centered card design:

```typescript
// src/app/(frontend)/(auth)/layout.tsx
// Renders children centered on screen with the PayMe logo above
// No sidebar, no dashboard nav — clean, focused layout
```

#### Registration Form

```typescript
// Zod validation schema (shared between client and server)
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
```

#### Form Behavior

1. User fills in all fields.
2. On submit, Zod validates client-side. If errors, show inline per field.
3. If valid, call `POST /api/users` with `{ email, password, firstName, lastName }`.
4. On success: redirect to `/login` with a message "Account created! Please check your email to verify."
5. On error (e.g., email already exists): show the server error message at the top of the form.
6. Button shows loading spinner during submission and is disabled.

#### UI Design

- Centered card with PayMe logo
- "Create your account" heading
- First name / Last name in a row
- Email field
- Password field with show/hide toggle
- Confirm password field
- "Create Account" primary button
- "Already have an account? Sign in" link below

---

### Step 4: Build the Login Page

**What:** A login form at `/login` with email and password fields.

**Why:** The login page is where returning users authenticate. It needs to handle success, validation errors, incorrect credentials, and locked accounts.

#### Route

- Page: `src/app/(frontend)/(auth)/login/page.tsx`

#### Login Form Schema

```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
```

#### Form Behavior

1. User enters email and password.
2. On submit, call `POST /api/users/login` with `{ email, password }`.
3. On success: PayloadCMS sets the `payload-token` cookie automatically. Redirect to `/dashboard`.
4. On 401 (wrong credentials): show "The email or password provided is incorrect." — this is intentionally generic so attackers can't enumerate which emails exist.
5. On 403 (locked): show "This account has been temporarily locked. Please try again later."
6. Button shows loading spinner during submission.

#### UI Design

- Centered card with PayMe logo
- "Welcome back" heading
- Email field
- Password field with show/hide toggle
- "Forgot password?" link (right-aligned)
- "Sign In" primary button
- "Don't have an account? Sign up" link below

---

### Step 5: Implement Email Verification Flow

**What:** Configure PayloadCMS to send verification emails on registration using Resend, and build a verification page that processes the token.

**Why:** Email verification confirms the user owns the email address they registered with. Without it, anyone could create accounts with someone else's email and send invoices from that identity.

#### Configure Email in PayloadCMS

Add the Resend email adapter to `payload.config.ts`:

```typescript
import { resendAdapter } from '@payloadcms/email-resend'

export default buildConfig({
  email: resendAdapter({
    defaultFromAddress: 'noreply@payme.local',
    defaultFromName: 'PayMe',
    apiKey: env.RESEND_API_KEY || '',
  }),
  // ... rest of config
})
```

> **Note:** Install `@payloadcms/email-resend` package. If Resend API key isn't set yet, PayloadCMS falls back to logging emails to the console — which is fine for development.

#### Configure Verification Email Template

In `src/collections/Users.ts`, within the `auth` property:

```typescript
auth: {
  verify: {
    generateEmailHTML: ({ token, user }) => {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
      return `
        <h1>Verify your email</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Thanks for creating a PayMe account. Please verify your email by clicking the link below:</p>
        <a href="${url}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
      `
    },
    generateEmailSubject: () => 'Verify your PayMe account',
  },
}
```

#### Build the Verification Page

- Route: `src/app/(frontend)/(auth)/verify-email/page.tsx`
- Reads `?token=xxx` from URL
- Calls `POST /api/users/verify/{token}`
- On success: shows "Email verified! You can now use all features." with a link to `/dashboard`
- On error: shows "This verification link is invalid or has expired." with a link to request a new one

#### Unverified User Banner

In the dashboard layout, check if the current user's `_verified` is `false`. If so, show a dismissible banner:

```
⚠️ Your email is not verified. Some features may be limited. [Resend verification email]
```

---

### Step 6: Implement Password Reset Flow

**What:** Build forgot-password and reset-password pages that use PayloadCMS's built-in password reset mechanism.

**Why:** Users forget passwords. Without a reset flow, they'd need to contact you to regain access. PayloadCMS handles the token generation and validation — we just build the UI and configure the email template.

#### Configure Forgot Password Email Template

In `src/collections/Users.ts`:

```typescript
auth: {
  forgotPassword: {
    generateEmailHTML: ({ token }) => {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      return `
        <h1>Reset your password</h1>
        <p>You requested a password reset for your PayMe account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${url}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    },
    generateEmailSubject: () => 'Reset your PayMe password',
  },
}
```

#### Forgot Password Page

- Route: `src/app/(frontend)/(auth)/forgot-password/page.tsx`
- Single email field
- Calls `POST /api/users/forgot-password` with `{ email }`
- **Always** shows "If an account with that email exists, we've sent a reset link." — regardless of whether the email exists. This prevents email enumeration attacks.
- Link back to login

#### Reset Password Page

- Route: `src/app/(frontend)/(auth)/reset-password/page.tsx`
- Reads `?token=xxx` from URL
- Form: new password + confirm password (same validation as registration)
- Calls `POST /api/users/reset-password` with `{ token, password }`
- On success: user is auto-logged in (PayloadCMS returns a new JWT). Redirect to `/dashboard`.
- On error: "This reset link is invalid or has expired. Request a new one."

---

### Step 7: Create Auth Middleware for Protected Routes

**What:** Protect all dashboard routes by checking for a valid session. Redirect unauthenticated users to `/login`.

**Why:** Without protection, anyone could navigate to `/dashboard/invoices` and see the page (even if the API calls would fail). The server should never even render the page for unauthenticated users.

#### Approach: Server Component Auth Check

In PayloadCMS 3 with Next.js, the recommended approach is checking auth in server components (not Next.js middleware). This is because:

1. PayloadCMS's `payload.auth()` needs the full Node.js runtime.
2. Next.js middleware runs in Edge runtime by default, which can't import PayloadCMS.
3. Server component auth checks happen before any rendering — the user never sees a flash of the dashboard.

#### Dashboard Layout with Auth Check

```typescript
// src/app/(frontend)/(dashboard)/layout.tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    redirect('/login')
  }

  // Render dashboard shell with sidebar
  return (
    <div>
      {/* Sidebar + Header + Main content */}
      {children}
    </div>
  )
}
```

#### How This Works

1. User navigates to `/dashboard` (or any nested route).
2. Next.js runs the `DashboardLayout` server component before rendering.
3. `payload.auth({ headers })` reads the `payload-token` cookie from the request headers.
4. If the token is valid, `user` is populated and the page renders.
5. If the token is missing/expired/invalid, `user` is `null` and we `redirect('/login')`.
6. This all happens server-side — no JavaScript needs to load in the browser first.

---

### Step 8: Create Auth Context Provider and useAuth Hook

**What:** A React context provider that makes the current user and auth actions available in client components throughout the app.

**Why:** Client components (forms, buttons, interactive UI) need to know who's logged in. The server component auth check protects the route, but client components need auth state for things like displaying the user's name, calling logout, or showing/hiding UI elements.

#### Auth Provider

```typescript
// src/providers/AuthProvider.tsx
'use client'

// Provides: user, isLoading, isAuthenticated
// Actions: login(email, password), logout(), refresh()
//
// On mount: calls GET /api/users/me to get current user
// On login: calls POST /api/users/login, updates user state
// On logout: calls POST /api/users/logout, clears user state, redirects to /login
// On refresh: calls POST /api/users/refresh-token, updates token
```

#### useAuth Hook

```typescript
// src/hooks/useAuth.ts
'use client'

// Returns the auth context value
// Throws if used outside AuthProvider
//
// Usage:
// const { user, isLoading, isAuthenticated, login, logout } = useAuth()
```

#### Important: Server vs Client Auth

- **Server components** use `payload.auth({ headers })` — fast, secure, runs on every request.
- **Client components** use `useAuth()` — fetches user via `/api/users/me` on mount, caches in React state.
- Both should agree on auth state. If the server says you're logged in, the client should too (because the cookie is automatically sent with the `/me` request).

---

### Step 9: Build User Profile Settings Page

**What:** A settings page at `/dashboard/settings/profile` where users edit their personal information.

**Why:** Users need to set their name, phone, and upload a logo. This info appears on invoices they create.

#### Route

- Page: `src/app/(frontend)/(dashboard)/settings/profile/page.tsx`

#### Form Fields

- First name (required)
- Last name (required)
- Phone (optional)
- Business logo upload (optional, max 2MB, JPG/PNG only)

#### Behavior

1. Pre-populate form with current user data (fetched from `useAuth()` or server component).
2. On submit, call `PATCH /api/users/{userId}` with updated fields.
3. Show loading state on save button.
4. On success: show success toast "Profile updated."
5. On error: show inline validation errors.

#### Logo Upload

- Use PayloadCMS's Media collection for the upload.
- First upload the file to `POST /api/media` to get the media document ID.
- Then update the user's `logo` field with that media ID.
- Show a preview of the current logo.
- Allow removing the logo.

---

### Step 10: Build Business Details Section

**What:** A settings page at `/dashboard/settings/business` for business name, tax ID, and address.

**Why:** These details auto-populate on every invoice the user creates. Setting them once here means they don't have to re-enter them for each invoice.

#### Route

- Page: `src/app/(frontend)/(dashboard)/settings/business/page.tsx`

#### Form Fields

- Business name
- Tax ID / GST / VAT number
- Address: street, city, state, ZIP, country (select dropdown)

#### Behavior

Same as profile page — pre-populate, validate, PATCH update, toast on success.

#### Country Dropdown

Use the `Select` shadcn component with the country list defined in the Users collection schema. The frontend dropdown options should match the backend `select` field options.

---

### Step 11: Build Account Security Section

**What:** A settings page at `/dashboard/settings/security` with change password and change email functionality.

**Why:** Users need to be able to update their credentials. Change password requires knowing the current password (prevents unauthorized changes if someone accesses an unlocked browser).

#### Route

- Page: `src/app/(frontend)/(dashboard)/settings/security/page.tsx`

#### Change Password

- Form: current password, new password, confirm new password
- Validation: same rules as registration (8+ chars, mixed case, number)
- Implementation: Call `PATCH /api/users/{userId}` with `{ password: newPassword }` — but PayloadCMS requires the request to be authenticated. The user is already authenticated via cookie, so this works.
- **Important:** PayloadCMS doesn't natively require "current password" when updating password via API. You'll need to add a `beforeChange` hook that verifies the current password before allowing a password change. This is a security measure — without it, anyone with access to a logged-in browser could change the password.

#### Change Email

- Form: new email, current password (for verification)
- Calls `PATCH /api/users/{userId}` with `{ email: newEmail }`
- If email verification is enabled, PayloadCMS will set `_verified: false` and send a new verification email to the new address.
- Show notice: "A verification email has been sent to your new email address."

---

## Common Mistakes & Pitfalls

### 1. Revealing Whether an Email Exists

**The mistake:** Login error says "No account found with this email" vs "Wrong password."

**Why it's wrong:** Attackers can enumerate valid email addresses by trying random emails and seeing which ones get "wrong password" vs "no account found."

**The fix:** Always show a generic message: "The email or password provided is incorrect." PayloadCMS does this by default — don't override it with more specific messages.

### 2. Storing JWT in localStorage

**The mistake:** Extracting the JWT from the login response and putting it in `localStorage` for easy access.

**Why it's wrong:** Any JavaScript on the page can read `localStorage`. An XSS vulnerability (which is common — one compromised npm package is enough) would let an attacker steal all user tokens.

**The fix:** Don't touch the token. PayloadCMS stores it in an httpOnly cookie automatically. Let the browser handle it. Your client-side code never needs to see the raw token.

### 3. Client-Side Only Auth Checks

**The mistake:** Checking `if (!user) router.push('/login')` in a `useEffect` and calling it protected.

**Why it's wrong:** The server still renders the full page HTML with sensitive data. The redirect happens after the page loads. A user can disable JavaScript, view the page source, or intercept the response. Additionally, there's a flash of the protected page before the redirect.

**The fix:** Always check auth in the server component layout (Step 7). The `redirect()` happens before any HTML is generated. Client-side `useAuth()` is for UI convenience (showing the user's name, enabling buttons), not for security.

### 4. Not Setting firstNam/lastName as Required

**The mistake:** Making profile fields optional during registration to "reduce friction."

**Why it's wrong:** Invoices need a sender name. If the user skips their name during registration and immediately creates an invoice, the invoice has no sender identity. This looks unprofessional and may violate invoicing requirements in some jurisdictions.

**The fix:** First name and last name are required on registration. Business name and address are optional (can be added later in settings).

### 5. Allowing Password Change Without Current Password

**The mistake:** Letting users change their password by just typing a new one.

**Why it's wrong:** If someone finds an unlocked laptop with a logged-in PayMe session, they could change the password and lock out the real user. Requiring the current password means they can't — they don't know it.

**The fix:** Add a `beforeChange` hook on the Users collection that verifies the current password before allowing a password update (Step 11).

### 6. Not Handling the Lockout State in UI

**The mistake:** Showing "Invalid credentials" when the account is actually locked.

**Why it's wrong:** The user keeps trying (and failing) without understanding why. They get frustrated, try other passwords, and still can't log in.

**The fix:** Catch the 403 status code from the login response and show a specific message: "Your account has been temporarily locked due to too many failed attempts. Please try again in 10 minutes, or reset your password."

### 7. Forgetting That PayloadCMS REST API Exists

**The mistake:** Creating custom `POST /api/auth/login` routes that manually call `payload.login()`.

**Why it's wrong:** PayloadCMS already exposes `POST /api/users/login`, `POST /api/users/logout`, etc. Creating duplicate routes means you're maintaining auth logic that Payload already handles, including proper cookie setting, error handling, and lockout checking.

**The fix:** Call PayloadCMS's built-in REST endpoints directly from the frontend. Only create custom routes for logic that PayloadCMS doesn't provide (like the "verify current password before changing password" check).

### 8. Hardcoding the App URL in Email Templates

**The mistake:** Writing `https://myapp.com/verify?token=xxx` directly in the email template HTML.

**Why it's wrong:** Different environments (local dev, staging, production) have different URLs. In development, the verify link should point to `http://localhost:3000`, not a production URL.

**The fix:** Use `process.env.NEXT_PUBLIC_APP_URL` in email templates (as shown in Steps 5 and 6).

---

## Production Considerations

### Rate Limiting on Auth Endpoints

PayloadCMS's `maxLoginAttempts` protects individual accounts, but it doesn't limit how many different accounts an attacker can try. In production, add IP-based rate limiting on `/api/users/login` and `/api/users/forgot-password` (covered in Feature 11 — Security & Compliance).

### Password Hashing

PayloadCMS uses bcrypt with a default salt rounds of 10. This is secure and standard. Don't change it unless you have a specific reason. Lower rounds are faster but weaker. Higher rounds are stronger but slower (each login takes longer).

### Session Invalidation

When a user changes their password, their existing JWT remains valid until it expires (7 days in our config). In production, you'd want to invalidate all existing sessions on password change. PayloadCMS's `useSessions: true` (default) helps with this — it tracks sessions server-side, and the `logout({ allSessions: true })` operation can clear them all.

### Email Deliverability

Resend handles SPF, DKIM, and DMARC for you if you verify your domain. For development, emails are logged to the console (no actual sending). In production, verify your domain with Resend to prevent emails from going to spam.

### GDPR Considerations

- Store only necessary user data.
- The profile page should have a "Download my data" and "Delete my account" button (covered in Feature 11).
- Email verification tokens should expire (they do — PayloadCMS handles this).
- Login history / audit logs should be retained for security but cleaned up per your data retention policy (covered in Feature 12).

---

## Verification Checklist

After implementation, verify each of the following:

- [ ] Registration form validates all fields client-side (Zod) before submission
- [ ] Registration creates a new user in PayloadCMS with `_verified: false`
- [ ] Registration redirects to login with a success message
- [ ] Login with correct credentials sets `payload-token` cookie and redirects to `/dashboard`
- [ ] Login with wrong credentials shows generic error message
- [ ] Login with correct credentials but locked account shows lockout message
- [ ] After 5 failed login attempts, account is locked (returns 403)
- [ ] After 10 minutes, locked account can log in again
- [ ] `/dashboard` and all sub-routes redirect to `/login` when not authenticated
- [ ] `/dashboard` renders correctly when authenticated
- [ ] `useAuth()` hook returns current user in client components
- [ ] Logout clears the cookie and redirects to `/login`
- [ ] Verification email is sent on registration (check console in dev)
- [ ] Clicking verification link sets `_verified: true`
- [ ] Unverified users see a verification banner on the dashboard
- [ ] Forgot password sends reset email (check console in dev)
- [ ] Reset password with valid token sets new password and logs user in
- [ ] Reset password with expired/invalid token shows error
- [ ] Profile page loads with current user data pre-populated
- [ ] Profile page saves changes successfully with toast notification
- [ ] Business details page saves address and tax ID
- [ ] Change password requires current password
- [ ] Change email triggers new verification email
- [ ] Role field is visible but not editable for regular users
- [ ] Admin can see and edit all users in the admin panel

---

## References

- [PayloadCMS Authentication Overview](https://payloadcms.com/docs/authentication/overview) — Core auth configuration options
- [PayloadCMS Auth Operations](https://payloadcms.com/docs/authentication/operations) — Login, logout, register, verify, reset endpoints
- [PayloadCMS Authentication Emails](https://payloadcms.com/docs/authentication/email) — Customizing verification and reset emails
- [PayloadCMS JWT Strategy](https://payloadcms.com/docs/authentication/jwt) — JWT configuration and token handling
- [PayloadCMS Cookie Strategy](https://payloadcms.com/docs/authentication/cookies) — httpOnly cookie behavior
- [PayloadCMS Collection Hooks](https://payloadcms.com/docs/hooks/collections) — beforeChange, afterChange hooks
- [PayloadCMS Field-level Access Control](https://payloadcms.com/docs/access-control/fields) — Restricting field updates by role
- [PayloadCMS Email Setup](https://payloadcms.com/docs/email/overview) — Configuring email adapters
- [Next.js Auth with Payload](https://payloadcms.com/posts/blog/nextjs-payload-cms-auth) — Official guide on auth patterns
- [Setting Up RBAC in Next.js + Payload](https://payloadcms.com/posts/guides/setting-up-auth-and-role-based-access-control-in-nextjs-payload) — Role-based access control patterns
- [Zod Documentation](https://zod.dev/) — Form validation schemas
