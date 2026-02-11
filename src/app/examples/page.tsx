import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const examples = [
  {
    title: "SaaS Dashboard",
    description:
      "A clinic management dashboard with authentication, patient records, and appointment booking. Built with Next.js, Supabase, and Tailwind.",
    techStack: ["Next.js", "Supabase", "Tailwind", "shadcn/ui"],
    features: [
      "Authentication & RBAC",
      "Patient management",
      "Appointment booking",
      "Dashboard analytics",
    ],
    taskCount: 12,
  },
  {
    title: "Marketing Site with CMS",
    description:
      "A marketing website with blog, landing pages, and content management. Static site with headless CMS integration.",
    techStack: ["Next.js", "Sanity CMS", "Tailwind"],
    features: [
      "Landing pages",
      "Blog with MDX",
      "Contact form",
      "SEO optimization",
    ],
    taskCount: 8,
  },
  {
    title: "Mobile App Backend",
    description:
      "A REST API backend for a mobile app with user management, push notifications, and real-time features.",
    techStack: ["Python", "FastAPI", "PostgreSQL", "Redis"],
    features: [
      "User API & auth",
      "Push notifications",
      "Real-time messaging",
      "File uploads",
    ],
    taskCount: 10,
  },
];

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Example Projects
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        See what the output looks like for different types of projects. Each
        example shows a complete framework with PROJECT.md, conventions,
        features, and tasks.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Card key={example.title} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{example.title}</CardTitle>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex flex-wrap gap-1.5">
                {example.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="flex-1">
                <p className="mb-2 text-sm font-medium">Features:</p>
                <ul className="space-y-1">
                  {example.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm text-muted-foreground"
                    >
                      &bull; {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                {example.taskCount} tasks defined
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
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
