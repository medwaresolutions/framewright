import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { exampleProjects } from "@/data/examples";
import { ExampleViewer } from "./example-viewer";

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Example Projects
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
        See what the output looks like for different types of projects. Each
        example shows a complete framework with PROJECT.md, conventions,
        features, and tasks — ready to hand to an AI coding agent.
      </p>

      <ExampleViewer projects={exampleProjects} />

      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground">
          Ready to create your own project framework?
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/create">
            Start Your Project <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
