# Project 6: FlowHire — AI-Powered Recruitment Platform with Custom Connect

## Project Overview

**What it is:** A recruitment platform where companies post jobs, candidates apply, and AI helps screen resumes. Companies onboard with Stripe Connect Custom — meaning YOU build the entire onboarding UI (identity verification, bank account collection, ToS acceptance). The platform handles multi-party payment splits between companies and recruiters/agencies.

**Tech Stack:**
- **Backend:** NestJS (TypeScript, enterprise-grade Node.js framework)
- **Frontend:** React (Vite) + TypeScript
- **Database:** PostgreSQL + Prisma
- **Styling:** Tailwind CSS + Mantine UI
- **Payments:** Stripe Connect Custom, Stripe Identity, Multi-party payment splits
- **AI:** OpenAI (function calling for structured extraction, resume parsing, scoring)
- **Email:** Resend
- **State Management:** Zustand
- **Deployment:** Local development only

**Why NestJS:** NestJS provides structure via decorators, modules, dependency injection, guards, interceptors, and pipes. It's the Angular-equivalent for Node.js backends — enterprise-grade, opinionated, and scalable. Every concept maps to a pattern you'll use in large codebases.

**What You Will Learn:**
1. NestJS — modules, controllers, services, guards, interceptors, pipes, middleware
2. Stripe Connect Custom — build the ENTIRE onboarding UI yourself
3. Stripe Identity — document verification, selfie verification
4. Multi-party payment splits — company pays, platform takes fee, recruiter gets remainder
5. Custom payout schedules — configure when connected accounts get paid
6. OpenAI Function Calling — structured data extraction from unstructured text
7. AI resume parsing — extract skills, experience, education from PDFs
8. AI candidate scoring — match candidates to job requirements
9. Multi-tenant architecture — Companies, Candidates, Recruiters, Admin

---

## Feature List Summary

1. NestJS backend with modular architecture
2. React Vite frontend with Mantine UI
3. PostgreSQL + Prisma database
4. Multi-tenant auth (Company, Candidate, Recruiter, Admin)
5. Company team management (invite members, roles)
6. Company onboarding via Stripe Connect Custom (full UI build)
7. Custom business information form
8. Custom representative/owner information form
9. Beneficial owners collection
10. Stripe Identity verification (document + selfie)
11. Bank account / external account collection
12. Terms of Service acceptance
13. Account requirements monitoring
14. Recruiter/Agency onboarding (also Connect Custom)
15. Job posting CRUD with AI-assisted description generation
16. Candidate application flow (resume upload, cover letter)
17. AI resume parsing (structured data extraction via function calling)
18. AI candidate scoring and ranking
19. AI interview question generation
20. Interview scheduling and management
21. Payment: company pays recruitment fee → platform fee → recruiter payout
22. Multi-party payment splits
23. Custom payout schedules
24. Milestone-based payments
25. Invoice generation
26. Refund policy (candidate leaves early)
27. Admin panel (multi-tenant overview)
28. Notifications (in-app + email)
29. Security (PCI-DSS, GDPR for candidate data, encryption)
30. Audit logging
31. Testing
32. Responsive UI with dark mode

---

## Epic 1: Project Setup & Architecture

### Story 1.1: Initialize NestJS Backend

**Task 1.1.1: Create NestJS project**
- Acceptance Criteria:
  - Project created with `nest new flowhire-api`
  - TypeScript strict mode
  - Module structure:
    - AuthModule, UsersModule, CompaniesModule, CandidatesModule, RecruitersModule
    - JobsModule, ApplicationsModule, InterviewsModule
    - PaymentsModule, StripeConnectModule
    - AIModule, NotificationsModule, AuditModule
  - Server runs on `localhost:3001`
  - Swagger/OpenAPI docs at `/api/docs`

**Task 1.1.2: Configure Prisma with NestJS**
- Acceptance Criteria:
  - Prisma installed with PostgreSQL
  - PrismaService created as injectable NestJS service
  - Database connection in `.env`
  - Prisma module imported globally

**Task 1.1.3: Configure NestJS middleware and pipes**
- Acceptance Criteria:
  - Global validation pipe (class-validator + class-transformer)
  - Global exception filter (consistent error responses)
  - Logging interceptor (request/response logging)
  - Correlation ID middleware (request tracing)
  - Helmet middleware (security headers)
  - CORS configured for frontend origin
  - Rate limiting (ThrottlerModule)

### Story 1.2: Initialize React Frontend

**Task 1.2.1: Setup React Vite project**
- Acceptance Criteria:
  - React + Vite + TypeScript
  - Mantine UI installed with theme configuration
  - React Router v6 with layout routes
  - Zustand for state management
  - Axios with interceptors for API calls
  - Runs on `localhost:5173`

**Task 1.2.2: Configure multi-tenant routing**
- Acceptance Criteria:
  - Routes organized by role:
    - `/company/*` — company dashboard, jobs, candidates, billing, settings
    - `/candidate/*` — profile, applications, interviews
    - `/recruiter/*` — dashboard, placements, earnings, settings
    - `/admin/*` — platform overview, all entities
  - Auth guard checks role and redirects appropriately
  - Shared layout components per role

---

## Epic 2: Authentication & Multi-Tenant Authorization

### Story 2.1: Registration with Roles

**Task 2.1.1: Build registration endpoints (NestJS)**
- Acceptance Criteria:
  - `POST /api/auth/register/company` — creates company + admin user
  - `POST /api/auth/register/candidate` — creates candidate profile
  - `POST /api/auth/register/recruiter` — creates recruiter/agency profile
  - Each endpoint: validates input (class-validator decorators), hashes password, creates appropriate records
  - Returns JWT token pair

**Task 2.1.2: Build NestJS auth guards**
- Acceptance Criteria:
  - `JwtAuthGuard` — verifies JWT token
  - `RolesGuard` — checks user role against `@Roles('company', 'admin')` decorator
  - `CompanyMemberGuard` — checks user is a member of the company they're accessing
  - Guards are NestJS `CanActivate` implementations
  - Proper 401/403 responses

### Story 2.2: Company Team Management

**Task 2.2.1: Build team invitation system**
- Acceptance Criteria:
  - `POST /api/companies/:id/invite` — invite team member by email
  - Roles within company: Owner, Admin, Hiring Manager, Viewer
  - Invitation email with accept link
  - `POST /api/invitations/:token/accept` — accept and join company
  - Team member list page
  - Remove team member
  - Change team member role

### Story 2.3: JWT & Session Management

**Task 2.3.1: Implement NestJS JWT strategy**
- Acceptance Criteria:
  - Passport JWT strategy configured
  - Access token (15 min) + Refresh token (7 days)
  - Refresh token stored in database
  - Token rotation on refresh
  - Password reset with email token
  - Email verification flow

---

## Epic 3: Database Schema Design

### Story 3.1: Core Models

**Task 3.1.1: Create Company model**
- Acceptance Criteria:
  - Fields: id, name, slug, logo, website, description, industry, size (enum: 1-10/11-50/51-200/201-500/500+), stripeConnectedAccountId, connectOnboardingStatus (NOT_STARTED/IN_PROGRESS/COMPLETED/ACTION_REQUIRED), chargesEnabled, payoutsEnabled, country, createdAt, updatedAt
  - Relations: has many CompanyMembers, has many JobPostings

**Task 3.1.2: Create CompanyMember model**
- Acceptance Criteria:
  - Fields: id, userId (FK to User), companyId (FK), role (OWNER/ADMIN/HIRING_MANAGER/VIEWER), joinedAt
  - Unique constraint: userId + companyId

**Task 3.1.3: Create Candidate model**
- Acceptance Criteria:
  - Fields: id, userId (FK), headline, bio, resumeUrl, resumeParsedData (JSON — structured AI output), skills (string array), experienceYears, educationLevel, currentLocation, desiredSalaryMin, desiredSalaryMax, salaryCurrency, availability (IMMEDIATELY/2_WEEKS/1_MONTH/3_MONTHS), isOpenToWork, createdAt, updatedAt

**Task 3.1.4: Create Recruiter/Agency model**
- Acceptance Criteria:
  - Fields: id, userId (FK), agencyName (nullable — solo vs agency), specializations (string array), industriesFocused (string array), stripeConnectedAccountId, connectOnboardingStatus, chargesEnabled, payoutsEnabled, totalPlacements, averageRating, commissionRate (decimal — default percentage), createdAt, updatedAt

### Story 3.2: Job & Application Models

**Task 3.2.1: Create JobPosting model**
- Acceptance Criteria:
  - Fields: id, companyId (FK), title, slug, description (rich text), requirements (text array), niceToHaves (text array), skills (string array), experienceLevel (JUNIOR/MID/SENIOR/LEAD/EXECUTIVE), employmentType (FULL_TIME/PART_TIME/CONTRACT/FREELANCE), locationType (REMOTE/ONSITE/HYBRID), location (string), salaryMin, salaryMax, salaryCurrency, salaryPeriod (ANNUAL/MONTHLY/HOURLY), benefits (string array), status (DRAFT/ACTIVE/PAUSED/CLOSED/FILLED), applicationDeadline (datetime), recruitmentFeeType (FIXED/PERCENTAGE), recruitmentFeeAmount (decimal), assignedRecruiterId (FK, nullable), totalApplications, createdAt, updatedAt

**Task 3.2.2: Create Application model**
- Acceptance Criteria:
  - Fields: id, candidateId (FK), jobId (FK), status (APPLIED/SCREENING/SHORTLISTED/INTERVIEW/OFFERED/HIRED/REJECTED/WITHDRAWN), coverLetter (text), resumeUrl, aiScore (decimal 0-100, nullable), aiScoreExplanation (text), aiParsedResume (JSON), applicationDate, lastStatusChangeAt, rejectionReason (text, nullable), notes (text — internal company notes)
  - Unique: candidateId + jobId (can't apply twice)
  - Status state machine: APPLIED → SCREENING → SHORTLISTED → INTERVIEW → OFFERED → HIRED/REJECTED

**Task 3.2.3: Create Interview model**
- Acceptance Criteria:
  - Fields: id, applicationId (FK), stage (PHONE_SCREEN/TECHNICAL/CULTURE_FIT/FINAL), scheduledAt (datetime), duration (minutes), interviewerIds (User array), meetingLink, status (SCHEDULED/COMPLETED/CANCELLED/NO_SHOW), feedback (JSON array — per interviewer), aiGeneratedQuestions (text array), notes, createdAt

### Story 3.3: Payment Models

**Task 3.3.1: Create RecruitmentPayment model**
- Acceptance Criteria:
  - Fields: id, jobId (FK), companyId (FK), recruiterId (FK, nullable), candidateId (FK — who was hired), feeType (FIXED/PERCENTAGE_SALARY), feeAmount (decimal), totalAmount (decimal — actual amount charged), platformFee (decimal), recruiterAmount (decimal), stripePaymentIntentId, stripeTransferId, status (PENDING/AUTHORIZED/CAPTURED/PARTIALLY_PAID/COMPLETED/REFUNDED), milestones (JSON — for milestone-based payments), payoutSchedule (enum: IMMEDIATE/WEEKLY/MONTHLY/CUSTOM), paidAt, createdAt

**Task 3.3.2: Create PayoutSchedule model**
- Acceptance Criteria:
  - Fields: id, connectedAccountId, schedule (DAILY/WEEKLY/MONTHLY/MANUAL), delay_days (integer), anchor_day (integer — day of week/month), createdAt
  - Mapped to Stripe's `payouts.schedule` on connected account

### Story 3.4: Audit Model

**Task 3.4.1: Create AuditLog model**
- Acceptance Criteria:
  - Fields: id, action, entity, entityId, userId, companyId (nullable), ipAddress, details (JSON), createdAt
  - Append-only
  - Indexed for fast querying by entity + entityId

---

## Epic 4: Company Onboarding — Stripe Connect Custom (THE BIG ONE)

This is the most complex and important epic. Custom Connect means you build every onboarding form, collect all information, and submit it to Stripe via API. No Stripe-hosted pages.

### Story 4.1: Create Custom Connected Account

**Task 4.1.1: Build account creation endpoint (NestJS)**
- Acceptance Criteria:
  - NestJS service method: `createCustomAccount(companyId)`
  - `stripe.accounts.create({ type: 'custom', country: companyCountry, capabilities: { card_payments: { requested: true }, transfers: { requested: true } }, business_type: 'company', metadata: { companyId } })`
  - Store returned account ID on Company record
  - Set onboarding status to IN_PROGRESS
  - Code comment: "Custom = we build everything. Stripe trusts us to collect and submit verified information."

**Task 4.1.2: Understand Custom Connect requirements**
- Acceptance Criteria:
  - Code documentation explaining:
    - Custom Connect requires collecting: business details, representative info, beneficial owners, bank account, ToS acceptance
    - Requirements vary by country (US vs EU vs others)
    - `account.requirements.currently_due` tells you exactly what's needed
    - `account.requirements.errors` tells you what failed verification
    - Stripe verifies submitted information and may request more

### Story 4.2: Business Information Form

**Task 4.2.1: Build business info collection form**
- Acceptance Criteria:
  - Multi-step wizard UI (step 1 of onboarding)
  - Fields:
    - Legal business name
    - DBA (doing business as) name
    - Business type (individual, company, non_profit, government_entity)
    - Industry / MCC code (dropdown with common categories)
    - Business URL
    - Business phone
    - Tax ID (EIN for US, VAT for EU, etc.)
    - Business address (street, city, state, zip, country — with autocomplete)
    - Description of business
  - Client-side validation per field
  - Save progress (can resume later)

**Task 4.2.2: Submit business info to Stripe**
- Acceptance Criteria:
  - NestJS endpoint: `PUT /api/stripe-connect/:companyId/business`
  - Maps form data to Stripe account update:
    ```typescript
    stripe.accounts.update(accountId, {
      business_profile: { name, url, mcc, support_phone },
      company: { name, tax_id, address: {...}, phone },
    })
    ```
  - Handle Stripe validation errors (return field-level errors to UI)
  - Log audit event

### Story 4.3: Representative Information Form

**Task 4.3.1: Build representative info form**
- Acceptance Criteria:
  - Step 2 of wizard
  - Representative = the person filling out the form (authorized representative of the company)
  - Fields:
    - First name, Last name
    - Date of birth (day/month/year dropdowns)
    - Email, Phone
    - Home address
    - SSN last 4 (US) or full SSN if required
    - Relationship to company: title, is_owner (boolean), is_executive (boolean), is_director (boolean)
  - Sensitive data disclaimer: "This information is securely transmitted to Stripe for verification."

**Task 4.3.2: Submit representative to Stripe**
- Acceptance Criteria:
  - Uses Stripe Persons API: `stripe.accounts.createPerson(accountId, { first_name, last_name, dob: { day, month, year }, address, ssn_last_4, relationship: { representative: true, title, owner: boolean, executive: boolean } })`
  - Store Person ID locally
  - Handle errors

### Story 4.4: Beneficial Owners

**Task 4.4.1: Build beneficial owners collection**
- Acceptance Criteria:
  - Step 3 of wizard
  - Explanation: "Stripe requires information about anyone who owns 25% or more of the company."
  - Add multiple owners (same fields as representative: name, DOB, address, SSN, ownership percentage)
  - Each owner created via `stripe.accounts.createPerson(accountId, { relationship: { owner: true, percent_ownership } })`
  - "No additional owners" checkbox (if the representative is sole owner)
  - After all owners added: `stripe.accounts.update(accountId, { company: { owners_provided: true } })`

### Story 4.5: Stripe Identity Verification

**Task 4.5.1: Build identity verification flow**
- Acceptance Criteria:
  - Step 4 of wizard (triggered if Stripe requires identity verification)
  - Create VerificationSession: `stripe.identity.verificationSessions.create({ type: 'document', metadata: { companyId } })`
  - Types of verification:
    - Document: upload government ID (passport, driver's license)
    - Selfie: take a photo for face matching (optional, based on requirements)
  - Frontend: use Stripe's VerificationSession client-side SDK for secure document upload
  - Redirect or modal flow for document capture
  - Handle verification states: requires_input, processing, verified, canceled
  - Code comment: "Stripe Identity handles the actual document verification. We just create the session and handle the result."

**Task 4.5.2: Handle verification webhooks**
- Acceptance Criteria:
  - `identity.verification_session.verified`: mark verification as complete
  - `identity.verification_session.requires_input`: prompt user to re-upload
  - Update company onboarding status based on verification result

### Story 4.6: Bank Account Collection

**Task 4.6.1: Build bank account form**
- Acceptance Criteria:
  - Step 5 of wizard
  - Fields (US): routing number (9 digits), account number, account holder name, account type (checking/savings)
  - Fields vary by country (IBAN for EU, Sort Code for UK, etc.)
  - Uses `stripe.accounts.createExternalAccount(accountId, { external_account: { object: 'bank_account', country, currency, routing_number, account_number, account_holder_name, account_holder_type } })`
  - Alternative: debit card for instant payouts
  - Sensitive data never stored in our database (only in Stripe)
  - Show last 4 digits after submission for confirmation

### Story 4.7: Terms of Service Acceptance

**Task 4.7.1: Build ToS acceptance**
- Acceptance Criteria:
  - Step 6 (final step) of wizard
  - Display Stripe Connected Account Agreement link
  - Checkbox: "I accept the Stripe Connected Account Agreement"
  - Record acceptance details:
    ```typescript
    stripe.accounts.update(accountId, {
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: clientIpAddress,
        user_agent: clientUserAgent
      }
    })
    ```
  - Timestamp and IP stored for legal compliance
  - Cannot proceed without acceptance

### Story 4.8: Account Requirements Management

**Task 4.8.1: Build requirements monitoring**
- Acceptance Criteria:
  - After onboarding: periodically check `account.requirements`
  - `currently_due`: items that must be provided now (blocking)
  - `eventually_due`: items needed in the future (deadline)
  - `past_due`: overdue items (account may be restricted)
  - `errors`: items that failed verification (need to be re-submitted)
  - UI shows clear checklist of requirements with status per item
  - Alert banner on company dashboard if any requirements are past_due

**Task 4.8.2: Build account.updated webhook handler**
- Acceptance Criteria:
  - Listen for `account.updated` events
  - Update local record: chargesEnabled, payoutsEnabled, requirements status
  - If charges disabled: notify company, show alert
  - If new requirements appear: notify company to complete
  - Log all changes to audit trail

### Story 4.9: Account Management Dashboard

**Task 4.9.1: Build Stripe account status page**
- Acceptance Criteria:
  - Page at `/company/settings/payments`
  - Shows:
    - Account status: active (green) / restricted (yellow) / disabled (red)
    - Charges enabled: yes/no
    - Payouts enabled: yes/no
    - Outstanding requirements (if any) with "Complete Now" links
    - Bank account info (last 4 digits, bank name)
    - Payout schedule
    - Balance (if applicable)
  - "Update Bank Account" action
  - "Update Business Info" action
  - "View Stripe Dashboard" is NOT available for Custom Connect (unlike Express/Standard) — you ARE the dashboard

---

## Epic 5: Job Posting Management

### Story 5.1: Create Job Posting

**Task 5.1.1: Build job creation form**
- Acceptance Criteria:
  - Page at `/company/jobs/new`
  - Fields: title, description (rich editor), requirements, nice-to-haves, skills, experience level, employment type, location type, location, salary range, benefits, recruitment fee configuration
  - "Generate with AI" button for description (Claude API)
  - Save as draft or publish

**Task 5.1.2: Build AI job description generator**
- Acceptance Criteria:
  - NestJS service in AIModule
  - Accepts: title, required skills, experience level, company industry
  - Claude API generates: professional description, requirements list, nice-to-haves, benefits suggestions
  - Code comment: "Using Claude for generation because it excels at structured, professional writing."

### Story 5.2: Manage Job Postings

**Task 5.2.1: Build job management page**
- Acceptance Criteria:
  - Page at `/company/jobs`
  - Table: title, status, applications count, posted date, deadline, actions
  - Actions: edit, close, duplicate, view applications, assign recruiter
  - Filter by status, sort by date/applications

---

## Epic 6: Candidate Experience

### Story 6.1: Job Discovery

**Task 6.1.1: Build job search page**
- Acceptance Criteria:
  - Page at `/jobs` (public) and `/candidate/jobs` (authenticated with saved preferences)
  - Search by title, skills, company
  - Filters: experience level, employment type, location type, salary range, industry
  - Sort: newest, salary, relevance
  - Job card: title, company, location, salary range, posted date, skills badges

### Story 6.2: Application Submission

**Task 6.2.1: Build application flow**
- Acceptance Criteria:
  - "Apply" button on job detail page
  - Form: resume upload (PDF), cover letter (optional text), portfolio links
  - If resume already on profile: option to use existing
  - Application submitted: triggers AI resume parsing (Epic 7)
  - Confirmation page with application tracking link

---

## Epic 7: AI-Powered Resume Screening

### Story 7.1: Resume Parsing with Function Calling

**Task 7.1.1: Build resume text extraction**
- Acceptance Criteria:
  - NestJS service: extract text from uploaded PDF resume
  - Use `pdf-parse` npm package
  - Handle: multiple pages, tables, columns
  - Return raw text for AI processing

**Task 7.1.2: Build AI resume parser using OpenAI Function Calling**
- Acceptance Criteria:
  - This is a deep dive into Function Calling:
  - Define function schema for structured resume data:
    ```typescript
    const tools = [{
      type: 'function',
      function: {
        name: 'parse_resume',
        description: 'Extract structured data from a resume',
        parameters: {
          type: 'object',
          properties: {
            personal: { type: 'object', properties: { name, email, phone, location, linkedin } },
            summary: { type: 'string', description: 'Professional summary' },
            experience: { type: 'array', items: { type: 'object', properties: {
              company, title, startDate, endDate, isCurrent, responsibilities: { type: 'array' }, achievements: { type: 'array' }
            }}},
            education: { type: 'array', items: { ... } },
            skills: { type: 'object', properties: {
              technical: { type: 'array' },
              soft: { type: 'array' },
              tools: { type: 'array' },
              languages: { type: 'array' }
            }},
            certifications: { type: 'array' },
            totalYearsExperience: { type: 'number' }
          }
        }
      }
    }]
    ```
  - Send resume text with function definition to GPT-4
  - GPT-4 returns structured JSON matching the schema
  - Store parsed data in application record
  - Code comment: "Function Calling tells GPT-4 to output data in a specific JSON structure. Instead of parsing free-text responses, we get guaranteed structured output."

**Task 7.1.3: Handle function calling response**
- Acceptance Criteria:
  - Extract the function call arguments from the API response
  - Validate the returned JSON against expected schema
  - Handle: missing fields (some resumes don't have all sections), unexpected formats
  - If parsing fails: store raw text, flag for manual review
  - Track tokens used

### Story 7.2: AI Candidate Scoring

**Task 7.2.1: Build scoring endpoint**
- Acceptance Criteria:
  - NestJS service: `scoreCandidate(parsedResume, jobRequirements)`
  - Send both to GPT-4 with function calling:
    ```typescript
    const scoringTools = [{
      type: 'function',
      function: {
        name: 'score_candidate',
        parameters: {
          properties: {
            overallScore: { type: 'number', minimum: 0, maximum: 100 },
            skillsMatch: { type: 'number', minimum: 0, maximum: 100 },
            experienceMatch: { type: 'number', minimum: 0, maximum: 100 },
            educationMatch: { type: 'number', minimum: 0, maximum: 100 },
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string', enum: ['strong_yes', 'yes', 'maybe', 'no'] },
            explanation: { type: 'string' }
          }
        }
      }
    }]
    ```
  - Score stored on application record
  - Explanation visible to hiring team (not candidate)

**Task 7.2.2: Build candidate ranking view**
- Acceptance Criteria:
  - Page at `/company/jobs/:id/applications`
  - Table sorted by AI score (highest first)
  - Columns: candidate name, AI score (with color), recommendation badge, applied date, status, actions
  - Click to expand: score breakdown, strengths/weaknesses, AI explanation
  - Filter by: score range, recommendation, status

### Story 7.3: AI Interview Questions

**Task 7.3.1: Build interview question generator**
- Acceptance Criteria:
  - NestJS service: `generateInterviewQuestions(jobDescription, candidateResume, interviewStage)`
  - Generates role-specific questions tailored to candidate's background
  - Categories: technical, behavioral, situational, culture fit
  - For technical roles: coding-related questions based on required skills
  - Highlights resume gaps to explore
  - 10-15 questions per interview stage
  - Stored in Interview record

### Story 7.4: AI Bias Mitigation

**Task 7.4.1: Implement bias mitigation**
- Acceptance Criteria:
  - Before sending to AI: strip demographic indicators (name → anonymized, photos removed)
  - System prompt includes: "Score based solely on skills, experience, and qualifications. Do not consider age, gender, ethnicity, or educational institution prestige."
  - Audit trail for all AI scoring decisions
  - Admin can review AI scoring patterns for bias
  - Documentation: "AI scoring is a tool to assist human decision-making, not replace it."

---

## Epic 8: Interview Management

### Story 8.1: Interview Scheduling

**Task 8.1.1: Build interview scheduling**
- Acceptance Criteria:
  - Schedule interviews per application
  - Fields: stage, date/time, duration, interviewer(s), meeting link
  - Email invitation sent to candidate and interviewers
  - Calendar-style view for company
  - Candidate can accept/decline/propose alternative

### Story 8.2: Interview Feedback

**Task 8.2.1: Build feedback forms**
- Acceptance Criteria:
  - After interview: interviewer fills feedback form
  - Fields: rating (1-5 per category), notes, recommendation (hire/no-hire/next-round)
  - Multiple interviewers' feedback aggregated
  - Feedback visible to hiring team (not candidate)

---

## Epic 9: Payment Flows

### Story 9.1: Fee Structure

**Task 9.1.1: Configure recruitment fee types**
- Acceptance Criteria:
  - Fixed fee: flat amount per hire (e.g., $5,000)
  - Percentage: percentage of candidate's annual salary (e.g., 15%)
  - Retainer: upfront fee + success fee
  - Platform commission: 10-15% on top of recruitment fee
  - Fee configured per job posting
  - Fee agreed between company and recruiter before job assignment

### Story 9.2: Payment on Hire

**Task 9.2.1: Build payment trigger**
- Acceptance Criteria:
  - When application status → HIRED:
  - Calculate total fee based on fee type
  - If percentage: prompt for candidate's accepted salary to calculate
  - Create RecruitmentPayment record
  - Initiate payment collection from company

**Task 9.2.2: Build payment collection**
- Acceptance Criteria:
  - Create Stripe PaymentIntent:
    - `amount`: total recruitment fee
    - `customer`: company's Stripe customer ID
    - `metadata`: { jobId, companyId, recruiterId, candidateId }
    - No `transfer_data` here (we use separate charges and transfers)
  - Company pays via Stripe Elements or saved payment method
  - After payment succeeds: create transfer to recruiter

### Story 9.3: Multi-Party Payment Split

**Task 9.3.1: Build transfer to recruiter**
- Acceptance Criteria:
  - After PaymentIntent succeeds:
  - Calculate split: recruiterAmount = totalAmount - platformFee
  - Create transfer: `stripe.transfers.create({ amount: recruiterAmount, currency, destination: recruiterStripeAccountId, source_transaction: chargeId, metadata: { paymentId, jobId } })`
  - `source_transaction` links the transfer to the original charge (important for refunds)
  - Update payment status to COMPLETED
  - Log audit event
  - Code comment: "Separate Charges and Transfers: we charge the company (charge goes to platform), then manually transfer to recruiter. This gives us full control over timing and amounts."

### Story 9.4: Custom Payout Schedules

**Task 9.4.1: Configure payout schedule per connected account**
- Acceptance Criteria:
  - Endpoint: `PUT /api/stripe-connect/:accountId/payout-schedule`
  - Options: daily, weekly (pick day), monthly (pick date), manual
  - Calls: `stripe.accounts.update(accountId, { settings: { payouts: { schedule: { interval, weekly_anchor, monthly_anchor, delay_days } } } })`
  - Display payout schedule in recruiter dashboard
  - Code comment: "Payout schedule controls when Stripe sends money from the connected account's Stripe balance to their bank account."

### Story 9.5: Milestone-Based Payments

**Task 9.5.1: Build milestone payment flow**
- Acceptance Criteria:
  - Alternative to one-time payment: split into milestones
  - Example: 30% on shortlist delivery, 70% on successful hire
  - Milestones defined in RecruitmentPayment (JSON array)
  - Each milestone has: description, percentage, status, paymentIntentId
  - Company approves milestone → triggers partial payment + transfer
  - All milestones completed → payment record marked COMPLETED

### Story 9.6: Refund Policy

**Task 9.6.1: Build refund flow**
- Acceptance Criteria:
  - If hired candidate leaves within guarantee period (e.g., 90 days):
  - Partial or full refund to company
  - `stripe.refunds.create({ payment_intent, amount: refundAmount, reverse_transfer: true })`
  - `reverse_transfer: true` claws back from recruiter
  - Proportional refund based on how soon candidate left
  - Documentation of refund policy

### Story 9.7: Invoice Generation

**Task 9.7.1: Build invoice for recruitment fees**
- Acceptance Criteria:
  - PDF invoice generated for company
  - Contains: company details, candidate hired, fee calculation, platform fee breakdown
  - Accessible from company billing page
  - Emailed on payment success

---

## Epic 10: Admin Panel

### Story 10.1: Multi-Tenant Admin Dashboard

**Task 10.1.1: Build admin overview**
- Acceptance Criteria:
  - Stats: companies, candidates, recruiters, active jobs, placements, revenue
  - Charts: placements over time, revenue over time
  - Recent activity feed

**Task 10.1.2: Build entity management pages**
- Acceptance Criteria:
  - Companies: list, detail, connected account status, billing
  - Candidates: list, detail, applications, AI scores
  - Recruiters: list, detail, placements, earnings, connected account status
  - Jobs: list, moderation, analytics
  - Payments: transaction log, transfers, refunds
  - Connected accounts: all Custom accounts with requirement status
  - AI usage: total tokens, costs, scoring patterns
  - Audit logs: searchable, filterable

---

## Epic 11: Notifications

### Story 11.1: Notification System

**Task 11.1.1: Build notifications**
- Acceptance Criteria:
  - In-app notification bell with unread count
  - Email notifications for: new application, status change, interview invite, payment, hire, Stripe account issues
  - Notification preferences (per user, per type)
  - NestJS EventEmitter pattern for decoupled notification triggers

---

## Epic 12: Security & Compliance

### Story 12.1: PCI-DSS for Custom Connect

**Task 12.1.1: Understand Custom Connect PCI implications**
- Acceptance Criteria:
  - Code documentation: "Custom Connect has higher PCI responsibility than Express/Standard"
  - Bank account numbers: collected via Stripe.js tokenization (never on our server)
  - SSN: collected via Stripe.js token or API directly (over HTTPS, never logged)
  - All sensitive fields handled by Stripe — we only send data via Stripe SDK
  - PCI-DSS SAQ-A still applies if we never handle card data directly

### Story 12.2: GDPR for Candidate Data

**Task 12.2.1: Implement candidate data protection**
- Acceptance Criteria:
  - Candidate data is highly sensitive (PII + employment history)
  - Explicit consent before AI processing of resume
  - Data minimization: only collect what's needed
  - Right to erasure: delete all candidate data on request
  - Data retention: auto-delete rejected applications after 6 months
  - Resume files encrypted at rest
  - Access logs for who viewed candidate data
  - Privacy policy specific to candidate data handling

### Story 12.3: Security Measures

**Task 12.3.1: Implement security**
- Acceptance Criteria:
  - NestJS Helmet (security headers)
  - NestJS ThrottlerModule (rate limiting)
  - Class-validator for input validation on all DTOs
  - Prisma parameterized queries (SQL injection prevention)
  - CORS restricted
  - CSRF protection
  - File upload validation
  - Audit logging for all financial and candidate data operations
  - Sensitive data encryption (SSN, bank details → only via Stripe)

---

## Epic 13: Testing

### Story 13.1: Tests

**Task 13.1.1: Unit tests**
- Acceptance Criteria:
  - Test AI resume parsing (mock OpenAI, verify structured output)
  - Test AI scoring (verify score calculation, bias mitigation)
  - Test payment split calculation
  - Test milestone payment logic
  - Test fee calculation (fixed vs percentage)
  - NestJS testing with Jest + testing module

**Task 13.1.2: Integration tests**
- Acceptance Criteria:
  - Test Custom Connect onboarding flow (mock Stripe)
  - Test payment → transfer flow
  - Test application status state machine
  - Test webhook processing

**Task 13.1.3: E2E tests**
- Acceptance Criteria:
  - Company onboards → Posts job → Candidate applies → AI scores → Interview → Hire → Payment → Recruiter paid

---

## Epic 14: UI/UX

### Story 14.1: Design & Layout

**Task 14.1.1: Build responsive UI**
- Acceptance Criteria:
  - Mantine UI component system
  - Multi-role dashboards (different layouts per role)
  - Onboarding wizard (stepped form for Custom Connect — this is critical UX)
  - Application tracking board (Kanban-style)
  - Resume viewer component
  - Dark mode
  - Responsive on mobile

---

## Production Checklist

### Stripe Connect Custom
- [ ] Custom accounts created with correct capabilities and business_type
- [ ] Business info, representative, owners all submitted via API
- [ ] Stripe Identity verification sessions working
- [ ] Bank account collected via tokenization (never raw on server)
- [ ] ToS acceptance recorded with IP + timestamp
- [ ] account.requirements monitored via webhooks
- [ ] Disabled accounts trigger gig pausing and user notification
- [ ] All onboarding states handled in UI (not started, in progress, action required, complete)
- [ ] Country-specific requirements handled (US vs EU)

### Payments
- [ ] Separate charges and transfers pattern implemented correctly
- [ ] Platform fee calculated and retained correctly
- [ ] Transfers linked to source_transaction for refund traceability
- [ ] Custom payout schedules configurable
- [ ] Milestone payments work for partial payments
- [ ] Refunds reverse transfers proportionally
- [ ] All payment events logged to audit trail

### AI
- [ ] Function calling schemas defined and validated
- [ ] Resume parsing handles edge cases (incomplete resumes, non-standard formats)
- [ ] AI scoring includes bias mitigation
- [ ] All AI decisions auditable
- [ ] Token usage tracked and limited
- [ ] AI is assistant, not decision-maker (human review required)

### Security
- [ ] PCI-DSS: sensitive data via Stripe SDK only
- [ ] GDPR: candidate data consent, export, deletion, retention
- [ ] Candidate data access logged
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all DTOs
- [ ] File upload validation
- [ ] Multi-tenant data isolation (companies can't see each other's data)
