import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Surrogate memory for AI-assisted development
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Give your AI a better memory.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            AI coding assistants are powerful but forgetful. Framewright gives
            them a structured memory — your conventions, architecture, features,
            and task boundaries — that loads into any AI&apos;s context window
            in seconds. No re-explaining. No scope creep. No drift.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Especially powerful for complex projects and developers running
            multiple codebases.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/create">
                Start Your Project <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/guide">Read the Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Sound familiar?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            A new session. A blank context. The AI doesn&apos;t know your stack,
            your conventions, or what you built last week. So you re-explain
            everything — again. Then it &ldquo;helpfully&rdquo; refactors code
            you didn&apos;t ask it to touch. Then it makes an architectural
            decision that conflicts with one you made three weeks ago. The AI
            isn&apos;t the problem. The missing memory is.
          </p>
        </div>
      </section>

      {/* Memory hierarchy */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-8 py-10 text-center">
          <h2 className="text-xl font-semibold sm:text-2xl">
            The right memory, in the right place.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Your AI already has a global memory — your root{" "}
            <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary">
              CLAUDE.md
            </code>
            ,{" "}
            <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary">
              .cursor/rules
            </code>
            , and similar files. That memory is valuable. Don&apos;t clog it
            with project-specific context that bleeds into every other session.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Framewright creates project-scoped memory instead — structured files
            that live inside your repo, travel with your code, and stay
            completely invisible to every other project your AI works on. Global
            memory stays lean. Project context stays contained. The hierarchy
            works the way it should.
          </p>
        </div>
      </section>

      {/* Solution */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">
          A better way to work with AI
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Structured memory, not blank sessions",
              description:
                "Every session starts with your full project context loaded — stack, conventions, architecture, and the exact task at hand. No re-explaining from scratch.",
            },
            {
              icon: ShieldCheck,
              title: "Task boundaries that hold",
              description:
                "Each task defines exactly which files the AI can touch and what it must leave alone. Stop it from \"helpfully\" breaking things you didn't ask it to change.",
            },
            {
              icon: Wrench,
              title: "Works with every AI tool",
              description:
                "Framewright auto-generates config files for Claude Code, Cursor, and GitHub Copilot. Whichever tool you open, your context is already there.",
            },
            {
              icon: Zap,
              title: "Prompts included",
              description:
                "Context window starters are pre-written for every task. Copy, paste, build. You don't need to know how to prompt — the framework does it for you.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
            Setup takes about 10 minutes. Then drop the files into your repo and
            let your AI do the reading.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Walk through the wizard",
                description:
                  "Define your project — identity, stack, architecture, conventions, features, and tasks. Bring your AI to help.",
              },
              {
                step: "2",
                title: "Export your framework",
                description:
                  "Download a ZIP of structured markdown files and drop them into your project root.",
              },
              {
                step: "3",
                title: "Start a session",
                description:
                  "Copy a context window starter prompt, paste it into any AI tool, and watch it orient itself instantly.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {item.step}
                </span>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Reading cascade */}
          <div className="mt-16">
            <h3 className="text-center text-xl font-semibold sm:text-2xl">
              How your AI reads it — every session
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
              The framework is designed for selective, efficient reading. The AI
              never loads everything — only what the current task needs.
            </p>
            <div className="mx-auto mt-10 max-w-2xl">
              {[
                {
                  file: "PRIME.md",
                  title: "Start at the navigator",
                  description:
                    "A tiny file — always small by design — that orients the AI instantly. Project overview, stack, current task status. Read first, every session, no exceptions.",
                },
                {
                  file: "CONTEXT-WINDOW-STARTERS.md",
                  title: "Follow the context starter",
                  description:
                    "A pre-written prompt tells the AI exactly which files to read next — only the docs, features, and tasks relevant to the current work. Nothing irrelevant is loaded.",
                },
                {
                  file: "docs/",
                  title: "Read selectively through the docs",
                  description:
                    "Building a database feature? Read SCHEMA.md. Touching the UI? STYLING.md. Writing new code? CONVENTIONS.md. The cascade routes the AI to exactly what it needs.",
                },
                {
                  file: "features/ → tasks/",
                  title: "Land on the task",
                  description:
                    "Each task file is scoped to complete within a single context window — a clear definition of done, explicit file boundaries, and an out-of-scope section telling the AI what not to touch.",
                },
                {
                  file: "↺ write back",
                  title: "Update memory before exiting",
                  description:
                    "When the task is complete, the AI updates the task file — status, session notes, what changed. The next session starts with accurate, current memory. And the cycle begins again.",
                },
              ].map((item, i, arr) => (
                <div key={item.file} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                      <span className="text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-8">
                    <code className="text-xs font-mono font-semibold text-primary">
                      {item.file}
                    </code>
                    <h4 className="mt-0.5 font-semibold">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">
          What you get
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          A complete set of structured files that drop into your project root.
          Your AI reads them and knows exactly what it&apos;s building.
        </p>
        <div className="mx-auto mt-10 max-w-lg">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <span className="h-3 w-3 rounded-full bg-green-400/60" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                my-project/
              </span>
            </div>
            <pre className="px-5 py-4 text-sm font-mono leading-relaxed text-foreground/90 overflow-x-auto">
{`my-project/
├── PROJECT.md
├── docs/
│   ├── CONVENTIONS.md
│   ├── ARCHITECTURE.md
│   ├── SCHEMA.md
│   └── STYLING.md
├── features/
│   ├── FEATURES-INDEX.md
│   ├── auth.md
│   └── dashboard.md
├── tasks/
│   ├── TASKS-MASTER.md
│   ├── task-000-skeleton.md
│   └── task-001-auth-flow.md
└── CONTEXT-WINDOW-STARTERS.md`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to build with clarity?
          </h2>
          <p className="mt-3 text-muted-foreground">
            It takes about 10 minutes to set up a framework. It saves hours of
            wasted AI sessions.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link href="/create">
              Start Your Project <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
