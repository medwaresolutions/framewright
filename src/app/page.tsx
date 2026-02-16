import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Target,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Stop prompting.{" "}
            <span className="text-muted-foreground">Start planning.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The framework that makes AI build what you actually want. Set up
            your project so every AI session starts with the right context.
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
            You prompt AI to build something. It builds something wrong. You
            iterate 15 times. You end up with inconsistent code, mixed patterns,
            and wasted hours. The problem isn&apos;t the AI — it&apos;s that you
            skipped the planning step.
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
              icon: FileText,
              title: "Structure first",
              description:
                "Define your project before you open AI. Name it, set the tech stack, choose your architecture.",
            },
            {
              icon: Target,
              title: "Features as outcomes",
              description:
                "Describe what you want built, not step-by-step instructions. Let AI figure out the how.",
            },
            {
              icon: Layers,
              title: "Right-sized context",
              description:
                "Give every AI session just enough context to do great work — no more, no less.",
            },
            {
              icon: CheckCircle2,
              title: "Isolated tasks",
              description:
                "Break features into focused tasks with clear definitions of done. One task per AI session.",
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
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Walk through the wizard",
                description:
                  "Answer guided questions about your project — identity, architecture, conventions, features, and tasks.",
              },
              {
                step: "2",
                title: "Export your framework",
                description:
                  "Download a ZIP of well-structured markdown files — PROJECT.md, CONVENTIONS.md, feature files, task files.",
              },
              {
                step: "3",
                title: "Use with any AI",
                description:
                  "Copy the context window starter prompt. Paste it into Claude, ChatGPT, Cursor — any AI tool. Start building.",
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
