import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  BookOpen,
  Puzzle,
  ListChecks,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  Workflow,
  Copy,
  Bot,
  ClipboardCheck,
  IterationCcw,
  Quote,
} from "lucide-react";

const PILLARS = [
  {
    icon: FileText,
    number: "01",
    title: "Project Identity",
    file: "PROJECT.md",
    description:
      "A single master file that describes what your project is, what tech stack it uses, and how it's structured. This is the first file every AI session reads.",
    tip: "Keep it under 3,000 words — concise enough to fit in context, detailed enough to prevent misunderstandings.",
  },
  {
    icon: BookOpen,
    number: "02",
    title: "Conventions",
    file: "CONVENTIONS.md",
    description:
      "The decisions that keep your codebase consistent: how components are organized, how data is fetched, how errors are handled, how files are named.",
    tip: "Without conventions, AI will invent its own patterns — different patterns every session.",
  },
  {
    icon: Puzzle,
    number: "03",
    title: "Features",
    file: "features/*.md",
    description:
      "Each feature gets its own file describing what it does, its business rules, and which database tables it touches. Features describe outcomes, not implementation steps.",
    tip: '"Users can book appointments" — not "Create a form with date picker, then call the API."',
  },
  {
    icon: ListChecks,
    number: "04",
    title: "Tasks",
    file: "tasks/*.md",
    description:
      "Features broken into focused tasks — each small enough for a single AI session. Every task has a Definition of Done that tells the AI exactly what finished looks like.",
    tip: "Tasks own specific files and directories, preventing AI sessions from stepping on each other.",
  },
  {
    icon: BrainCircuit,
    number: "05",
    title: "Context Window Management",
    file: "CONTEXT-WINDOW-STARTERS.md",
    description:
      "Don't dump everything into the AI's context. Give it the master file + conventions + the specific feature + the specific task. Focused context produces dramatically better results.",
    tip: "More context ≠ better results. The right context = better results.",
  },
];

const WORKFLOW_STEPS = [
  {
    icon: Workflow,
    title: "Create your framework",
    description: "Walk through the guided wizard to define your project's identity, architecture, conventions, features, and tasks.",
  },
  {
    icon: Copy,
    title: "Copy the context starter",
    description: "For each coding session, grab the context window starter prompt — it tells the AI exactly which files to read.",
  },
  {
    icon: Bot,
    title: "Paste into any AI tool",
    description: "Works with Claude, ChatGPT, Cursor, Windsurf, Copilot — any AI coding assistant. The framework is tool-agnostic.",
  },
  {
    icon: ClipboardCheck,
    title: "Review against the Definition of Done",
    description: "Each task has a clear checklist. Review the AI's output against it. If it passes, move on. If not, iterate with context intact.",
  },
  {
    icon: IterationCcw,
    title: "Move to the next task",
    description: "Start a fresh session with the next task's context. The AI already knows your project — it just needs the new assignment.",
  },
];

export default function GuidePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Methodology
          </div>
          <h1 className="mt-6 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            The AI Development{" "}
            <span className="text-primary">Framework Guide</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A complete methodology for structuring software projects so AI
            assistants produce consistent, high-quality code from session one.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
              The core problem
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Most people use AI for coding the same way: open a chat, describe
              what they want, and hope for the best. This works for small
              scripts, but falls apart on real projects.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                problem: "No memory",
                detail: "The AI doesn't know your conventions, your architecture, or what you've already built. Every session starts from zero.",
              },
              {
                problem: "Inconsistent output",
                detail: "Without guidance, AI invents its own patterns — different patterns every session. Your codebase becomes a patchwork.",
              },
              {
                problem: "Wasted iterations",
                detail: "You spend more time correcting the AI than coding. 15 rounds of \"that's not what I meant\" before you get something usable.",
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="rounded-lg border border-border bg-card p-5"
              >
                <h3 className="font-semibold text-destructive/80">{item.problem}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
            The solution: a project framework
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A project framework is a set of structured documents that give AI
            everything it needs to do excellent work. Instead of explaining your
            project from scratch every time, you hand the AI a set of files that
            describe your project&apos;s identity, conventions, features, and
            current task.
          </p>
        </div>
      </section>

      {/* The Five Pillars */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              The five pillars
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every framework is built on the same five document types.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="flex gap-5 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md sm:items-start"
              >
                <div className="hidden shrink-0 sm:block">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <pillar.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tracking-wider text-muted-foreground sm:hidden">
                      {pillar.number}
                    </span>
                    <h3 className="text-lg font-semibold">{pillar.title}</h3>
                    <code className="hidden rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                      {pillar.file}
                    </code>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                  <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2">
                    <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <p className="text-xs text-muted-foreground italic">
                      {pillar.tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Workflow */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">The workflow</h2>
          <p className="mt-3 text-muted-foreground">
            Five steps from planning to building. Repeat for every task.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Connecting line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-border sm:block" aria-hidden="true" />

          <div className="space-y-8">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.title} className="relative flex gap-5">
                {/* Step number circle */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-0.5 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Insight Callout */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <BrainCircuit className="h-6 w-6 text-accent" />
              </div>
              <h2 className="mt-5 text-xl font-semibold sm:text-2xl">
                The key insight
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
                AI doesn&apos;t need your entire codebase. It needs the right
                slice of context for the task at hand. A project framework gives
                every AI session exactly what it needs — no more, no less.
              </p>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                The result: consistent code, fewer iterations, and AI that
                actually understands what you&apos;re building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
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
