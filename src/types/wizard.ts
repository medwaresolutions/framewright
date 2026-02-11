export interface WizardStep {
  number: number;
  id: string;
  title: string;
  description: string;
  isConditional: boolean;
  isOptional: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    number: 1,
    id: "project-identity",
    title: "Project Identity",
    description: "Name your project and choose your tech stack",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 2,
    id: "architecture",
    title: "Architecture",
    description: "Define your app type and architecture layers",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 3,
    id: "styling",
    title: "Styling & Brand",
    description: "Set your brand colors, fonts, and component library",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 4,
    id: "conventions",
    title: "Conventions",
    description: "Choose the coding patterns your project will follow",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 5,
    id: "database",
    title: "Database Schema",
    description: "Define your database tables and relationships",
    isConditional: true,
    isOptional: false,
  },
  {
    number: 6,
    id: "features",
    title: "Features",
    description: "Define what your project needs to do",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 7,
    id: "tasks",
    title: "Tasks",
    description: "Break features into focused, AI-ready tasks",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 8,
    id: "review",
    title: "Review & Export",
    description: "Review your framework files and download",
    isConditional: false,
    isOptional: false,
  },
  {
    number: 9,
    id: "deployment",
    title: "Deployment Guide",
    description: "Get a skeleton file structure and deployment checklist",
    isConditional: false,
    isOptional: true,
  },
];
