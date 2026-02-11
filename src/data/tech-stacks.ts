export interface TechOption {
  id: string;
  label: string;
  description: string;
}

export interface TechCategory {
  id: string;
  label: string;
  options: TechOption[];
}

export const frameworkOptions: TechOption[] = [
  { id: "nextjs", label: "Next.js", description: "React framework with server-side rendering, API routes, and file-based routing" },
  { id: "react-vite", label: "React + Vite", description: "Client-side React with fast Vite build tooling" },
  { id: "python-fastapi", label: "Python + FastAPI", description: "High-performance Python API framework" },
  { id: "python-django", label: "Python + Django", description: "Full-featured Python web framework" },
  { id: "static", label: "Static Site", description: "HTML/CSS/JS site with optional static site generator" },
  { id: "svelte", label: "SvelteKit", description: "Svelte framework with server-side rendering and routing" },
  { id: "vue-nuxt", label: "Vue + Nuxt", description: "Vue framework with SSR and file-based routing" },
  { id: "express", label: "Node.js + Express", description: "Minimal Node.js web framework for APIs" },
  { id: "other", label: "Other", description: "A framework not listed here" },
];

export const stylingOptions: TechOption[] = [
  { id: "tailwind", label: "Tailwind CSS", description: "Utility-first CSS framework" },
  { id: "css-modules", label: "CSS Modules", description: "Scoped CSS files per component" },
  { id: "styled-components", label: "Styled Components", description: "CSS-in-JS with tagged template literals" },
  { id: "sass", label: "Sass/SCSS", description: "CSS preprocessor with nesting and variables" },
  { id: "plain-css", label: "Plain CSS", description: "Standard CSS without preprocessors" },
  { id: "none", label: "None / Backend only", description: "No frontend styling needed" },
];

export const databaseOptions: TechOption[] = [
  { id: "supabase", label: "Supabase", description: "Open-source Firebase alternative with Postgres" },
  { id: "firebase", label: "Firebase", description: "Google's real-time database and backend platform" },
  { id: "postgresql", label: "PostgreSQL", description: "Advanced open-source relational database" },
  { id: "mysql", label: "MySQL", description: "Popular open-source relational database" },
  { id: "mongodb", label: "MongoDB", description: "Document-based NoSQL database" },
  { id: "sqlite", label: "SQLite", description: "Lightweight embedded database" },
  { id: "prisma", label: "Prisma (ORM)", description: "TypeScript ORM — pair with a database above" },
  { id: "drizzle", label: "Drizzle (ORM)", description: "Lightweight TypeScript ORM" },
  { id: "none", label: "No Database", description: "This project doesn't need a database" },
];

export const authOptions: TechOption[] = [
  { id: "supabase-auth", label: "Supabase Auth", description: "Built-in auth with Supabase" },
  { id: "next-auth", label: "NextAuth.js / Auth.js", description: "Flexible authentication for Next.js" },
  { id: "firebase-auth", label: "Firebase Auth", description: "Google's authentication service" },
  { id: "clerk", label: "Clerk", description: "Drop-in user management and auth" },
  { id: "custom", label: "Custom Auth", description: "Roll your own authentication" },
  { id: "none", label: "No Auth", description: "No authentication needed" },
];

export const deploymentOptions: TechOption[] = [
  { id: "vercel", label: "Vercel", description: "Optimized for Next.js, automatic deployments" },
  { id: "netlify", label: "Netlify", description: "JAMstack hosting with CI/CD" },
  { id: "railway", label: "Railway", description: "Simple cloud platform for apps and databases" },
  { id: "render", label: "Render", description: "Cloud platform for web services" },
  { id: "aws", label: "AWS", description: "Amazon Web Services" },
  { id: "fly", label: "Fly.io", description: "Deploy app servers close to users globally" },
  { id: "docker", label: "Docker / Self-hosted", description: "Container-based deployment" },
  { id: "other", label: "Other", description: "A platform not listed here" },
];

export const componentLibraryOptions: TechOption[] = [
  { id: "shadcn", label: "shadcn/ui", description: "Copy-paste Radix-based components with Tailwind" },
  { id: "material-ui", label: "Material UI", description: "Google's Material Design component library" },
  { id: "chakra", label: "Chakra UI", description: "Accessible component library for React" },
  { id: "ant-design", label: "Ant Design", description: "Enterprise-level UI component library" },
  { id: "headless-ui", label: "Headless UI", description: "Unstyled, accessible components" },
  { id: "none", label: "None", description: "No component library — custom components only" },
];

export const allTechCategories: TechCategory[] = [
  { id: "framework", label: "Framework", options: frameworkOptions },
  { id: "styling", label: "Styling", options: stylingOptions },
  { id: "database", label: "Database", options: databaseOptions },
  { id: "auth", label: "Authentication", options: authOptions },
  { id: "deployment", label: "Deployment", options: deploymentOptions },
  { id: "componentLibrary", label: "Component Library", options: componentLibraryOptions },
];

export function getTechLabel(categoryId: string, optionId: string): string {
  const category = allTechCategories.find((c) => c.id === categoryId);
  if (!category) return optionId;
  const option = category.options.find((o) => o.id === optionId);
  return option?.label ?? optionId;
}
