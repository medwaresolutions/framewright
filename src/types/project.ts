export interface ProjectState {
  meta: ProjectMeta;
  identity: ProjectIdentity;
  architecture: ProjectArchitecture;
  styling: ProjectStyling;
  conventions: ProjectConventions;
  database: ProjectDatabase;
  features: Feature[];
  tasks: Task[];
  markdownOverrides: Record<string, string>;
  deployment: DeploymentGuide;
}

export interface ProjectMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  highestStepReached: number;
  version: number;
}

export interface ProjectIdentity {
  name: string;
  slug: string;
  purpose: string;
  techStack: TechStackSelection;
  projectMode: "new" | "existing";
  existingFolderTree: string;
  existingSchema: string;
}

export interface TechStackSelection {
  framework: string;
  styling: string;
  database: string;
  auth: string;
  deployment: string;
  componentLibrary: string;
  additional: string[];
}

export interface ProjectArchitecture {
  appType: string;
  layers: ArchitectureLayer[];
}

export interface ArchitectureLayer {
  id: string;
  name: string;
  enabled: boolean;
  notes: string;
  technologies: string[];
}

export interface ProjectStyling {
  colors: BrandColor[];
  fonts: FontSelection;
  componentLibrary: string;
  logoDataUrl: string | null;
  additionalNotes: string;
}

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
}

export interface FontSelection {
  heading: string;
  body: string;
  mono: string;
}

export interface ProjectConventions {
  decisions: ConventionDecision[];
  customConventions: string;
}

export interface ConventionDecision {
  questionId: string;
  selectedOptionId: string | null;
  customAnswer: string | null;
}

export interface ProjectDatabase {
  approach: "plain-english" | "paste-sql" | "import-csv" | "skip";
  plainEnglishDescription: string;
  pastedSchema: string;
  tables: DatabaseTable[];
}

export interface DatabaseTable {
  id: string;
  name: string;
  description: string;
  columns: string;
}

export interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessRules: string[];
  acceptanceCriteria: string[];
  relatedTables: string[];
  sortOrder: number;
}

export type TaskStatus = "not-started" | "in-progress" | "done" | "blocked";

export interface Task {
  id: string;
  taskNumber: number;
  name: string;
  featureIds: string[];
  definitionOfDone: string;
  fileBoundaries: string;
  outOfScope: string;
  status: TaskStatus;
  sortOrder: number;
}

export interface DeploymentGuide {
  enabled: boolean;
  skeletonStructure: string;
  notes: string;
}

export function createDefaultProjectState(): ProjectState {
  const now = new Date().toISOString();

  return {
    meta: {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      currentStep: 1,
      highestStepReached: 1,
      version: 1,
    },
    identity: {
      name: "",
      slug: "",
      purpose: "",
      techStack: {
        framework: "",
        styling: "",
        database: "",
        auth: "",
        deployment: "",
        componentLibrary: "",
        additional: [],
      },
      projectMode: "new",
      existingFolderTree: "",
      existingSchema: "",
    },
    architecture: {
      appType: "",
      layers: [],
    },
    styling: {
      colors: [
        { id: crypto.randomUUID(), name: "Primary", hex: "#18181B" },
        { id: crypto.randomUUID(), name: "Secondary", hex: "#F4F4F5" },
        { id: crypto.randomUUID(), name: "Accent", hex: "#3B82F6" },
        { id: crypto.randomUUID(), name: "Background", hex: "#FFFFFF" },
        { id: crypto.randomUUID(), name: "Text", hex: "#09090B" },
      ],
      fonts: {
        heading: "",
        body: "",
        mono: "",
      },
      componentLibrary: "",
      logoDataUrl: null,
      additionalNotes: "",
    },
    conventions: {
      decisions: [],
      customConventions: "",
    },
    database: {
      approach: "skip",
      plainEnglishDescription: "",
      pastedSchema: "",
      tables: [],
    },
    features: [],
    tasks: [],
    markdownOverrides: {},
    deployment: {
      enabled: false,
      skeletonStructure: "",
      notes: "",
    },
  };
}
