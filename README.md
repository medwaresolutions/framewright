# Framewright

**Set up your project so AI actually knows what it's building.**

Framewright is a guided wizard that helps you create structured project documentation optimised for AI-assisted development. Instead of jumping into code and hoping your AI assistant figures it out, Framewright walks you through defining your project identity, architecture, conventions, features, and tasks — then exports a complete documentation framework that any AI coding tool can use as context.

![Framewright Screenshot](docs/screenshot-placeholder.png)

## Why Framewright?

AI coding assistants work best when they have clear context. But most developers skip the planning phase, leading to:

- 🔄 Repeated explanations across chat sessions
- 🏗️ Inconsistent architecture decisions
- 🐛 AI "guessing" at conventions and patterns
- 📋 Tasks that are too vague or too large

Framewright solves this by generating a structured set of markdown files (`PROJECT.md`, `CONVENTIONS.md`, `FEATURES/`, `TASKS/`, etc.) that you drop into your repo root. Your AI assistant reads them and *actually knows what it's building*.

## Features

- 🧙 **Step-by-step wizard** — Project identity, architecture, styling, conventions, database schema, features, tasks
- 📦 **One-click export** — Download a ZIP of all framework files
- 🔗 **Task ↔ Feature linking** — Every task maps to features, every feature maps to tasks
- 🎯 **AI-ready task format** — Definition of Done, file boundaries, context window starters
- 🚀 **Skeleton Deployment** — Auto-generated task-000 to get your project deployed first
- 🔍 **Validation warnings** — Catch incomplete features, orphaned tasks, missing conventions
- 📥 **Import existing projects** — Paste your folder tree or schema to bootstrap the wizard
- 💾 **Auto-save** — Everything persists in localStorage

## Use It Now

**👉 [framewright.site](https://framewright.site)** — no install, no sign-up. Just open it and start building your project framework.

## Run It Locally

```bash
# Clone the repo
git clone https://github.com/medwaresolutions/framewright.git
cd framewright

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Define** your project name, purpose, and tech stack
2. **Design** your architecture layers and conventions
3. **Plan** features and break them into focused tasks
4. **Export** a ZIP of structured markdown files
5. **Drop** the files into your repo root
6. **Paste** the task-000 Skeleton Deployment prompt into your AI
7. **Build** — your AI now has full project context

## Output Files

Framewright generates:

| File | Purpose |
|------|---------|
| `PROJECT.md` | Project overview, tech stack, architecture |
| `CONVENTIONS.md` | Coding standards and patterns |
| `STYLING.md` | Brand colors, fonts, component library |
| `SCHEMA.md` | Database schema (if applicable) |
| `FEATURES/*.md` | Individual feature specs with business rules |
| `TASKS/*.md` | Focused task files with Definition of Done |
| `CONTEXT-WINDOW-STARTERS.md` | Copy-paste prompts for each task |

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) components
- [JSZip](https://stuk.github.io/jszip/) for export
- Static export — no server required

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, PR process, and code style guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.

Copyright © 2026 Matt Martin / Medware Solutions
