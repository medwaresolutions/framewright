import type { ProjectState, Task } from "@/types/project";
import type { GeneratedFile } from "@/types/export";
import { generateProjectMd } from "./generate-project";
import { generatePrimeMd } from "./generate-prime";
import { generateArchitectureMd } from "./generate-architecture";
import {
  generateConventionsMd,
  generateConventionsQuickRefMd,
} from "./generate-conventions";
import { generateStylingMd } from "./generate-styling";
import { generateSchemaMd } from "./generate-schema";
import {
  generateFeaturesIndexMd,
  generateFeatureMd,
} from "./generate-features";
import {
  generateTasksMasterMd,
  generateTaskMd,
} from "./generate-tasks";
import { generateContextStartersMd } from "./generate-context-starters";
import {
  generateClaudeMd,
  generateCursorRules,
  generateCopilotInstructions,
} from "./generate-ai-configs";

function wordCount(text: string): number {
  return text
    .replace(/[#|`\-*>_\[\]()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function taskSlug(task: Task): string {
  const num = `task-${String(task.taskNumber).padStart(3, "0")}`;
  const slug = task.name
    ? task.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : "";
  return `${num}${slug ? `-${slug}` : ""}`;
}

export function generateAll(state: ProjectState): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // PRIME.md (root) — tiny AI navigator, always read first
  const primeContent =
    state.markdownOverrides["PRIME.md"] ?? generatePrimeMd(state);
  files.push({
    path: "PRIME.md",
    filename: "PRIME.md",
    content: primeContent,
    wordCount: wordCount(primeContent),
    category: "root",
  });

  // PROJECT.md (root)
  const projectContent =
    state.markdownOverrides["PROJECT.md"] ?? generateProjectMd(state);
  files.push({
    path: "PROJECT.md",
    filename: "PROJECT.md",
    content: projectContent,
    wordCount: wordCount(projectContent),
    category: "root",
  });

  // docs/CONVENTIONS-QUICKREF.md — short critical rules for every session
  const quickRefContent =
    state.markdownOverrides["docs/CONVENTIONS-QUICKREF.md"] ??
    generateConventionsQuickRefMd(state);
  files.push({
    path: "docs/CONVENTIONS-QUICKREF.md",
    filename: "CONVENTIONS-QUICKREF.md",
    content: quickRefContent,
    wordCount: wordCount(quickRefContent),
    category: "docs",
  });

  // docs/CONVENTIONS.md
  const convContent =
    state.markdownOverrides["docs/CONVENTIONS.md"] ??
    generateConventionsMd(state);
  files.push({
    path: "docs/CONVENTIONS.md",
    filename: "CONVENTIONS.md",
    content: convContent,
    wordCount: wordCount(convContent),
    category: "docs",
  });

  // docs/ARCHITECTURE.md
  const archContent =
    state.markdownOverrides["docs/ARCHITECTURE.md"] ??
    generateArchitectureMd(state);
  files.push({
    path: "docs/ARCHITECTURE.md",
    filename: "ARCHITECTURE.md",
    content: archContent,
    wordCount: wordCount(archContent),
    category: "docs",
  });

  // docs/STYLING.md
  const styleContent =
    state.markdownOverrides["docs/STYLING.md"] ??
    generateStylingMd(state);
  files.push({
    path: "docs/STYLING.md",
    filename: "STYLING.md",
    content: styleContent,
    wordCount: wordCount(styleContent),
    category: "docs",
  });

  // docs/SCHEMA.md (if database not skipped)
  if (state.database.approach !== "skip") {
    const schemaContent =
      state.markdownOverrides["docs/SCHEMA.md"] ??
      generateSchemaMd(state);
    files.push({
      path: "docs/SCHEMA.md",
      filename: "SCHEMA.md",
      content: schemaContent,
      wordCount: wordCount(schemaContent),
      category: "docs",
    });
  }

  // features/FEATURES-INDEX.md
  const featIndexContent =
    state.markdownOverrides["features/FEATURES-INDEX.md"] ??
    generateFeaturesIndexMd(state);
  files.push({
    path: "features/FEATURES-INDEX.md",
    filename: "FEATURES-INDEX.md",
    content: featIndexContent,
    wordCount: wordCount(featIndexContent),
    category: "features",
  });

  // Individual feature files
  for (const feature of state.features) {
    const slug = feature.slug || "unnamed";
    const key = `features/${slug}.md`;
    const content =
      state.markdownOverrides[key] ?? generateFeatureMd(feature, state);
    files.push({
      path: key,
      filename: `${slug}.md`,
      content,
      wordCount: wordCount(content),
      category: "features",
    });
  }

  // tasks/TASKS-MASTER.md
  const tasksMasterContent =
    state.markdownOverrides["tasks/TASKS-MASTER.md"] ??
    generateTasksMasterMd(state);
  files.push({
    path: "tasks/TASKS-MASTER.md",
    filename: "TASKS-MASTER.md",
    content: tasksMasterContent,
    wordCount: wordCount(tasksMasterContent),
    category: "tasks",
  });

  // Individual task files
  for (const task of state.tasks) {
    const slug = taskSlug(task);
    const key = `tasks/${slug}.md`;
    const content =
      state.markdownOverrides[key] ?? generateTaskMd(task, state);
    files.push({
      path: key,
      filename: `${slug}.md`,
      content,
      wordCount: wordCount(content),
      category: "tasks",
    });
  }

  // CONTEXT-WINDOW-STARTERS.md (root)
  const contextContent =
    state.markdownOverrides["CONTEXT-WINDOW-STARTERS.md"] ??
    generateContextStartersMd(state);
  files.push({
    path: "CONTEXT-WINDOW-STARTERS.md",
    filename: "CONTEXT-WINDOW-STARTERS.md",
    content: contextContent,
    wordCount: wordCount(contextContent),
    category: "root",
  });

  // AI tool config files
  const claudeMdContent =
    state.markdownOverrides["CLAUDE.md"] ?? generateClaudeMd(state);
  files.push({
    path: "CLAUDE.md",
    filename: "CLAUDE.md",
    content: claudeMdContent,
    wordCount: wordCount(claudeMdContent),
    category: "ai-configs",
  });

  const cursorRulesContent =
    state.markdownOverrides[".cursorrules"] ?? generateCursorRules(state);
  files.push({
    path: ".cursorrules",
    filename: ".cursorrules",
    content: cursorRulesContent,
    wordCount: wordCount(cursorRulesContent),
    category: "ai-configs",
  });

  const copilotContent =
    state.markdownOverrides[".github/copilot-instructions.md"] ??
    generateCopilotInstructions(state);
  files.push({
    path: ".github/copilot-instructions.md",
    filename: "copilot-instructions.md",
    content: copilotContent,
    wordCount: wordCount(copilotContent),
    category: "ai-configs",
  });

  return files;
}
