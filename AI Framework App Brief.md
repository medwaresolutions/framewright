# PROJECT BRIEF: AI Development Framework — Web App

## For: Handing to an AI assistant to build
## Author: Matt Martin & Claude
## Date: February 2026

---

## 1. What This Is

A single-page web application that helps people structure software projects for AI-assisted development. It walks users through creating a complete project framework — master file, conventions, features, tasks, and folder structure — using an interactive wizard. The output is a set of well-structured markdown files that users take to their AI tool of choice.

**This is not a project management tool.** It is a project *setup* tool specifically designed to make AI collaboration more effective.

**Tagline idea:** "Set up your project so AI actually knows what it's building."

---

## 2. Who It's For

Solo developers, founders, designers, and non-technical builders who use AI (Claude, ChatGPT, Copilot, Cursor, etc.) to build software. These users are technically capable but not formally trained developers. They know AI can build things but struggle with getting consistent, high-quality output on complex projects.

They are NOT looking for another Jira, Notion, or GitHub. They want something that sits *before* the AI conversation — a tool that helps them prepare.

---

## 3. Core User Flow

```
Landing Page (methodology overview + "Start Your Project" CTA)
    │
    ▼
Step 1: Project Identity
    │   - Project name, purpose (2-3 sentences), tech stack selection
    │   - Output: Seeds the PROJECT.md header
    │
    ▼
Step 2: Architecture
    │   - What type of app? (web app, mobile, API, static site, etc.)
    │   - Key layers? (frontend, backend/API, database, auth, external services)
    │   - Interactive: user checks boxes, adds notes per layer
    │   - Output: Architecture section of PROJECT.md
    │
    ▼
Step 3: Styling & Brand
    │   - Brand colours (colour pickers with hex output)
    │   - Font selections (or "use defaults")
    │   - Component library (shadcn, Material UI, none, custom)
    │   - Logo upload or skip
    │   - Output: STYLING.md
    │
    ▼
Step 4: Conventions
    │   - This is the KEY step where users need the most guidance
    │   - Present common convention decisions as multiple-choice cards:
    │       "How should components be organised?"
    │           → Option A: By type (components/buttons, components/forms)
    │           → Option B: By feature (components/auth, components/dashboard)
    │           → Option C: Not sure — help me decide
    │       "How should data be fetched?"
    │           → Option A: Server components (Next.js)
    │           → Option B: Client-side with hooks
    │           → Option C: API routes
    │           → Option D: Not sure
    │       "How should errors be handled?"
    │           → Option A: Return error objects
    │           → Option B: Throw exceptions
    │           → Option C: Not sure
    │   - For "Not sure" selections: show a brief plain-English explanation
    │     of the trade-offs, then let them pick
    │   - Convention cards should be CONTEXTUAL to the tech stack chosen
    │     in Step 2 (e.g., Next.js conventions only show if Next.js selected)
    │   - Output: CONVENTIONS.md
    │
    ▼
Step 5: Database Schema (conditional — only if database selected in Step 2)
    │   - Option A: Describe tables in plain English, app generates
    │     a prompt for the user to take to their AI to produce SCHEMA.md
    │   - Option B: Paste in existing schema (SQL or description)
    │   - Option C: Skip for now
    │   - Output: SCHEMA.md or placeholder
    │
    ▼
Step 6: Define Features
    │   - User adds features by name + short description
    │   - For each feature, user can add:
    │       - Business rules (plain English)
    │       - Related database tables (dropdown from schema if defined)
    │   - Drag to reorder by priority
    │   - Output: Individual feature markdown files + FEATURES-INDEX.md
    │
    ▼
Step 7: Break Features into Tasks
    │   - For each feature, suggest breaking it into tasks
    │   - Each task gets:
    │       - Name
    │       - Definition of Done (guided: "What does 'finished' look like?")
    │       - Which feature(s) it relates to (can select multiple)
    │       - File boundaries (which directories/files this task owns)
    │   - Cross-references are auto-generated
    │   - Output: Individual task files + TASKS-MASTER.md
    │
    ▼
Step 8: Review & Export
    │   - Show the complete project hierarchy as a visual tree
    │   - Show each generated file with live preview
    │   - Word count indicator on PROJECT.md (with warning if > 3000 words)
    │   - Allow inline editing of any file before export
    │   - Export options:
    │       → Download as ZIP (folder structure with all .md files)
    │       → Copy individual files to clipboard
    │       → "Copy Context Window Starter Prompt" button — generates
    │         the instruction pattern for the user's first AI session
    │
    ▼
(Optional) Step 9: Skeleton Deployment Guide
        - Based on tech stack selected, show a recommended skeleton
          file structure (like the example in our framework document)
        - Generate a prompt the user can take to their AI to build
          the skeleton deployment
        - Checklist of what to verify before starting feature work
```

---

## 4. Key Features & Interactions

### 4.1 The Prompt Generator
Throughout the app, wherever the user needs AI help (writing detailed conventions, generating a schema, creating feature descriptions), the app should generate a **"Copy Prompt" button** rather than calling an AI API.

The generated prompt should:
- Include all project context the app already knows (tech stack, architecture, etc.)
- Explicitly state that the output will be used as part of a project framework
- Request the output in a specific markdown format that the app can validate
- Be ready to paste directly into any AI chat

Example generated prompt for conventions:
```
I'm setting up a project framework for AI-assisted development.

Project: MedFlow Clinic App
Tech Stack: Next.js 14 (App Router), Supabase, Tailwind CSS, shadcn/ui
Architecture: Web app with frontend, API routes, database, authentication

I need you to write a CONVENTIONS.md file covering code patterns and
standards for this project. Format it as markdown with clear sections.
Keep it under 1500 words. Cover:

- Component organisation (we've chosen: by feature)
- Data fetching patterns (we've chosen: server components)
- Error handling (we've chosen: return error objects)
- Naming conventions for files, components, database tables, API routes
- Any other conventions relevant to this specific tech stack

The audience is an AI assistant that will read this file at the start of
every coding session. Write it so that an AI can follow these conventions
without ambiguity.
```

### 4.2 Smart Defaults
The app should have sensible defaults for common tech stacks:

- **Next.js + Supabase + Tailwind**: Pre-fill conventions, suggest common features (auth, dashboard, CRUD), recommend server components, suggest RLS patterns
- **React + Firebase**: Different defaults
- **Python + FastAPI**: Different defaults
- **Static site**: Minimal conventions, no database step

Users can always override defaults. The goal is to reduce blank-page anxiety.

### 4.3 Word Count & Validation
- PROJECT.md: Show live word count, yellow warning at 2500, red at 3000
- All files: Validate that cross-references point to files that exist
- Tasks: Warn if a task doesn't have a Definition of Done
- Features: Warn if a feature has no tasks associated with it

### 4.4 The Context Window Starter
The single most valuable output of the entire app. A button that generates:

```
Read PROJECT.md, then read CONVENTIONS.md, then read
features/[feature-name].md, then read tasks/task-[NNN].md.
Complete the task described in the task file. On completion,
review your work against the Definition of Done.
```

Pre-filled with the actual file paths from the user's project. Ready to paste into any AI tool.

---

## 5. What This Is NOT (Scope Boundaries)

- ❌ No AI API integration in v1 (no calling Claude/GPT/etc.)
- ❌ No user accounts or authentication in v1
- ❌ No cloud storage — everything is local/exported
- ❌ No project management features (no timelines, no assignments, no sprints)
- ❌ No code generation — the app generates documentation, not code
- ❌ No collaboration features in v1 (single user)
- ❌ No Git integration

---

## 6. Tech Stack Recommendation

Given the scope, this should be lightweight:

- **Framework**: Next.js (static export) or plain React with Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React state + context (no external state library needed)
- **Storage**: Browser localStorage for work-in-progress, export to filesystem
- **Deployment**: Vercel (static) or Netlify
- **No database required for v1**

The entire app can be a single-page application with step-based navigation.

---

## 7. Design Principles

### Look & Feel
- Clean, minimal, professional. Not playful, not corporate.
- Think: Stripe's documentation meets Notion's simplicity.
- Light mode by default. Dark mode is nice-to-have, not essential.
- The design should feel like a tool for builders — competent, fast, no fluff.

### Typography
- Clear hierarchy. The generated markdown previews should look beautiful.
- Monospace for file names, paths, and code-like content.
- Generous whitespace. This is a thinking tool — don't crowd the screen.

### Interaction
- Step-by-step wizard with clear progress indicator.
- Users can navigate back to any step without losing work.
- Auto-save to localStorage so nothing is lost on refresh.
- Every generated file is editable inline before export.
- Copy-to-clipboard buttons everywhere they're useful.

---

## 8. Page Structure

```
/                           → Landing page with methodology overview
                              and "Start Your Project" CTA

/create                     → The wizard (all steps in one route,
                              step navigation via tabs or stepper)

/guide                      → The full framework document (the
                              methodology we wrote, rendered as
                              beautiful readable content — this IS
                              the content marketing)

/examples                   → 2-3 pre-built example projects showing
                              what the output looks like:
                              - A SaaS dashboard (Next.js + Supabase)
                              - A marketing site with CMS
                              - A mobile app backend (API only)
```

---

## 9. Landing Page Content Structure

The landing page should communicate the methodology concisely and drive
users to either read the full guide or start building immediately.

**Hero:**
- Headline: Something like "Stop prompting. Start planning." or
  "The framework that makes AI build what you actually want."
- Subhead: One sentence explaining the concept.
- Two CTAs: "Start Your Project" (primary) and "Read the Guide" (secondary)

**Problem section:**
- Brief, relatable description of the pain: you prompt AI, it builds
  something wrong, you iterate 15 times, you end up with inconsistent
  code and wasted hours.

**Solution section:**
- The core methodology in 3-4 bullet points (not the full document,
  just the key ideas):
  1. Structure your project before you open AI
  2. Define features as outcomes, not step-by-step instructions
  3. Give every AI session just enough context to do great work
  4. Keep tasks focused and isolated

**How it works:**
- Visual showing the wizard steps → export → use with any AI

**The methodology section:**
- Link to the full guide (/guide)
- This is the thought leadership content that drives organic traffic

---

## 10. Example Output

When a user completes the wizard for a project called "ClinicFlow", they
should be able to download a ZIP containing:

```
clinicflow-framework/
├── PROJECT.md
├── docs/
│   ├── CONVENTIONS.md
│   ├── SCHEMA.md
│   ├── STYLING.md
│   └── ARCHITECTURE.md
├── features/
│   ├── FEATURES-INDEX.md
│   ├── auth.md
│   ├── patient-management.md
│   └── appointment-booking.md
├── tasks/
│   ├── TASKS-MASTER.md
│   ├── task-001-skeleton-deployment.md
│   ├── task-002-auth-flow.md
│   ├── task-003-patient-api.md
│   ├── task-004-patient-ui.md
│   └── task-005-appointment-booking.md
└── CONTEXT-WINDOW-STARTERS.md      ← Ready-to-paste prompts for each task
```

---

## 11. Success Metrics (How to Know It's Working)

- Users complete the wizard and download a ZIP (primary conversion)
- Users copy context window starter prompts (indicates actual usage)
- Users return to create additional projects (retention signal)
- Guide page gets organic search traffic (content marketing working)
- Users share the tool (word of mouth — the real growth engine)

---

## 12. Future Versions (NOT v1 — Just Noting for Context)

- **v2**: "Bring your own API key" — users connect their AI provider
  and the app generates files directly without copy-paste
- **v2**: Import existing project — upload a codebase or repo URL
  and the app reverse-engineers a framework from it
- **v2**: User accounts + cloud storage for project frameworks
- **v2**: "Update mode" — feed back completed task results and the
  app updates feature files and project status automatically
- **v3**: Team collaboration — multiple people contributing to the
  same project framework
- **v3**: AI provider plugins — native integrations with Claude,
  ChatGPT, Cursor, etc.

---

## 13. Notes for the Building AI

This project should itself follow the methodology it teaches. That means:

1. Build the skeleton first — routing, layout, navigation, step wizard
   shell with placeholder content. Verify it deploys.
2. Then build each wizard step as an isolated task.
3. The convention decisions in this app should use the conventions
   described in the framework document (server components, error
   objects not exceptions, feature-based file organisation).
4. The generated markdown should look professional when rendered.
   Pay attention to formatting — this is the product's core output.
5. localStorage saves should be frequent and automatic. Losing
   work-in-progress is unacceptable.
6. The export ZIP must produce a valid, well-structured folder that
   a user can immediately drop into their project root.

**The most important thing**: The wizard must feel guided and supportive,
never overwhelming. Each step should have clear instructions, sensible
defaults, and the option to skip and come back. The target user is
someone who finds GitHub confusing — respect that.
