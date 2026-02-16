# Contributing to Framewright

Thanks for your interest in contributing! Framewright is an open-source tool that helps developers structure projects for AI-assisted development.

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Getting Started

```bash
# Fork and clone the repo
git clone https://github.com/<your-username>/framewright.git
cd framewright

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

Framewright uses Next.js static export — no server-side runtime required.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── wizard/           # Wizard shell, steps, navigation
│   ├── layout/           # Header, footer
│   └── shared/           # Reusable components
├── contexts/             # React context (project state)
├── data/                 # Tech stack options, conventions, defaults
├── hooks/                # Custom hooks
├── lib/
│   ├── markdown/         # Markdown generators for each output file
│   ├── export/           # ZIP creation, file tree
│   └── prompts/          # Context window starter templates
└── types/                # TypeScript interfaces
```

## Pull Request Process

1. **Fork** the repo and create a branch from `main`
2. **Make your changes** — keep PRs focused on a single concern
3. **Test** — run `npm run build` to ensure everything compiles
4. **Describe** your changes clearly in the PR description
5. **Submit** — we'll review and provide feedback

### Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes
- `refactor/description` — code restructuring

## Code Style

- **TypeScript** — all code is typed, avoid `any`
- **Functional components** — React function components with hooks
- **Tailwind CSS** — utility-first styling, use `cn()` for conditional classes
- **shadcn/ui** — use existing UI primitives before creating new ones
- **Named exports** — prefer named exports over default exports
- **Colocation** — keep related code close together

### Conventions

- Use `"use client"` directive only on components that need client-side interactivity
- State management via React context (`useProject()` hook)
- All project state lives in `ProjectState` (see `src/types/project.ts`)
- Generated markdown files are pure functions of state (see `src/lib/markdown/`)

## Reporting Issues

- Use GitHub Issues
- Include steps to reproduce
- Include browser and OS info for UI bugs
- Screenshots are helpful

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
