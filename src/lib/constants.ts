export const APP_NAME = "Framewright";
export const APP_TAGLINE = "Set up your project so AI actually knows what it's building.";

export const STORAGE_KEY = "framewright_project_v1";
export const STORAGE_VERSION = 1;

export const PROJECT_MD_WORD_WARNING = 2500;
export const PROJECT_MD_WORD_DANGER = 3000;

export const MAX_FEATURES = 50;
export const MAX_TASKS = 100;
export const MAX_BUSINESS_RULES_PER_FEATURE = 20;

export const APP_TYPES = [
  { id: "web-app", label: "Web Application", description: "A full web app with frontend and potentially backend" },
  { id: "mobile-app", label: "Mobile App", description: "Native or cross-platform mobile application" },
  { id: "api", label: "API / Backend Only", description: "REST or GraphQL API without a frontend" },
  { id: "static-site", label: "Static Site", description: "Marketing site, blog, or documentation" },
  { id: "monorepo", label: "Monorepo", description: "Multiple packages in a single repository" },
  { id: "cli", label: "CLI Tool", description: "Command-line application" },
  { id: "library", label: "Library / Package", description: "Reusable code published as a package" },
] as const;
