import type { TechStackSelection, ArchitectureLayer, BrandColor } from "@/types/project";

interface SmartDefaults {
  architecture: {
    appType: string;
    layers: ArchitectureLayer[];
  };
  suggestedFeatures: string[];
  conventionRecommendations: Record<string, string>;
}

const DEFAULT_LAYERS: ArchitectureLayer[] = [
  { id: "frontend", name: "Frontend", enabled: true, notes: "", technologies: [] },
  { id: "backend", name: "Backend / API", enabled: false, notes: "", technologies: [] },
  { id: "database", name: "Database", enabled: false, notes: "", technologies: [] },
  { id: "auth", name: "Authentication", enabled: false, notes: "", technologies: [] },
  { id: "external", name: "External Services", enabled: false, notes: "", technologies: [] },
  { id: "storage", name: "File Storage", enabled: false, notes: "", technologies: [] },
  { id: "realtime", name: "Real-time / WebSockets", enabled: false, notes: "", technologies: [] },
];

export function getSmartDefaults(techStack: TechStackSelection): SmartDefaults {
  const framework = techStack.framework;

  switch (framework) {
    case "nextjs":
      return {
        architecture: {
          appType: "web-app",
          layers: DEFAULT_LAYERS.map((l) => {
            if (l.id === "frontend") return { ...l, enabled: true, technologies: ["Next.js", techStack.styling === "tailwind" ? "Tailwind CSS" : ""].filter(Boolean) };
            if (l.id === "backend") return { ...l, enabled: true, notes: "Next.js API routes / Server Actions", technologies: ["Next.js Route Handlers"] };
            if (l.id === "database" && techStack.database !== "none") return { ...l, enabled: true, technologies: [techStack.database] };
            if (l.id === "auth" && techStack.auth !== "none") return { ...l, enabled: true, technologies: [techStack.auth] };
            return l;
          }),
        },
        suggestedFeatures: [
          "Authentication & user management",
          "Dashboard / home page",
          "Settings page",
          "CRUD operations",
        ],
        conventionRecommendations: {
          "component-organization": "by-feature",
          "data-fetching": "server-components",
          "error-handling": "error-objects",
          "state-management": "react-context",
        },
      };

    case "react-vite":
      return {
        architecture: {
          appType: "web-app",
          layers: DEFAULT_LAYERS.map((l) => {
            if (l.id === "frontend") return { ...l, enabled: true, technologies: ["React", "Vite"] };
            if (l.id === "database" && techStack.database !== "none") return { ...l, enabled: true };
            if (l.id === "auth" && techStack.auth !== "none") return { ...l, enabled: true };
            return l;
          }),
        },
        suggestedFeatures: [
          "Authentication",
          "Dashboard",
          "Settings",
        ],
        conventionRecommendations: {
          "component-organization": "by-feature",
          "data-fetching": "client-hooks",
          "error-handling": "error-objects",
        },
      };

    case "python-fastapi":
      return {
        architecture: {
          appType: "api",
          layers: DEFAULT_LAYERS.map((l) => {
            if (l.id === "frontend") return { ...l, enabled: false };
            if (l.id === "backend") return { ...l, enabled: true, technologies: ["FastAPI", "Python"] };
            if (l.id === "database" && techStack.database !== "none") return { ...l, enabled: true };
            if (l.id === "auth" && techStack.auth !== "none") return { ...l, enabled: true };
            return l;
          }),
        },
        suggestedFeatures: [
          "User API endpoints",
          "Authentication",
          "CRUD endpoints",
          "Health check & monitoring",
        ],
        conventionRecommendations: {
          "error-handling": "error-objects",
        },
      };

    case "static":
      return {
        architecture: {
          appType: "static-site",
          layers: DEFAULT_LAYERS.map((l) => {
            if (l.id === "frontend") return { ...l, enabled: true, technologies: ["HTML", "CSS", "JavaScript"] };
            return { ...l, enabled: false };
          }),
        },
        suggestedFeatures: [
          "Landing page",
          "About page",
          "Contact form",
        ],
        conventionRecommendations: {},
      };

    default:
      return {
        architecture: {
          appType: "web-app",
          layers: DEFAULT_LAYERS,
        },
        suggestedFeatures: [],
        conventionRecommendations: {},
      };
  }
}

export const DEFAULT_BRAND_COLORS: BrandColor[] = [
  { id: "primary", name: "Primary", hex: "#18181B" },
  { id: "secondary", name: "Secondary", hex: "#F4F4F5" },
  { id: "accent", name: "Accent", hex: "#3B82F6" },
  { id: "background", name: "Background", hex: "#FFFFFF" },
  { id: "text", name: "Text", hex: "#09090B" },
];
