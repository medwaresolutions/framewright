import type { GeneratedFile } from "@/types/export";

export interface ExampleProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  techStack: string[];
  features: string[];
  taskCount: number;
  files: GeneratedFile[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function f(
  path: string,
  content: string,
  category: GeneratedFile["category"] = "root"
): GeneratedFile {
  const filename = path.split("/").pop() || path;
  return {
    path,
    filename,
    content: content.trim() + "\n",
    wordCount: content.split(/\s+/).length,
    category,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ClinicFlow — SaaS Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

const clinicflowFiles: GeneratedFile[] = [
  // ── PROJECT.md ──
  f(
    "PROJECT.md",
    `# ClinicFlow

## Vision
A modern clinic management dashboard that streamlines patient intake, appointment scheduling, and clinical workflow. Built for small-to-medium medical practices that need a fast, reliable system without enterprise bloat.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |
| Auth | Supabase Auth with RLS |

## Core Principles
- **Server-first**: Use React Server Components by default. Client components only when interactivity is required.
- **Type-safe**: Full TypeScript. No \`any\`. Database types generated from Supabase.
- **Accessible**: WCAG 2.1 AA compliance. Medical software must be usable by everyone.
- **Offline-aware**: Graceful degradation when connectivity drops. Queue mutations and sync.

## Project Scope
This framework covers the initial MVP: authentication, patient CRUD, appointment booking, and a dashboard with basic analytics. Future phases (billing, telehealth, lab integrations) are out of scope.

## Target Users
| Role | Description |
|------|------------|
| Receptionist | Books appointments, manages patient intake |
| Provider | Views schedule, accesses patient records |
| Admin | Manages users, views analytics, configures settings |
`
  ),

  // ── docs/CONVENTIONS.md ──
  f(
    "docs/CONVENTIONS.md",
    `# Conventions

## File & Folder Structure

\`\`\`
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth-gated route group
│   │   ├── dashboard/
│   │   ├── patients/
│   │   └── appointments/
│   ├── (public)/           # Public routes (login, signup)
│   └── api/                # Route handlers (minimal — prefer server actions)
├── components/
│   ├── ui/                 # shadcn/ui primitives (Button, Card, etc.)
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client (cookies-based)
│   │   └── admin.ts        # Service-role client (server only)
│   ├── validators/         # Zod schemas
│   └── utils.ts
├── hooks/                  # Client-side hooks
├── types/                  # Shared TypeScript types
└── actions/                # Server actions grouped by domain
\`\`\`

## Component Rules

### Server Components (default)
- All components in \`app/\` are Server Components unless marked \`"use client"\`
- Fetch data directly using the Supabase server client
- Never import \`useState\`, \`useEffect\`, or browser APIs

### Client Components
- Add \`"use client"\` directive at the top of the file
- Keep as small as possible — wrap interactivity in thin client components
- Example pattern: Server component fetches data → passes to client component for interaction

### Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | \`PatientCard.tsx\` |
| Utilities | camelCase | \`formatPhoneNumber.ts\` |
| Server actions | camelCase, verb-first | \`createPatient.ts\` |
| Types | PascalCase, suffixed | \`PatientRow\`, \`AppointmentInsert\` |
| Zod schemas | camelCase + Schema | \`createPatientSchema\` |

## Error Handling

### Error Objects
All server actions return a result object — never throw:

\`\`\`typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string };
\`\`\`

### Database Errors
Wrap Supabase calls and translate Postgres error codes:

\`\`\`typescript
const { data, error } = await supabase.from("patients").insert(values);
if (error) {
  if (error.code === "23505") return { success: false, error: "Patient already exists" };
  return { success: false, error: "Failed to create patient" };
}
return { success: true, data };
\`\`\`

### Form Validation
Validate on both client (for UX) and server (for security) using the same Zod schema.

## Supabase Patterns

### RLS-First
Every table has Row Level Security enabled. No exceptions.

### Client Creation
- **Browser**: \`createBrowserClient()\` from \`@supabase/ssr\`
- **Server Components / Route Handlers**: \`createServerClient()\` with cookie adapter
- **Server Actions**: \`createServerClient()\` (same as above, actions run server-side)
- **Admin operations**: \`createClient()\` with service role key (only in trusted server code)

### Realtime
Use Supabase Realtime for appointment status changes. Subscribe in client components, clean up on unmount.

## Git Conventions
- Branch: \`feat/task-name\`, \`fix/description\`
- Commits: conventional commits (\`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`)
- PR: one task = one PR. Squash merge.
`,
    "docs"
  ),

  // ── docs/ARCHITECTURE.md ──
  f(
    "docs/ARCHITECTURE.md",
    `# Architecture

## System Overview

\`\`\`
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Next.js (Vercel) │────▶│   Supabase   │
│  (React SPA) │◀────│  Server Actions   │◀────│  PostgreSQL  │
└─────────────┘     │  Route Handlers   │     │  Auth + RLS  │
                    └──────────────────┘     │  Realtime    │
                                             │  Storage     │
                                             └──────────────┘
\`\`\`

## Data Flow

### Read Path (Server Component)
1. User navigates to \`/patients\`
2. Next.js Server Component runs on server
3. Creates Supabase server client with user's cookies
4. Queries \`patients\` table — RLS filters to their clinic
5. Returns rendered HTML (streamed via React Suspense)

### Write Path (Server Action)
1. User submits patient form (Client Component)
2. Form calls server action \`createPatient(formData)\`
3. Server action validates with Zod
4. Inserts via Supabase server client (RLS enforced)
5. Returns \`ActionResult<Patient>\`
6. Client revalidates path via \`revalidatePath()\`

### Realtime Path
1. Client component subscribes to \`appointments\` channel
2. Supabase broadcasts INSERT/UPDATE events
3. Component updates local state optimistically
4. Used for: appointment status changes, new bookings appearing on schedule

## Authentication Flow

1. User visits \`/login\`
2. Submits credentials → Supabase Auth \`signInWithPassword()\`
3. Supabase sets HTTP-only cookie (handled by \`@supabase/ssr\`)
4. Middleware checks session on every request to \`/(auth)/*\`
5. If no session → redirect to \`/login\`
6. RLS policies use \`auth.uid()\` and a \`user_roles\` table for RBAC

## Role-Based Access

| Role | Dashboard | Patients (read) | Patients (write) | Appointments | Settings |
|------|-----------|-----------------|-------------------|-------------|----------|
| receptionist | ✓ | ✓ | ✓ | ✓ | ✗ |
| provider | ✓ | ✓ | ✗ | ✓ (own) | ✗ |
| admin | ✓ | ✓ | ✓ | ✓ | ✓ |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| \`app/(auth)/\` | All authenticated pages |
| \`app/(public)/\` | Login, signup, forgot password |
| \`actions/\` | Server actions (database mutations) |
| \`lib/supabase/\` | Supabase client factories |
| \`lib/validators/\` | Zod schemas shared client/server |
| \`components/ui/\` | shadcn/ui base components |
`,
    "docs"
  ),

  // ── docs/SCHEMA.md ──
  f(
    "docs/SCHEMA.md",
    `# Database Schema

## Overview
All tables live in Supabase PostgreSQL. Row Level Security (RLS) is enabled on every table. The \`auth.users\` table is managed by Supabase Auth; we extend it with \`profiles\` and \`user_roles\`.

## Tables

### profiles
Extends Supabase Auth users with app-specific data.

\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  clinic_id UUID REFERENCES clinics(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
\`\`\`

### clinics
Multi-tenant: every data row is scoped to a clinic.

\`\`\`sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members can read their clinic"
  ON clinics FOR SELECT
  USING (
    id IN (SELECT clinic_id FROM profiles WHERE profiles.id = auth.uid())
  );
\`\`\`

### user_roles
RBAC: maps users to roles within a clinic.

\`\`\`sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'provider', 'receptionist')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Helper function for RLS policies
CREATE OR REPLACE FUNCTION public.user_has_role(_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER;
\`\`\`

### patients

\`\`\`sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  medicare_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members read their patients"
  ON patients FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Receptionist and admin can insert patients"
  ON patients FOR INSERT
  WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    AND (public.user_has_role('receptionist') OR public.user_has_role('admin'))
  );
\`\`\`

### providers

\`\`\`sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  specialty TEXT,
  consultation_duration_min INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members read providers"
  ON providers FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );
\`\`\`

### appointments

\`\`\`sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  provider_id UUID NOT NULL REFERENCES providers(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  type TEXT NOT NULL DEFAULT 'standard'
    CHECK (type IN ('standard', 'follow_up', 'urgent', 'telehealth')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (ends_at > starts_at)
);

CREATE INDEX idx_appointments_provider_date ON appointments(provider_id, starts_at);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members read appointments"
  ON appointments FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );
\`\`\`

## Entity Relationships
\`\`\`
clinics 1──* profiles
clinics 1──* patients
clinics 1──* providers
clinics 1──* appointments
patients 1──* appointments
providers 1──* appointments
auth.users 1──1 profiles
auth.users 1──* user_roles
\`\`\`
`,
    "docs"
  ),

  // ── docs/STYLING.md ──
  f(
    "docs/STYLING.md",
    `# Styling Guide

## Design System

### Palette
| Token | Hex | Usage |
|-------|-----|-------|
| primary | \`#2563EB\` (blue-600) | Primary buttons, links, active states |
| primary-foreground | \`#FFFFFF\` | Text on primary |
| background | \`#FFFFFF\` | Page background |
| card | \`#F8FAFC\` (slate-50) | Card backgrounds |
| muted | \`#F1F5F9\` (slate-100) | Subtle backgrounds, disabled states |
| border | \`#E2E8F0\` (slate-200) | Borders and dividers |
| foreground | \`#0F172A\` (slate-900) | Primary text |
| muted-foreground | \`#64748B\` (slate-500) | Secondary text |
| destructive | \`#DC2626\` (red-600) | Errors, delete actions |
| success | \`#16A34A\` (green-600) | Success states, confirmed |
| warning | \`#D97706\` (amber-600) | Warnings, pending states |

### Typography
- **Font**: Inter (system fallback: -apple-system, sans-serif)
- **Headings**: font-semibold, tracking-tight
- **Body**: text-sm (14px) for dense data, text-base (16px) for reading

### Spacing
Use Tailwind's default scale. Prefer \`gap-*\` over margins for flex/grid layouts.

## Component Patterns

### Data Tables
Use shadcn/ui \`<Table>\` for patient lists and appointment logs:
- Sticky header
- Row hover state (\`hover:bg-muted/50\`)
- Sortable columns via URL params (server-side)
- Pagination at bottom

### Cards
- Clean white cards with subtle border
- \`rounded-lg border bg-card p-6\`
- Use for dashboard stats, patient summary

### Forms
- Labels above inputs
- Error messages below inputs in \`text-destructive text-sm\`
- Submit button right-aligned
- Loading state: disable button + spinner

### Status Badges
| Status | Color |
|--------|-------|
| scheduled | \`bg-blue-100 text-blue-800\` |
| confirmed | \`bg-green-100 text-green-800\` |
| in_progress | \`bg-amber-100 text-amber-800\` |
| completed | \`bg-slate-100 text-slate-800\` |
| cancelled | \`bg-red-100 text-red-800\` |
| no_show | \`bg-red-100 text-red-800\` |

## Layout
- Sidebar navigation on desktop (240px fixed)
- Top nav on mobile with hamburger
- Content area: \`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\`
- Dashboard grid: \`grid-cols-1 md:grid-cols-2 lg:grid-cols-4\` for stat cards
`,
    "docs"
  ),

  // ── features/FEATURES-INDEX.md ──
  f(
    "features/FEATURES-INDEX.md",
    `# Features Index

| ID | Feature | Status | Priority |
|----|---------|--------|----------|
| F-001 | Authentication & RBAC | 🔴 Not started | P0 |
| F-002 | Patient Management | 🔴 Not started | P0 |
| F-003 | Appointment Booking | 🔴 Not started | P0 |
| F-004 | Dashboard & Analytics | 🔴 Not started | P1 |

## Dependencies
- F-002 depends on F-001 (need auth context for RLS)
- F-003 depends on F-001 and F-002 (appointments link patients to providers)
- F-004 depends on F-002 and F-003 (dashboard queries patient and appointment data)
`,
    "features"
  ),

  // ── features/auth.md ──
  f(
    "features/auth.md",
    `# F-001: Authentication & RBAC

## Overview
Users authenticate via email/password through Supabase Auth. Upon login, the app checks their role (admin, provider, receptionist) and scopes their access accordingly.

## User Stories
- As a **receptionist**, I can log in and see the appointment schedule and patient list for my clinic.
- As a **provider**, I can log in and see my own schedule and patient records.
- As an **admin**, I can manage users, assign roles, and access all features.
- As any user, I can reset my password via email.

## Requirements

### Authentication
- Email/password sign-in and sign-up
- Session managed via HTTP-only cookies (\`@supabase/ssr\`)
- Middleware protects all \`/(auth)/*\` routes
- Redirect to \`/login\` if no session; redirect to \`/dashboard\` after login

### Role-Based Access
- Roles stored in \`user_roles\` table (not in JWT custom claims for simplicity in MVP)
- Server actions check role before mutations
- UI conditionally renders based on role (hide "Settings" from non-admins)

### Pages
| Route | Access | Purpose |
|-------|--------|---------|
| \`/login\` | Public | Sign in form |
| \`/signup\` | Public | Registration (admin invites in v2) |
| \`/forgot-password\` | Public | Password reset request |

## Technical Notes
- Use Supabase's \`onAuthStateChange\` only in a thin client-side provider for session refresh
- The \`profiles\` row is created via a Postgres trigger on \`auth.users\` insert
- Role check helper: \`getUserRole(supabase)\` returns the current user's role from \`user_roles\`
`,
    "features"
  ),

  // ── features/patient-management.md ──
  f(
    "features/patient-management.md",
    `# F-002: Patient Management

## Overview
Core patient CRUD: create new patient records, view a filterable list, open a patient detail page, and edit or archive records. All data scoped to the user's clinic via RLS.

## User Stories
- As a **receptionist**, I can register a new patient with their demographics and contact info.
- As a **receptionist**, I can search the patient list by name, DOB, or Medicare number.
- As a **provider**, I can view a patient's full record including notes and appointment history.
- As an **admin**, I can archive a patient (soft-delete).

## Requirements

### Patient List (\`/patients\`)
- Server Component — fetches patients with pagination
- Search bar (debounced, updates URL params)
- Sort by last name, created date
- Status filter: active / inactive / archived
- Table rows link to patient detail

### Patient Detail (\`/patients/[id]\`)
- Shows full demographics, contact info, notes
- Tabs: Overview | Appointments | Notes
- Edit button opens inline form (Client Component)

### Create Patient (\`/patients/new\`)
- Form with validation (Zod schema shared client/server)
- Fields: first name*, last name*, DOB*, email, phone, address, Medicare number
- Server action: \`createPatient(formData)\`
- On success: redirect to patient detail page

### Edit Patient
- Inline edit on detail page
- Server action: \`updatePatient(id, formData)\`
- Optimistic update on client

## Validation Schema
\`\`\`typescript
const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().date("Invalid date format"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  medicareNumber: z.string().regex(/^\\d{10}$/, "Must be 10 digits").optional().or(z.literal("")),
});
\`\`\`
`,
    "features"
  ),

  // ── features/appointment-booking.md ──
  f(
    "features/appointment-booking.md",
    `# F-003: Appointment Booking

## Overview
A calendar-based appointment system. Receptionists create and manage bookings. Providers see their daily schedule. Supports status tracking from scheduled through to completed.

## User Stories
- As a **receptionist**, I can book an appointment by selecting a patient, provider, date, time, and type.
- As a **receptionist**, I can view all appointments for a given day or week.
- As a **provider**, I can see my schedule for today and mark appointments as in-progress or completed.
- As any user, I can filter appointments by provider, status, or date range.

## Requirements

### Schedule View (\`/appointments\`)
- Default view: today's appointments for all providers
- Toggle: day / week view
- Columns grouped by provider
- Color-coded by status (see STYLING.md)
- Click appointment → slide-over panel with details

### Book Appointment (\`/appointments/new\`)
- Step 1: Select patient (search autocomplete)
- Step 2: Select provider + appointment type
- Step 3: Pick date/time (show provider availability)
- Step 4: Confirm and book
- Server action: \`createAppointment(data)\`
- Conflict detection: reject if provider already has booking in that slot

### Appointment Actions
| Action | Allowed Roles | Transition |
|--------|--------------|------------|
| Confirm | receptionist, admin | scheduled → confirmed |
| Start | provider | confirmed → in_progress |
| Complete | provider | in_progress → completed |
| Cancel | receptionist, admin | any → cancelled |
| No-show | receptionist, admin | scheduled/confirmed → no_show |

### Realtime Updates
- Subscribe to \`appointments\` table changes filtered by \`clinic_id\`
- When another user updates a status, reflect immediately on the schedule view

## Technical Notes
- Availability is calculated server-side: query provider's existing appointments for the date, subtract from their working hours
- Working hours stored in \`providers.settings\` JSONB (default 9am–5pm)
- Appointment duration from \`providers.consultation_duration_min\`
`,
    "features"
  ),

  // ── features/dashboard.md ──
  f(
    "features/dashboard.md",
    `# F-004: Dashboard & Analytics

## Overview
The landing page after login. Shows key metrics, today's schedule at a glance, and quick actions. Designed for a receptionist or admin who needs an instant overview of the day.

## User Stories
- As a **receptionist**, I can see at a glance how many appointments are today and their statuses.
- As an **admin**, I can see high-level metrics: total patients, appointments this week, new patients this month.
- As a **provider**, I can see my upcoming appointments for today.

## Requirements

### Stat Cards
| Metric | Query |
|--------|-------|
| Today's Appointments | COUNT where \`starts_at\` is today |
| Confirmed | COUNT where status = 'confirmed' and today |
| New Patients (this month) | COUNT where \`created_at\` >= start of month |
| Total Active Patients | COUNT where status = 'active' |

### Today's Schedule (Mini)
- List of next 5 upcoming appointments
- Shows time, patient name, provider, status badge
- Click → navigates to full appointment detail

### Quick Actions
- "New Patient" button → \`/patients/new\`
- "Book Appointment" button → \`/appointments/new\`

### Provider-Specific View
- If logged-in user is a provider, show only their appointments
- If receptionist/admin, show all providers

## Technical Notes
- All queries run server-side in a single Server Component
- Use \`Promise.all\` to parallelize the stat queries
- Cache with \`revalidate: 60\` (data is near-real-time, not instant)
`,
    "features"
  ),

  // ── tasks/TASKS-MASTER.md ──
  f(
    "tasks/TASKS-MASTER.md",
    `# Tasks Master

## Task Order
| # | Task | Depends On | Est. Effort |
|---|------|-----------|-------------|
| 000 | Project Skeleton | — | 2h |
| 001 | Authentication | 000 | 4h |
| 002 | Patient API & Data | 001 | 3h |
| 003 | Patient UI | 002 | 4h |
| 004 | Appointment Booking | 002 | 6h |
| 005 | Dashboard & Analytics | 003, 004 | 3h |

## Working With Tasks
Each task file contains everything an AI coding agent needs:
- **Context to load** — which docs and features to read first
- **Acceptance criteria** — what "done" looks like
- **Implementation steps** — ordered, specific instructions
- **Verification** — how to test the result

Complete tasks in order. Each builds on the previous.
`,
    "tasks"
  ),

  // ── tasks/000-skeleton.md ──
  f(
    "tasks/000-skeleton.md",
    `# Task 000: Project Skeleton

## Context
Load: \`PROJECT.md\`, \`docs/CONVENTIONS.md\`, \`docs/STYLING.md\`

## Objective
Set up the Next.js project with all tooling, base layout, and Supabase configuration. After this task, you should have a running app with a sidebar layout and placeholder pages.

## Acceptance Criteria
- [ ] Next.js 14 app created with App Router, TypeScript, Tailwind
- [ ] shadcn/ui initialized with the medical blue theme
- [ ] Supabase client utilities created (browser, server, admin)
- [ ] Base layout with sidebar navigation and mobile nav
- [ ] Placeholder pages: /login, /dashboard, /patients, /appointments
- [ ] Environment variables documented in \`.env.example\`
- [ ] TypeScript strict mode, ESLint, Prettier configured

## Steps
1. Create Next.js app: \`npx create-next-app@latest clinicflow --typescript --tailwind --app --src-dir\`
2. Install dependencies: \`@supabase/supabase-js @supabase/ssr zod lucide-react\`
3. Initialize shadcn/ui: \`npx shadcn-ui@latest init\` — set baseColor to slate, primary to blue-600
4. Create \`src/lib/supabase/client.ts\`, \`server.ts\`, \`admin.ts\` per CONVENTIONS.md
5. Create route groups: \`app/(auth)/\` and \`app/(public)/\`
6. Build sidebar layout component: logo, nav links (Dashboard, Patients, Appointments), user menu
7. Create placeholder pages that render the layout with "Coming soon" content
8. Add \`.env.example\` with \`NEXT_PUBLIC_SUPABASE_URL\`, \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`, \`SUPABASE_SERVICE_ROLE_KEY\`

## Verification
- \`npm run build\` succeeds with no errors
- \`npm run dev\` shows the sidebar layout on all auth pages
- Navigating between pages works
`,
    "tasks"
  ),

  // ── tasks/001-auth.md ──
  f(
    "tasks/001-auth.md",
    `# Task 001: Authentication

## Context
Load: \`PROJECT.md\`, \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (profiles, user_roles), \`features/auth.md\`

## Objective
Implement Supabase Auth with email/password, middleware-based route protection, and role-based access. After this task, users can sign up, log in, and access protected pages based on their role.

## Acceptance Criteria
- [ ] Login page with email/password form
- [ ] Sign-up page with registration form
- [ ] Forgot password page with reset flow
- [ ] Middleware redirects unauthenticated users to /login
- [ ] Middleware redirects authenticated users from /login to /dashboard
- [ ] Profiles table trigger creates a profile row on user signup
- [ ] user_roles table seeded with initial admin
- [ ] \`getUserRole()\` utility returns current user's role
- [ ] Auth state provider refreshes session client-side

## Steps
1. Run the SQL from SCHEMA.md to create \`profiles\`, \`user_roles\` tables and RLS policies
2. Create the Postgres trigger: on \`auth.users\` insert → insert into \`profiles\`
3. Build \`/login\` page with form, server action \`signIn(formData)\`
4. Build \`/signup\` page with form, server action \`signUp(formData)\`
5. Build \`/forgot-password\` page
6. Create middleware.ts: check session, redirect logic
7. Create \`lib/auth/get-user-role.ts\` helper
8. Create \`components/auth/auth-provider.tsx\` client component for session refresh
9. Seed: insert an admin user role for the first signup

## Verification
- Sign up → profile row created → redirected to dashboard
- Log out → redirected to login
- Direct URL to /dashboard while logged out → login redirect
- Role appears correctly in server component
`,
    "tasks"
  ),

  // ── tasks/002-patient-api.md ──
  f(
    "tasks/002-patient-api.md",
    `# Task 002: Patient API & Data Layer

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (patients), \`features/patient-management.md\`

## Objective
Create the patients database table, Zod validation schemas, TypeScript types, and server actions for patient CRUD. No UI in this task — just the data layer.

## Acceptance Criteria
- [ ] Patients table created with RLS policies
- [ ] TypeScript types generated/defined for Patient
- [ ] Zod schemas: \`createPatientSchema\`, \`updatePatientSchema\`
- [ ] Server actions: \`createPatient\`, \`updatePatient\`, \`getPatients\`, \`getPatient\`
- [ ] Search function: \`searchPatients(query, filters)\`
- [ ] All actions return \`ActionResult<T>\` pattern

## Steps
1. Run SQL from SCHEMA.md for \`patients\` table + indexes + RLS
2. Define types in \`types/patient.ts\`: \`PatientRow\`, \`PatientInsert\`, \`PatientUpdate\`
3. Create Zod schemas in \`lib/validators/patient.ts\`
4. Create server actions in \`actions/patients.ts\`:
   - \`createPatient(formData)\`: validate → insert → return result
   - \`updatePatient(id, formData)\`: validate → update → return result
   - \`getPatients(params)\`: paginated list with search/filter
   - \`getPatient(id)\`: single patient by ID
5. Add \`searchPatients\` using Postgres full-text search or ILIKE

## Verification
- Call \`createPatient\` from a test script → row appears in Supabase
- Call \`getPatients\` → returns paginated results
- Invalid data returns validation errors, not crashes
`,
    "tasks"
  ),

  // ── tasks/003-patient-ui.md ──
  f(
    "tasks/003-patient-ui.md",
    `# Task 003: Patient UI

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/STYLING.md\`, \`features/patient-management.md\`, \`tasks/002-patient-api.md\`

## Objective
Build the patient list page, detail page, and create/edit forms. Wire up to the server actions from Task 002.

## Acceptance Criteria
- [ ] Patient list page at \`/patients\` with search, sort, pagination
- [ ] Patient detail page at \`/patients/[id]\` with tabs
- [ ] Create patient form at \`/patients/new\`
- [ ] Inline edit on detail page
- [ ] Loading and error states for all pages
- [ ] Empty states with helpful messaging

## Steps
1. Build \`/patients/page.tsx\` (Server Component):
   - Search bar (Client Component) that updates URL params
   - Table using shadcn \`<Table>\` with sortable headers
   - Pagination component at bottom
2. Build \`/patients/[id]/page.tsx\` (Server Component):
   - Fetch patient via \`getPatient(id)\`
   - Tab layout: Overview (demographics), Appointments (placeholder), Notes
   - Edit button toggles inline form (Client Component)
3. Build \`/patients/new/page.tsx\`:
   - Form using shadcn inputs with client-side validation
   - Submit calls \`createPatient\` server action
   - Success → redirect to \`/patients/[newId]\`
4. Add loading.tsx for Suspense boundaries
5. Add error.tsx for error boundaries

## Verification
- Navigate to /patients → see list (or empty state if no data)
- Create a patient → appears in list
- Click patient → see detail page
- Edit patient → changes reflected
`,
    "tasks"
  ),

  // ── tasks/004-appointments.md ──
  f(
    "tasks/004-appointments.md",
    `# Task 004: Appointment Booking

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (appointments, providers), \`docs/STYLING.md\`, \`features/appointment-booking.md\`

## Objective
Build the full appointment system: database tables, server actions, schedule view, booking flow, and realtime status updates.

## Acceptance Criteria
- [ ] Providers and appointments tables created with RLS
- [ ] Server actions: \`createAppointment\`, \`updateAppointmentStatus\`, \`getAppointments\`
- [ ] Schedule view at \`/appointments\` showing day/week grid
- [ ] Booking flow at \`/appointments/new\` (multi-step)
- [ ] Conflict detection prevents double-booking
- [ ] Status transitions enforced (scheduled→confirmed→in_progress→completed)
- [ ] Realtime subscription updates schedule view

## Steps
1. Run SQL from SCHEMA.md for \`providers\` and \`appointments\` tables
2. Create types and Zod schemas for appointments
3. Build server actions:
   - \`createAppointment(data)\` with conflict check
   - \`updateAppointmentStatus(id, newStatus)\` with transition validation
   - \`getAppointments(filters)\` with date range and provider filters
   - \`getProviderAvailability(providerId, date)\`
4. Build schedule view (\`/appointments/page.tsx\`):
   - Day view: time slots (30min) × providers
   - Color-coded appointment cards per STYLING.md
   - Click card → slide-over panel with details and action buttons
5. Build booking flow (\`/appointments/new/page.tsx\`):
   - Multi-step form: patient → provider/type → date/time → confirm
   - Availability picker shows open slots
6. Add realtime subscription in a client component wrapper

## Verification
- Book an appointment → appears on schedule
- Try to double-book → see error
- Change status → schedule updates
- Open in two browsers → realtime sync works
`,
    "tasks"
  ),

  // ── tasks/005-dashboard.md ──
  f(
    "tasks/005-dashboard.md",
    `# Task 005: Dashboard & Analytics

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/STYLING.md\`, \`features/dashboard.md\`

## Objective
Build the dashboard page that serves as the home screen after login. Shows key metrics, today's schedule, and quick actions.

## Acceptance Criteria
- [ ] Dashboard at \`/dashboard\` with 4 stat cards
- [ ] Today's upcoming appointments list
- [ ] Quick action buttons (New Patient, Book Appointment)
- [ ] Provider-specific view when logged in as provider
- [ ] Data fetched server-side with parallel queries

## Steps
1. Build \`/dashboard/page.tsx\` as Server Component
2. Create stat card component: icon, label, value, optional trend indicator
3. Fetch all stats in parallel:
   \`\`\`typescript
   const [todayCount, confirmedCount, newPatientsCount, totalPatients] =
     await Promise.all([
       countTodayAppointments(supabase),
       countConfirmedToday(supabase),
       countNewPatientsThisMonth(supabase),
       countActivePatients(supabase),
     ]);
   \`\`\`
4. Build upcoming appointments list (next 5 from now)
5. Add quick action buttons in a card
6. If user role is 'provider', filter appointments to their own
7. Add loading skeleton for stat cards

## Verification
- Login → land on dashboard → see stats
- Create patient → "New patients" count increments
- Book appointment → "Today's appointments" updates
- Login as provider → see only own appointments
`,
    "tasks"
  ),

  // ── CONTEXT-WINDOW-STARTERS.md ──
  f(
    "CONTEXT-WINDOW-STARTERS.md",
    `# Context Window Starters

Copy-paste these into your AI coding agent to load the right context for each task.

---

## Task 000: Project Skeleton
\`\`\`
Read these files in order, then begin Task 000:
1. PROJECT.md — project overview and tech stack
2. docs/CONVENTIONS.md — file structure, naming, patterns
3. docs/STYLING.md — design tokens, component patterns
4. tasks/000-skeleton.md — the task to implement
\`\`\`

## Task 001: Authentication
\`\`\`
Read these files in order, then begin Task 001:
1. PROJECT.md — project overview
2. docs/CONVENTIONS.md — patterns and error handling
3. docs/SCHEMA.md — focus on profiles, user_roles, and clinics tables
4. features/auth.md — full feature spec
5. tasks/001-auth.md — the task to implement
\`\`\`

## Task 002: Patient API
\`\`\`
Read these files in order, then begin Task 002:
1. docs/CONVENTIONS.md — error handling pattern (ActionResult)
2. docs/SCHEMA.md — focus on patients table
3. features/patient-management.md — full feature spec
4. tasks/002-patient-api.md — the task to implement
\`\`\`

## Task 003: Patient UI
\`\`\`
Read these files in order, then begin Task 003:
1. docs/CONVENTIONS.md — server vs client component rules
2. docs/STYLING.md — table patterns, form patterns, colors
3. features/patient-management.md — user stories and requirements
4. tasks/002-patient-api.md — API you're building on (reference)
5. tasks/003-patient-ui.md — the task to implement
\`\`\`

## Task 004: Appointments
\`\`\`
Read these files in order, then begin Task 004:
1. docs/CONVENTIONS.md — patterns
2. docs/SCHEMA.md — appointments and providers tables
3. docs/STYLING.md — status badge colors, schedule layout
4. features/appointment-booking.md — full feature spec
5. tasks/004-appointments.md — the task to implement
\`\`\`

## Task 005: Dashboard
\`\`\`
Read these files in order, then begin Task 005:
1. docs/CONVENTIONS.md — server component patterns
2. docs/STYLING.md — card and grid patterns
3. features/dashboard.md — feature spec
4. tasks/005-dashboard.md — the task to implement
\`\`\`
`
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. LaunchPad — Marketing Site
// ═══════════════════════════════════════════════════════════════════════════════

const launchpadFiles: GeneratedFile[] = [
  f(
    "PROJECT.md",
    `# LaunchPad

## Vision
A blazing-fast marketing site for a SaaS product launch. Statically generated for maximum performance, with a headless CMS for non-developer content editing. SEO-optimized from day one.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, static export) |
| CMS | Sanity Studio (embedded) |
| Styling | Tailwind CSS |
| Forms | Resend (email API) |
| Hosting | Vercel (edge CDN) |
| Analytics | Plausible (privacy-first) |

## Core Principles
- **Static-first**: Every page is statically generated at build time. No server-side rendering.
- **Content-driven**: Marketing copy, blog posts, and page sections are managed in Sanity.
- **Performance**: Target Lighthouse 100 across all metrics. No layout shift. Optimized images.
- **SEO**: Structured data, Open Graph, canonical URLs, sitemap, robots.txt — all automated.

## Project Scope
Landing page (hero, features, pricing, testimonials, CTA), blog with categories and tags, contact form, about page. Multi-language and A/B testing are out of scope for MVP.

## Target Users
| Role | Description |
|------|------------|
| Marketing team | Edits content in Sanity Studio |
| Developer | Builds pages, deploys via Git |
| Visitor | Reads content, submits contact form |
`
  ),

  f(
    "docs/CONVENTIONS.md",
    `# Conventions

## File & Folder Structure
\`\`\`
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── blog/
│   │   ├── page.tsx          # Blog index
│   │   └── [slug]/page.tsx   # Blog post
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── studio/[[...tool]]/   # Embedded Sanity Studio
│   └── layout.tsx            # Root layout with header/footer
├── components/
│   ├── sections/             # Page sections (Hero, Features, Pricing, etc.)
│   ├── blog/                 # Blog-specific components
│   ├── layout/               # Header, Footer, Nav
│   └── ui/                   # Primitives (Button, Card, Input)
├── lib/
│   ├── sanity/
│   │   ├── client.ts         # Sanity client
│   │   ├── queries.ts        # GROQ queries
│   │   └── image.ts          # Image URL builder
│   ├── email.ts              # Resend integration
│   └── utils.ts
├── sanity/
│   ├── schemas/              # Sanity document schemas
│   └── sanity.config.ts
└── types/
\`\`\`

## Static Generation Rules
- **All pages use \`generateStaticParams\`** — no runtime data fetching
- Blog posts: \`generateStaticParams\` queries all slugs from Sanity at build time
- **Revalidation**: Use \`revalidateTag\` with Sanity webhook for on-demand ISR
- **No \`"use client"\`** except for: mobile nav toggle, contact form, Sanity Studio

## Content Patterns
- All marketing copy lives in Sanity — not hardcoded
- Page sections are modular: Sanity "page builder" pattern with typed blocks
- Blog posts use Sanity's Portable Text → rendered with \`@portabletext/react\`
- Images served via Sanity CDN with automatic format conversion (WebP/AVIF)

## SEO Conventions
- Every page exports \`generateMetadata()\` with title, description, Open Graph
- Blog posts include \`article\` structured data (JSON-LD)
- Canonical URLs set automatically from route
- Sitemap generated at \`/sitemap.xml\` via \`app/sitemap.ts\`
- \`robots.ts\` allows all crawlers, points to sitemap

## Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Page sections | PascalCase | \`HeroSection.tsx\` |
| Sanity schemas | camelCase | \`blogPost.ts\` |
| GROQ queries | camelCase + Query | \`allPostsQuery\` |
| Types | PascalCase | \`BlogPost\`, \`PageSection\` |

## Performance Rules
- All images use \`next/image\` with explicit width/height (no layout shift)
- Fonts loaded via \`next/font/google\` with \`display: swap\`
- No client-side JS for content pages — Server Components only
- Bundle analysis: keep JS under 100KB first load
`,
    "docs"
  ),

  f(
    "docs/ARCHITECTURE.md",
    `# Architecture

## System Overview
\`\`\`
┌──────────┐  build   ┌──────────────┐  CDN   ┌─────────┐
│  Sanity  │────────▶│  Next.js SSG  │──────▶│  Vercel │
│  Studio  │         │  (static HTML) │        │  Edge   │
└──────────┘         └──────────────┘        └─────────┘
      │                                           │
      │  webhook (revalidate)                     │
      └───────────────────────────────────────────┘
\`\`\`

## Build Flow
1. Developer pushes code → Vercel builds
2. Next.js calls Sanity API during build → fetches all content
3. Static HTML generated for every page
4. Deployed to Vercel's edge CDN worldwide

## Content Update Flow
1. Marketing edits content in Sanity Studio
2. Sanity webhook hits \`/api/revalidate\` endpoint
3. Next.js revalidates affected pages (ISR)
4. Updated page served on next request

## Contact Form Flow
1. User fills form (Client Component with validation)
2. Form submits to server action \`submitContact(formData)\`
3. Server action validates with Zod, sends email via Resend API
4. Returns success/error to client

## Page Builder Pattern
Landing page content is structured as an array of typed sections in Sanity:
\`\`\`
Page {
  title: string
  slug: string
  sections: (HeroSection | FeaturesSection | PricingSection | TestimonialSection | CTASection)[]
}
\`\`\`
The Next.js page component maps each section type to a React component.
`,
    "docs"
  ),

  f(
    "docs/SCHEMA.md",
    `# Content Schema (Sanity)

## Document Types

### page
\`\`\`javascript
{
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'seoTitle', type: 'string', description: 'Override for <title> tag' },
    { name: 'seoDescription', type: 'text', rows: 2 },
    { name: 'ogImage', type: 'image' },
    {
      name: 'sections',
      type: 'array',
      of: [
        { type: 'heroSection' },
        { type: 'featuresSection' },
        { type: 'pricingSection' },
        { type: 'testimonialSection' },
        { type: 'ctaSection' },
      ]
    }
  ]
}
\`\`\`

### blogPost
\`\`\`javascript
{
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'excerpt', type: 'text', rows: 3 },
    { name: 'coverImage', type: 'image', options: { hotspot: true } },
    { name: 'body', type: 'blockContent' },
    { name: 'category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
  ]
}
\`\`\`

### author
\`\`\`javascript
{
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'bio', type: 'text' },
    { name: 'avatar', type: 'image' },
  ]
}
\`\`\`

### category
\`\`\`javascript
{
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'text' },
  ]
}
\`\`\`

## Section Types (Objects)

### heroSection
\`\`\`javascript
{ name: 'heading', type: 'string' }
{ name: 'subheading', type: 'text' }
{ name: 'ctaText', type: 'string' }
{ name: 'ctaLink', type: 'url' }
{ name: 'backgroundImage', type: 'image' }
\`\`\`

### featuresSection
\`\`\`javascript
{ name: 'heading', type: 'string' }
{ name: 'features', type: 'array', of: [{
  type: 'object',
  fields: [
    { name: 'icon', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'text' },
  ]
}]}
\`\`\`

### pricingSection
\`\`\`javascript
{ name: 'heading', type: 'string' }
{ name: 'plans', type: 'array', of: [{
  type: 'object',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'price', type: 'string' },
    { name: 'period', type: 'string' },
    { name: 'features', type: 'array', of: [{ type: 'string' }] },
    { name: 'highlighted', type: 'boolean' },
    { name: 'ctaText', type: 'string' },
    { name: 'ctaLink', type: 'url' },
  ]
}]}
\`\`\`
`,
    "docs"
  ),

  f(
    "docs/STYLING.md",
    `# Styling Guide

## Design System

### Palette
| Token | Hex | Usage |
|-------|-----|-------|
| primary | \`#6D28D9\` (violet-700) | CTA buttons, accent links |
| primary-light | \`#8B5CF6\` (violet-500) | Hover states, secondary emphasis |
| background | \`#FFFFFF\` | Page background |
| surface | \`#FAFAFA\` | Section alternate backgrounds |
| foreground | \`#111827\` (gray-900) | Headings |
| body | \`#374151\` (gray-700) | Body text |
| muted | \`#9CA3AF\` (gray-400) | Captions, metadata |
| border | \`#E5E7EB\` (gray-200) | Dividers, card borders |

### Typography
- **Display**: Inter, 4xl–6xl, font-bold, tracking-tight — hero headings
- **Heading**: Inter, 2xl–3xl, font-semibold — section headings
- **Body**: Inter, base–lg, font-normal, leading-relaxed — paragraphs
- **Caption**: Inter, sm, text-muted — metadata, dates

### Layout Patterns
- **Full-width sections**: Alternate white / gray-50 backgrounds
- **Content width**: \`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\`
- **Section spacing**: \`py-16 sm:py-24\`
- **Feature grid**: \`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\`

### Components
- **Button (primary)**: \`bg-violet-700 text-white rounded-full px-8 py-3 hover:bg-violet-800 transition\`
- **Button (secondary)**: \`border border-violet-700 text-violet-700 rounded-full px-8 py-3\`
- **Card**: \`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition\`
- **Nav**: Fixed top, white with subtle border-bottom, logo left, links right
`,
    "docs"
  ),

  f(
    "features/FEATURES-INDEX.md",
    `# Features Index

| ID | Feature | Status | Priority |
|----|---------|--------|----------|
| F-001 | Landing Pages | 🔴 Not started | P0 |
| F-002 | Blog | 🔴 Not started | P0 |
| F-003 | Contact Form | 🔴 Not started | P1 |
| F-004 | SEO & Performance | 🔴 Not started | P0 |

## Dependencies
- F-002 depends on Sanity schemas being set up (part of F-001 scaffold)
- F-003 is independent
- F-004 runs across all features (metadata, structured data, sitemap)
`,
    "features"
  ),

  f(
    "features/landing-pages.md",
    `# F-001: Landing Pages

## Overview
Modular landing pages built from Sanity-managed sections. The marketing team can rearrange sections, edit copy, and swap images without developer involvement.

## User Stories
- As a **marketer**, I can edit the hero headline and CTA without deploying code.
- As a **marketer**, I can reorder page sections (hero, features, pricing, testimonials) via drag-and-drop in Sanity.
- As a **visitor**, the page loads instantly with no visible layout shift.

## Requirements
- Page builder pattern: Sanity document with array of section blocks
- Each section type has a corresponding React component
- Responsive: mobile-first, looks great at all breakpoints
- Hero: headline, subheadline, CTA button, background image
- Features: grid of icon + title + description cards
- Pricing: 3-column plan comparison with highlighted recommended plan
- Testimonials: carousel or grid of quote cards with avatar
- CTA: final call-to-action banner with email capture
`,
    "features"
  ),

  f(
    "features/blog.md",
    `# F-002: Blog

## Overview
A content marketing blog powered by Sanity. Posts are written in Sanity's rich text editor, categorized, tagged, and rendered as static pages.

## User Stories
- As a **writer**, I can create a blog post in Sanity with rich text, images, and code blocks.
- As a **visitor**, I can browse posts by category or search by keyword.
- As a **visitor**, I see related posts at the bottom of each article.

## Requirements
### Blog Index (\`/blog\`)
- Grid of post cards: cover image, title, excerpt, date, category
- Category filter tabs
- Pagination (static: /blog, /blog/page/2, etc.)

### Blog Post (\`/blog/[slug]\`)
- Full article with Portable Text rendering
- Author bio card
- Table of contents (auto-generated from headings)
- Related posts (same category)
- Social share buttons

### SEO
- JSON-LD \`Article\` structured data
- Open Graph image from cover image
- Estimated reading time in metadata

## Technical Notes
- Use \`@portabletext/react\` with custom components for code blocks, images, callouts
- Generate static params from all published post slugs
- RSS feed at \`/feed.xml\` generated at build time
`,
    "features"
  ),

  f(
    "features/contact-form.md",
    `# F-003: Contact Form

## Overview
A simple contact form that sends an email to the sales team via Resend.

## User Stories
- As a **visitor**, I can submit a message with my name, email, company, and message.
- As the **sales team**, I receive the inquiry via email with all submitted details.

## Requirements
- Client Component with form validation (Zod)
- Fields: name*, email*, company, message*
- Server action sends email via Resend API
- Success: show confirmation message
- Error: show error with retry option
- Rate limiting: max 3 submissions per IP per hour (via Vercel edge middleware)
- Honeypot field for basic spam prevention
`,
    "features"
  ),

  f(
    "features/seo.md",
    `# F-004: SEO & Performance

## Overview
Cross-cutting SEO and performance optimizations that apply to every page.

## Requirements

### Metadata
- Every page exports \`generateMetadata()\` with unique title and description
- Format: \`Page Title | LaunchPad\`
- Open Graph: title, description, image (per page or default fallback)
- Twitter card: summary_large_image

### Structured Data
- Homepage: \`Organization\` schema
- Blog posts: \`Article\` schema with author, datePublished, dateModified
- Pricing page: \`Product\` schema (optional)

### Technical SEO
- \`/sitemap.xml\` auto-generated from all static routes + blog slugs
- \`/robots.txt\` allows all crawlers
- Canonical URLs on every page
- No duplicate content (trailing slash normalized)
- 301 redirects for any URL changes

### Performance Targets
| Metric | Target |
|--------|--------|
| Lighthouse Performance | 100 |
| LCP | < 1.5s |
| CLS | 0 |
| FID | < 50ms |
| First Load JS | < 100KB |
`,
    "features"
  ),

  f(
    "tasks/TASKS-MASTER.md",
    `# Tasks Master

## Task Order
| # | Task | Depends On | Est. Effort |
|---|------|-----------|-------------|
| 000 | Project Skeleton & Sanity Setup | — | 3h |
| 001 | Landing Page Sections | 000 | 4h |
| 002 | Blog System | 000 | 4h |
| 003 | Contact Form | 000 | 2h |
| 004 | SEO & Performance Polish | 001, 002 | 3h |

## Working With Tasks
Each task file has context to load, acceptance criteria, implementation steps, and verification. Complete them in order.
`,
    "tasks"
  ),

  f(
    "tasks/000-skeleton.md",
    `# Task 000: Project Skeleton & Sanity Setup

## Context
Load: \`PROJECT.md\`, \`docs/CONVENTIONS.md\`, \`docs/STYLING.md\`, \`docs/SCHEMA.md\`

## Objective
Set up Next.js with static export, Sanity Studio embedded, Tailwind configured, and base layout (header/footer).

## Acceptance Criteria
- [ ] Next.js 14 app with App Router, TypeScript, Tailwind
- [ ] Sanity Studio accessible at \`/studio\`
- [ ] Sanity schemas created for: page, blogPost, author, category, section types
- [ ] Header component with nav links (Home, Blog, About, Contact)
- [ ] Footer component with links and copyright
- [ ] Base layout wrapping all pages
- [ ] Fonts (Inter) loaded via next/font

## Steps
1. Create Next.js app with TypeScript and Tailwind
2. Install Sanity: \`npm install next-sanity @sanity/image-url @portabletext/react\`
3. Initialize Sanity project, embed Studio at \`/studio/[[...tool]]/page.tsx\`
4. Create all Sanity schemas from docs/SCHEMA.md
5. Build Header and Footer components per STYLING.md
6. Create root layout with metadata defaults
7. Add \`.env.example\` with Sanity project ID and dataset

## Verification
- \`npm run build\` succeeds
- \`/studio\` loads Sanity Studio
- Header and footer render on all pages
`,
    "tasks"
  ),

  f(
    "tasks/001-landing.md",
    `# Task 001: Landing Page Sections

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/STYLING.md\`, \`features/landing-pages.md\`

## Objective
Build the landing page with modular section components, rendering content from Sanity.

## Acceptance Criteria
- [ ] HeroSection component with heading, subheading, CTA, background image
- [ ] FeaturesSection component with responsive grid
- [ ] PricingSection component with 3 plans, highlighted middle plan
- [ ] TestimonialSection component with quote cards
- [ ] CTASection component with email capture
- [ ] Landing page fetches sections from Sanity and renders dynamically
- [ ] Fully responsive at all breakpoints

## Steps
1. Create section components in \`components/sections/\`
2. Write GROQ query for page document with expanded sections
3. Build \`app/page.tsx\` — fetches landing page from Sanity, maps sections to components
4. Seed Sanity with initial landing page content
5. Test responsiveness at mobile, tablet, desktop

## Verification
- Landing page renders all sections with real content
- Editing content in Sanity → rebuild → changes reflected
- Lighthouse performance score ≥ 95
`,
    "tasks"
  ),

  f(
    "tasks/002-blog.md",
    `# Task 002: Blog System

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (blogPost, author, category), \`features/blog.md\`

## Objective
Build the blog index and post pages, rendering content from Sanity Portable Text.

## Acceptance Criteria
- [ ] Blog index at \`/blog\` with post cards grid
- [ ] Category filter tabs
- [ ] Blog post page at \`/blog/[slug]\` with full Portable Text rendering
- [ ] Author bio card at bottom of post
- [ ] Related posts section
- [ ] generateStaticParams for all post slugs
- [ ] RSS feed at \`/feed.xml\`

## Steps
1. Write GROQ queries: \`allPostsQuery\`, \`postBySlugQuery\`, \`postsByCategoryQuery\`
2. Build blog index page with card grid and category tabs
3. Build post page with Portable Text renderer (custom components for code, images)
4. Add author bio component
5. Add related posts query (same category, exclude current)
6. Generate RSS feed in \`app/feed.xml/route.ts\`
7. Seed Sanity with 3-4 sample posts

## Verification
- Blog index shows posts sorted by date
- Clicking a post shows full content
- Category filter works
- RSS feed is valid XML
`,
    "tasks"
  ),

  f(
    "tasks/003-contact.md",
    `# Task 003: Contact Form

## Context
Load: \`docs/CONVENTIONS.md\`, \`features/contact-form.md\`

## Objective
Build a contact page with a validated form that sends emails via Resend.

## Acceptance Criteria
- [ ] Contact page at \`/contact\`
- [ ] Form with name, email, company, message fields
- [ ] Client-side validation with Zod
- [ ] Server action sends email via Resend
- [ ] Success/error states displayed
- [ ] Honeypot spam prevention
- [ ] Rate limiting (3/hr per IP)

## Steps
1. Create \`/contact/page.tsx\` with form layout per STYLING.md
2. Build ContactForm client component with Zod validation
3. Create server action \`submitContact(formData)\`
4. Integrate Resend SDK (\`npm install resend\`)
5. Add honeypot hidden field
6. Add rate limiting via middleware or in-memory store
7. Add success confirmation and error display

## Verification
- Submit form → email received
- Submit with invalid data → validation errors shown
- Submit hidden field filled → silently rejected
`,
    "tasks"
  ),

  f(
    "tasks/004-seo.md",
    `# Task 004: SEO & Performance Polish

## Context
Load: \`docs/CONVENTIONS.md\`, \`features/seo.md\`

## Objective
Add metadata, structured data, sitemap, and performance optimizations across all pages.

## Acceptance Criteria
- [ ] generateMetadata on every page with unique title/description
- [ ] Open Graph and Twitter card meta tags
- [ ] JSON-LD structured data (Organization on home, Article on blog posts)
- [ ] Sitemap at \`/sitemap.xml\` including all routes and blog slugs
- [ ] robots.txt allowing all crawlers
- [ ] Lighthouse 100 on all pages
- [ ] No layout shift (CLS = 0)

## Steps
1. Add \`generateMetadata()\` to every page and layout
2. Create JSON-LD helper functions for Organization and Article schemas
3. Add \`app/sitemap.ts\` that fetches all blog slugs + static routes
4. Add \`app/robots.ts\`
5. Audit all images: ensure width/height set, use next/image
6. Audit bundle: check first-load JS size
7. Run Lighthouse, fix any issues

## Verification
- View page source → correct meta tags and JSON-LD
- \`/sitemap.xml\` lists all pages
- Lighthouse: 100/100/100/100
`,
    "tasks"
  ),

  f(
    "CONTEXT-WINDOW-STARTERS.md",
    `# Context Window Starters

## Task 000: Project Skeleton
\`\`\`
Read these files in order, then begin Task 000:
1. PROJECT.md
2. docs/CONVENTIONS.md
3. docs/STYLING.md
4. docs/SCHEMA.md — Sanity schemas to create
5. tasks/000-skeleton.md
\`\`\`

## Task 001: Landing Pages
\`\`\`
Read these files in order, then begin Task 001:
1. docs/CONVENTIONS.md — page builder pattern
2. docs/STYLING.md — section layout, typography, colors
3. features/landing-pages.md
4. tasks/001-landing.md
\`\`\`

## Task 002: Blog
\`\`\`
Read these files in order, then begin Task 002:
1. docs/CONVENTIONS.md — static generation, Portable Text
2. docs/SCHEMA.md — blogPost, author, category schemas
3. features/blog.md
4. tasks/002-blog.md
\`\`\`

## Task 003: Contact Form
\`\`\`
Read these files in order, then begin Task 003:
1. docs/CONVENTIONS.md
2. features/contact-form.md
3. tasks/003-contact.md
\`\`\`

## Task 004: SEO
\`\`\`
Read these files in order, then begin Task 004:
1. docs/CONVENTIONS.md
2. features/seo.md
3. tasks/004-seo.md
\`\`\`
`
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PulseAPI — API Backend
// ═══════════════════════════════════════════════════════════════════════════════

const pulseapiFiles: GeneratedFile[] = [
  f(
    "PROJECT.md",
    `# PulseAPI

## Vision
A high-performance REST API backend for a mobile social app. Handles user authentication, push notifications, real-time messaging, and file uploads. Designed for scale from day one with async Python, connection pooling, and Redis caching.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| File Storage | AWS S3 (via boto3) |
| Auth | JWT (access + refresh tokens) |
| Push | Firebase Cloud Messaging (FCM) |
| Realtime | WebSocket (FastAPI native) |
| Containers | Docker + Docker Compose |
| Testing | pytest + httpx (async) |

## Core Principles
- **Async-first**: All I/O operations use \`async/await\`. Never block the event loop.
- **Type-safe**: Full type hints. Pydantic models for all request/response schemas.
- **12-Factor**: Config from environment. Stateless app servers. Logs to stdout.
- **Test-driven**: Every endpoint has integration tests. Minimum 80% coverage.

## Project Scope
MVP: user registration/login, profile management, push notification delivery, real-time chat (1:1 and group), and file/image uploads. Social features (feed, likes, comments) are out of scope.
`
  ),

  f(
    "docs/CONVENTIONS.md",
    `# Conventions

## Project Structure
\`\`\`
pulse-api/
├── app/
│   ├── main.py              # FastAPI app factory
│   ├── config.py             # Settings from env (pydantic-settings)
│   ├── database.py           # Async SQLAlchemy engine + session
│   ├── redis.py              # Redis connection pool
│   ├── dependencies.py       # Dependency injection (get_db, get_current_user)
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── message.py
│   │   └── file.py
│   ├── schemas/              # Pydantic request/response models
│   │   ├── user.py
│   │   ├── message.py
│   │   └── file.py
│   ├── routers/              # API route handlers
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── messages.py
│   │   ├── files.py
│   │   └── notifications.py
│   ├── services/             # Business logic layer
│   │   ├── auth_service.py
│   │   ├── notification_service.py
│   │   ├── message_service.py
│   │   └── file_service.py
│   ├── utils/
│   │   ├── security.py       # JWT, password hashing
│   │   └── pagination.py     # Cursor-based pagination helpers
│   └── websocket/
│       ├── manager.py        # Connection manager
│       └── handlers.py       # Message handlers
├── migrations/               # Alembic migrations
├── tests/
│   ├── conftest.py           # Fixtures (test DB, client, auth)
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_messages.py
│   └── test_files.py
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── alembic.ini
\`\`\`

## Coding Standards

### Async Everything
\`\`\`python
# ✅ Correct
async def get_user(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

# ❌ Wrong — blocking call in async context
def get_user(db: Session, user_id: UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()
\`\`\`

### Error Handling
Raise \`HTTPException\` in routers, never in services. Services return \`None\` or raise domain exceptions that routers translate:

\`\`\`python
# service
class UserNotFoundError(Exception):
    pass

async def get_user_or_fail(db, user_id):
    user = await get_user(db, user_id)
    if not user:
        raise UserNotFoundError(f"User {user_id} not found")
    return user

# router
@router.get("/users/{user_id}")
async def read_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    try:
        user = await get_user_or_fail(db, user_id)
    except UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)
\`\`\`

### Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Files | snake_case | \`auth_service.py\` |
| Classes | PascalCase | \`UserResponse\` |
| Functions | snake_case | \`create_user\` |
| Constants | UPPER_SNAKE | \`ACCESS_TOKEN_EXPIRE_MINUTES\` |
| Endpoints | kebab-case plural | \`/api/v1/push-tokens\` |

### API Versioning
All endpoints prefixed with \`/api/v1/\`. Version in URL, not headers.

### Pagination
Use cursor-based pagination for all list endpoints:
\`\`\`json
{
  "items": [...],
  "next_cursor": "abc123",
  "has_more": true
}
\`\`\`

### Response Format
All responses use Pydantic models. No raw dicts. Standard envelope for lists with pagination, flat object for single items.

## Git Conventions
- Branch: \`feat/task-name\`, \`fix/description\`
- Commits: conventional commits
- PR: one task = one PR
`,
    "docs"
  ),

  f(
    "docs/ARCHITECTURE.md",
    `# Architecture

## System Overview
\`\`\`
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  Mobile  │────▶│   FastAPI     │────▶│ PostgreSQL │
│   App    │◀────│   (uvicorn)   │◀────│            │
└──────────┘     │               │     └────────────┘
     │           │   WebSocket   │
     │           │   endpoint    │     ┌────────────┐
     │           │               │────▶│   Redis    │
     │           └──────────────┘     │ (pub/sub +  │
     │                  │              │  cache)     │
     │                  │              └────────────┘
     │                  ▼
     │           ┌──────────────┐     ┌────────────┐
     │           │   Workers     │────▶│  AWS S3    │
     └──────────▶│  (background) │     │ (files)    │
                 └──────────────┘     └────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  FCM (Push)  │
                 └──────────────┘
\`\`\`

## Request Flow
1. Mobile app sends HTTP request with JWT in \`Authorization\` header
2. FastAPI dependency \`get_current_user\` validates JWT, loads user
3. Router calls service layer with validated Pydantic model
4. Service executes business logic, queries DB via async SQLAlchemy
5. Router returns Pydantic response model (auto-serialized to JSON)

## Authentication Flow
1. \`POST /api/v1/auth/register\` — create user, hash password, return tokens
2. \`POST /api/v1/auth/login\` — verify credentials, return access + refresh tokens
3. \`POST /api/v1/auth/refresh\` — exchange refresh token for new access token
4. Access token: JWT, 15min expiry, contains user_id and role
5. Refresh token: opaque UUID stored in DB, 30-day expiry, single-use (rotation)

## WebSocket Architecture
1. Client connects to \`/ws\` with JWT as query param
2. Connection manager registers connection, maps user_id → websocket
3. Messages published to Redis pub/sub channel
4. All app instances subscribe to Redis → broadcast to connected clients
5. This allows horizontal scaling: any instance can deliver any message

## Background Tasks
- Push notifications: queued via Redis, processed by background task
- File processing: thumbnail generation after upload
- Use FastAPI \`BackgroundTasks\` for simple tasks, Celery for heavy work (future)

## Database
- Async SQLAlchemy 2.0 with \`asyncpg\` driver
- Connection pool: min 5, max 20 per instance
- Alembic for migrations (async-compatible)
- All timestamps in UTC
`,
    "docs"
  ),

  f(
    "docs/SCHEMA.md",
    `# Database Schema

## Tables

### users
\`\`\`sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
\`\`\`

### refresh_tokens
\`\`\`sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
\`\`\`

### push_tokens
\`\`\`sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(255) NOT NULL,
    platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, device_token)
);
\`\`\`

### conversations
\`\`\`sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('direct', 'group')),
    name VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE conversation_members (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    PRIMARY KEY (conversation_id, user_id)
);
\`\`\`

### messages
\`\`\`sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_id UUID REFERENCES files(id),
    reply_to_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
\`\`\`

### files
\`\`\`sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    thumbnail_s3_key VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

## Entity Relationships
\`\`\`
users 1──* refresh_tokens
users 1──* push_tokens
users *──* conversations (via conversation_members)
users 1──* messages (as sender)
users 1──* files (as uploader)
conversations 1──* messages
messages *──1 files (optional attachment)
\`\`\`
`,
    "docs"
  ),

  f(
    "docs/STYLING.md",
    `# API Design Guide

> This project has no frontend. This document covers API response formatting, error conventions, and documentation standards.

## Response Formats

### Single Resource
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "display_name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z"
}
\`\`\`

### List with Pagination
\`\`\`json
{
  "items": [...],
  "next_cursor": "eyJpZCI6ICIxMjM0In0=",
  "has_more": true
}
\`\`\`

### Error Response
\`\`\`json
{
  "detail": "User not found",
  "error_code": "USER_NOT_FOUND",
  "status_code": 404
}
\`\`\`

### Validation Error
\`\`\`json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error"
    }
  ]
}
\`\`\`

## HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE |
| 400 | Validation error, bad request |
| 401 | Missing or invalid auth token |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Rate limited |
| 500 | Internal server error |

## API Documentation
- Auto-generated Swagger UI at \`/docs\`
- ReDoc at \`/redoc\`
- All endpoints have docstrings, summary, and response model declarations
- Example values in Pydantic \`model_config\` for schema examples
`,
    "docs"
  ),

  f(
    "features/FEATURES-INDEX.md",
    `# Features Index

| ID | Feature | Status | Priority |
|----|---------|--------|----------|
| F-001 | User API & Auth | 🔴 Not started | P0 |
| F-002 | Push Notifications | 🔴 Not started | P1 |
| F-003 | Real-time Messaging | 🔴 Not started | P0 |
| F-004 | File Uploads | 🔴 Not started | P1 |

## Dependencies
- F-002 depends on F-001 (need user context for push tokens)
- F-003 depends on F-001 (auth for WebSocket connections)
- F-004 depends on F-001 (user context for file ownership)
`,
    "features"
  ),

  f(
    "features/user-auth.md",
    `# F-001: User API & Authentication

## Overview
User registration, login, profile management, and JWT-based authentication. Foundation for all other features.

## User Stories
- As a new user, I can register with email, username, and password.
- As a user, I can log in and receive access and refresh tokens.
- As a user, I can view and update my profile (display name, bio, avatar).
- As a user, I can change my password.
- As an admin, I can deactivate user accounts.

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Create account |
| POST | /api/v1/auth/login | No | Get tokens |
| POST | /api/v1/auth/refresh | No | Refresh access token |
| GET | /api/v1/users/me | Yes | Get current user profile |
| PATCH | /api/v1/users/me | Yes | Update profile |
| PUT | /api/v1/users/me/password | Yes | Change password |
| GET | /api/v1/users/{id} | Yes | Get user by ID (public fields) |
| GET | /api/v1/users | Yes (admin) | List users with pagination |

## Password Rules
- Minimum 8 characters
- At least one uppercase, one lowercase, one digit
- Hashed with bcrypt (12 rounds)

## Token Specs
- Access token: JWT, HS256, 15-minute expiry, contains \`sub\` (user_id) and \`role\`
- Refresh token: random UUID, 30-day expiry, stored in DB, single-use rotation
`,
    "features"
  ),

  f(
    "features/push-notifications.md",
    `# F-002: Push Notifications

## Overview
Register device tokens, send push notifications via Firebase Cloud Messaging. Supports targeting individual users or broadcasting to groups.

## User Stories
- As a user, I can register my device for push notifications.
- As the system, I send a push when a new message arrives (and user is offline).
- As a user, I can unregister a device token.

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/push-tokens | Yes | Register device token |
| DELETE | /api/v1/push-tokens/{device_token} | Yes | Remove device token |
| GET | /api/v1/push-tokens | Yes | List my registered tokens |

## Push Triggers
| Event | Recipient | Content |
|-------|-----------|---------|
| New message (1:1) | Other participant (if offline) | "New message from {sender}" |
| New message (group) | All members except sender (if offline) | "{sender} in {group}: {preview}" |
| Added to group | New member | "You were added to {group}" |

## Technical Notes
- Use \`firebase-admin\` Python SDK
- Batch sends for group notifications (up to 500 per call)
- Handle expired/invalid tokens: mark \`is_active = false\`, don't retry
- "Offline" = no active WebSocket connection for the user
`,
    "features"
  ),

  f(
    "features/messaging.md",
    `# F-003: Real-time Messaging

## Overview
1:1 and group conversations with real-time delivery via WebSockets. Messages persisted in PostgreSQL, delivered live through Redis pub/sub.

## User Stories
- As a user, I can start a 1:1 conversation with another user.
- As a user, I can create a group conversation and add members.
- As a user, I can send and receive text messages in real-time.
- As a user, I can send images/files in a conversation.
- As a user, I can see unread message counts.
- As a user, I can reply to a specific message.

## REST Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/conversations | Yes | Create conversation |
| GET | /api/v1/conversations | Yes | List my conversations |
| GET | /api/v1/conversations/{id}/messages | Yes | Get messages (paginated) |
| POST | /api/v1/conversations/{id}/messages | Yes | Send message (HTTP fallback) |
| POST | /api/v1/conversations/{id}/members | Yes | Add member to group |
| DELETE | /api/v1/conversations/{id}/members/{user_id} | Yes | Remove member |
| PATCH | /api/v1/conversations/{id}/read | Yes | Mark conversation as read |

## WebSocket Protocol
Connect: \`ws://host/ws?token={jwt}\`

### Client → Server
\`\`\`json
{ "type": "message", "conversation_id": "uuid", "content": "Hello!", "reply_to_id": null }
{ "type": "typing", "conversation_id": "uuid" }
{ "type": "read", "conversation_id": "uuid", "message_id": "uuid" }
\`\`\`

### Server → Client
\`\`\`json
{ "type": "message", "data": { "id": "uuid", "conversation_id": "uuid", "sender_id": "uuid", "content": "Hello!", "created_at": "..." } }
{ "type": "typing", "data": { "conversation_id": "uuid", "user_id": "uuid" } }
{ "type": "read_receipt", "data": { "conversation_id": "uuid", "user_id": "uuid", "message_id": "uuid" } }
\`\`\`

## Technical Notes
- Messages saved to DB first, then published to Redis
- Redis pub/sub channel per conversation: \`chat:{conversation_id}\`
- Connection manager tracks user_id → set of WebSocket connections (multi-device)
- Typing indicators are ephemeral (not persisted)
- Unread count: compare \`last_read_at\` in \`conversation_members\` with latest message timestamp
`,
    "features"
  ),

  f(
    "features/file-uploads.md",
    `# F-004: File Uploads

## Overview
Upload images and files to S3 via presigned URLs. Generate thumbnails for images. Attach files to messages.

## User Stories
- As a user, I can upload a profile avatar.
- As a user, I can send an image or file in a conversation.
- As a user, uploaded images have auto-generated thumbnails.

## Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/files/upload-url | Yes | Get presigned upload URL |
| POST | /api/v1/files/confirm | Yes | Confirm upload, trigger processing |
| GET | /api/v1/files/{id} | Yes | Get file metadata + download URL |

## Upload Flow
1. Client requests presigned URL: \`POST /files/upload-url\` with filename, content_type
2. Server creates DB record (pending), generates S3 presigned PUT URL (5 min expiry)
3. Client uploads directly to S3 using presigned URL
4. Client confirms: \`POST /files/confirm\` with file_id
5. Server verifies file exists in S3, updates status, triggers thumbnail generation

## Constraints
- Max file size: 50MB
- Allowed image types: jpeg, png, gif, webp
- Allowed file types: pdf, doc, docx, txt
- Thumbnail: 200x200 max, JPEG, generated via Pillow
- S3 keys: \`uploads/{user_id}/{file_id}/{filename}\`

## Technical Notes
- Use \`boto3\` async wrapper or \`aioboto3\` for non-blocking S3 operations
- Thumbnail generation in background task (FastAPI \`BackgroundTasks\`)
- Presigned URLs keep S3 credentials off the client
- CDN (CloudFront) in front of S3 for production reads
`,
    "features"
  ),

  f(
    "tasks/TASKS-MASTER.md",
    `# Tasks Master

## Task Order
| # | Task | Depends On | Est. Effort |
|---|------|-----------|-------------|
| 000 | Project Skeleton & Docker | — | 2h |
| 001 | User Auth & JWT | 000 | 4h |
| 002 | Push Notifications | 001 | 3h |
| 003 | Real-time Messaging | 001 | 6h |
| 004 | File Uploads | 001 | 3h |

## Working With Tasks
Each task file has context to load, acceptance criteria, steps, and verification. Complete in order.
`,
    "tasks"
  ),

  f(
    "tasks/000-skeleton.md",
    `# Task 000: Project Skeleton & Docker

## Context
Load: \`PROJECT.md\`, \`docs/CONVENTIONS.md\`, \`docs/ARCHITECTURE.md\`

## Objective
Set up the FastAPI project with Docker Compose, database connection, Redis connection, and base configuration. After this task, the API should start, connect to Postgres and Redis, and serve a health endpoint.

## Acceptance Criteria
- [ ] FastAPI app created with project structure per CONVENTIONS.md
- [ ] Docker Compose with app, postgres, redis services
- [ ] Async SQLAlchemy engine configured
- [ ] Redis connection pool configured
- [ ] Alembic initialized for migrations
- [ ] Health endpoint at \`GET /health\` returns \`{"status": "ok"}\`
- [ ] Settings loaded from environment via pydantic-settings
- [ ] \`.env.example\` documented

## Steps
1. Create project structure per CONVENTIONS.md
2. Write \`requirements.txt\`: fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, redis, pydantic-settings, alembic, python-jose, passlib[bcrypt], boto3
3. Create \`app/config.py\` with Settings class (DB URL, Redis URL, JWT secret, S3 config)
4. Create \`app/database.py\`: async engine, session factory, \`get_db\` dependency
5. Create \`app/redis.py\`: connection pool, \`get_redis\` dependency
6. Create \`app/main.py\`: FastAPI app with CORS, include routers, lifespan (connect/disconnect)
7. Write Dockerfile (Python 3.12-slim, pip install, uvicorn)
8. Write docker-compose.yml (app, postgres:16, redis:7)
9. Initialize Alembic with async template
10. Create health router: \`GET /health\`

## Verification
- \`docker compose up\` → all services start
- \`curl localhost:8000/health\` → \`{"status": "ok"}\`
- \`curl localhost:8000/docs\` → Swagger UI loads
`,
    "tasks"
  ),

  f(
    "tasks/001-auth.md",
    `# Task 001: User Auth & JWT

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (users, refresh_tokens), \`features/user-auth.md\`

## Objective
Implement user registration, login, JWT authentication, and profile management.

## Acceptance Criteria
- [ ] Users table migration
- [ ] Registration endpoint with validation
- [ ] Login endpoint returns access + refresh tokens
- [ ] Refresh endpoint rotates tokens
- [ ] \`get_current_user\` dependency validates JWT
- [ ] Profile GET and PATCH endpoints
- [ ] Password change endpoint
- [ ] Tests for all auth flows

## Steps
1. Create User model in \`app/models/user.py\`
2. Create Alembic migration for users and refresh_tokens tables
3. Create Pydantic schemas: \`UserCreate\`, \`UserLogin\`, \`UserResponse\`, \`TokenResponse\`
4. Create \`app/utils/security.py\`: hash_password, verify_password, create_access_token, create_refresh_token
5. Create \`app/services/auth_service.py\`: register, login, refresh, change_password
6. Create \`app/routers/auth.py\`: register, login, refresh endpoints
7. Create \`app/routers/users.py\`: me (GET/PATCH), user by ID, list users (admin)
8. Create \`app/dependencies.py\`: \`get_current_user\` dependency
9. Write tests: registration, login, token refresh, invalid token, profile update

## Verification
- Register → login → use access token → works
- Expired token → 401
- Refresh → get new access token → works
- Invalid password → 401
- Tests pass: \`pytest tests/test_auth.py -v\`
`,
    "tasks"
  ),

  f(
    "tasks/002-push.md",
    `# Task 002: Push Notifications

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (push_tokens), \`features/push-notifications.md\`

## Objective
Implement device token registration and push notification sending via FCM.

## Acceptance Criteria
- [ ] Push tokens table migration
- [ ] Register/unregister device token endpoints
- [ ] List user's tokens endpoint
- [ ] Notification service sends push via FCM
- [ ] Invalid tokens auto-deactivated
- [ ] Tests for token CRUD

## Steps
1. Create PushToken model and migration
2. Create Pydantic schemas: \`PushTokenCreate\`, \`PushTokenResponse\`
3. Create \`app/routers/notifications.py\`: register, unregister, list
4. Create \`app/services/notification_service.py\`:
   - \`send_push(user_id, title, body)\`: fetch active tokens, send via FCM
   - \`send_push_batch(user_ids, title, body)\`: batch send
   - Handle FCM errors: deactivate invalid tokens
5. Install \`firebase-admin\`, configure with service account from env
6. Write tests (mock FCM calls)

## Verification
- Register token → appears in list
- Send push → FCM called (verify in Firebase console or mock)
- Register same token twice → no duplicate
- Delete token → removed from list
`,
    "tasks"
  ),

  f(
    "tasks/003-messaging.md",
    `# Task 003: Real-time Messaging

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (conversations, messages), \`docs/ARCHITECTURE.md\` (WebSocket section), \`features/messaging.md\`

## Objective
Build the conversation and messaging system with both REST and WebSocket interfaces.

## Acceptance Criteria
- [ ] Conversations and messages table migrations
- [ ] REST endpoints: create conversation, list conversations, get messages, send message
- [ ] WebSocket endpoint with JWT auth
- [ ] Real-time message delivery via Redis pub/sub
- [ ] Typing indicators
- [ ] Read receipts and unread counts
- [ ] Cursor-based pagination for message history
- [ ] Tests for REST endpoints and WebSocket

## Steps
1. Create models: Conversation, ConversationMember, Message
2. Create migrations
3. Create Pydantic schemas for conversations and messages
4. Create \`app/services/message_service.py\`: create_conversation, send_message, get_messages, mark_read
5. Create \`app/routers/messages.py\`: REST endpoints
6. Create \`app/websocket/manager.py\`: ConnectionManager class
   - \`connect(user_id, websocket)\`
   - \`disconnect(user_id, websocket)\`
   - \`publish(conversation_id, message)\` → Redis pub/sub
7. Create \`app/websocket/handlers.py\`: handle incoming WebSocket messages
8. Subscribe to Redis channels on connect, unsubscribe on disconnect
9. Integrate push notifications: if recipient has no active WS, send push
10. Write tests

## Verification
- Create conversation → send message → received via WebSocket
- Open two connections → both receive messages
- Get message history → paginated correctly
- Send message while recipient offline → push notification sent
`,
    "tasks"
  ),

  f(
    "tasks/004-files.md",
    `# Task 004: File Uploads

## Context
Load: \`docs/CONVENTIONS.md\`, \`docs/SCHEMA.md\` (files), \`features/file-uploads.md\`

## Objective
Implement S3-based file uploads with presigned URLs and automatic thumbnail generation.

## Acceptance Criteria
- [ ] Files table migration
- [ ] Presigned upload URL endpoint
- [ ] Upload confirmation endpoint
- [ ] File metadata + download URL endpoint
- [ ] Thumbnail generation for images (background task)
- [ ] File size and type validation
- [ ] Tests for upload flow

## Steps
1. Create File model and migration
2. Create Pydantic schemas: \`FileUploadRequest\`, \`FileUploadResponse\`, \`FileResponse\`
3. Create \`app/services/file_service.py\`:
   - \`create_upload_url(user_id, filename, content_type)\`: validate type/size, create DB record, generate presigned URL
   - \`confirm_upload(file_id, user_id)\`: verify in S3, update status
   - \`generate_thumbnail(file_id)\`: download from S3, resize with Pillow, upload thumbnail
4. Create \`app/routers/files.py\`: upload-url, confirm, get-file
5. Configure boto3/aioboto3 with settings from config
6. Wire thumbnail generation into confirm endpoint as BackgroundTask
7. Add to requirements: Pillow, aioboto3
8. Write tests (mock S3 calls with moto)

## Verification
- Request upload URL → get presigned URL
- Upload file to S3 → confirm → file metadata accessible
- Image upload → thumbnail generated
- Oversized file → rejected
- Wrong file type → rejected
`,
    "tasks"
  ),

  f(
    "CONTEXT-WINDOW-STARTERS.md",
    `# Context Window Starters

## Task 000: Project Skeleton
\`\`\`
Read these files in order, then begin Task 000:
1. PROJECT.md
2. docs/CONVENTIONS.md — project structure and coding standards
3. docs/ARCHITECTURE.md — system overview
4. tasks/000-skeleton.md
\`\`\`

## Task 001: User Auth
\`\`\`
Read these files in order, then begin Task 001:
1. docs/CONVENTIONS.md — error handling, naming
2. docs/SCHEMA.md — users and refresh_tokens tables
3. features/user-auth.md — endpoints and token specs
4. tasks/001-auth.md
\`\`\`

## Task 002: Push Notifications
\`\`\`
Read these files in order, then begin Task 002:
1. docs/CONVENTIONS.md
2. docs/SCHEMA.md — push_tokens table
3. features/push-notifications.md
4. tasks/002-push.md
\`\`\`

## Task 003: Real-time Messaging
\`\`\`
Read these files in order, then begin Task 003:
1. docs/CONVENTIONS.md
2. docs/SCHEMA.md — conversations, messages tables
3. docs/ARCHITECTURE.md — WebSocket and Redis pub/sub
4. features/messaging.md — full protocol spec
5. tasks/003-messaging.md
\`\`\`

## Task 004: File Uploads
\`\`\`
Read these files in order, then begin Task 004:
1. docs/CONVENTIONS.md
2. docs/SCHEMA.md — files table
3. features/file-uploads.md — upload flow and constraints
4. tasks/004-files.md
\`\`\`
`
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// Export all examples
// ═══════════════════════════════════════════════════════════════════════════════

export const exampleProjects: ExampleProject[] = [
  {
    id: "clinicflow",
    title: "ClinicFlow",
    subtitle: "SaaS Dashboard",
    description:
      "A clinic management dashboard with authentication, patient records, and appointment booking. Built with Next.js, Supabase, and Tailwind.",
    techStack: ["Next.js 14", "Supabase", "Tailwind CSS", "shadcn/ui", "Vercel"],
    features: [
      "Authentication & RBAC",
      "Patient Management",
      "Appointment Booking",
      "Dashboard Analytics",
    ],
    taskCount: 6,
    files: clinicflowFiles,
  },
  {
    id: "launchpad",
    title: "LaunchPad",
    subtitle: "Marketing Site",
    description:
      "A marketing website with blog, landing pages, and content management. Static site with headless CMS integration.",
    techStack: ["Next.js", "Sanity CMS", "Tailwind CSS", "Resend", "Vercel"],
    features: [
      "Landing Pages",
      "Blog with CMS",
      "Contact Form",
      "SEO & Performance",
    ],
    taskCount: 5,
    files: launchpadFiles,
  },
  {
    id: "pulseapi",
    title: "PulseAPI",
    subtitle: "API Backend",
    description:
      "A REST API backend for a mobile app with user management, push notifications, and real-time features.",
    techStack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    features: [
      "User API & Auth",
      "Push Notifications",
      "Real-time Messaging",
      "File Uploads",
    ],
    taskCount: 5,
    files: pulseapiFiles,
  },
];
