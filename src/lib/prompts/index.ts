import type { ProjectState } from "@/types/project";
import { getTechLabel } from "@/data/tech-stacks";
import { getAllConventionQuestions } from "@/data/conventions";

function techStackSummary(state: ProjectState): string {
  const ts = state.identity.techStack;
  const parts: string[] = [];
  if (ts.framework) parts.push(getTechLabel("framework", ts.framework));
  if (ts.styling) parts.push(getTechLabel("styling", ts.styling));
  if (ts.database) parts.push(getTechLabel("database", ts.database));
  if (ts.auth) parts.push(getTechLabel("auth", ts.auth));
  if (ts.componentLibrary)
    parts.push(getTechLabel("componentLibrary", ts.componentLibrary));
  return parts.join(", ");
}

function conventionSummary(state: ProjectState): string {
  const allQuestions = getAllConventionQuestions();
  return state.conventions.decisions
    .map((d) => {
      const q = allQuestions.find((q) => q.id === d.questionId);
      const opt = q?.options.find((o) => o.id === d.selectedOptionId);
      if (!q || !opt) return null;
      return `- ${q.question}: ${opt.label}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function generateConventionsPrompt(state: ProjectState): string {
  const convChoices = conventionSummary(state);

  return `I'm setting up a project framework for AI-assisted development.

Project: ${state.identity.name || "My Project"}
Tech Stack: ${techStackSummary(state)}
Architecture: ${state.architecture.appType || "Web application"} with ${state.architecture.layers.filter((l) => l.enabled).map((l) => l.name.toLowerCase()).join(", ")}

I need you to write a CONVENTIONS.md file covering code patterns and standards for this project. Format it as markdown with clear sections. Keep it under 1500 words.

${convChoices ? `I've already made these convention decisions:\n${convChoices}\n\nExpand on these choices and` : ""}Cover:
- Component organization
- Data fetching patterns
- Error handling
- Naming conventions for files, components, database tables, API routes
- Any other conventions relevant to this specific tech stack

The audience is an AI assistant that will read this file at the start of every coding session. Write it so that an AI can follow these conventions without ambiguity.`;
}

export function generateSchemaPrompt(state: ProjectState): string {
  const tableDescriptions = state.database.tables
    .filter((t) => t.name)
    .map((t) => {
      let desc = `- ${t.name}`;
      if (t.description) desc += `: ${t.description}`;
      if (t.columns) desc += `\n  Columns: ${t.columns}`;
      return desc;
    })
    .join("\n");

  return `I'm setting up a project framework for AI-assisted development.

Project: ${state.identity.name || "My Project"}
Tech Stack: ${techStackSummary(state)}

${state.database.plainEnglishDescription ? `Here's what I need the database to do:\n${state.database.plainEnglishDescription}\n` : ""}${tableDescriptions ? `\nI've sketched out these tables:\n${tableDescriptions}\n` : ""}
Please write a SCHEMA.md file containing:
1. A complete database schema with all tables, columns, types, and relationships
2. Any indexes or constraints that would be important
3. Notes on any RLS (Row Level Security) policies if applicable

Format as markdown. Use SQL code blocks for the actual schema definitions. Include explanatory notes for complex relationships.`;
}

export function generateSkeletonPrompt(state: ProjectState): string {
  const layers = state.architecture.layers
    .filter((l) => l.enabled)
    .map((l) => `- ${l.name}${l.notes ? `: ${l.notes}` : ""}`)
    .join("\n");

  const featureList = state.features
    .map((f) => `- ${f.name}: ${f.description || "No description"}`)
    .join("\n");

  return `I'm setting up a new project and need you to create the initial file/folder structure (skeleton deployment).

Project: ${state.identity.name || "My Project"}
Tech Stack: ${techStackSummary(state)}
App Type: ${state.architecture.appType || "web-app"}

Architecture layers:
${layers || "- Standard web application layers"}

Features planned:
${featureList || "- No features defined yet"}

Please create:
1. The complete folder structure with placeholder files
2. Configuration files (package.json, tsconfig, etc.) appropriate for the tech stack
3. A basic layout/shell that the feature work can build upon
4. Any authentication scaffolding if auth was selected
5. Database connection setup if applicable

Do NOT implement any features — just create the skeleton that features will be built into. Each file should have a clear comment indicating what will go there.

After creating the skeleton, verify:
- [ ] The project builds and runs without errors
- [ ] All configuration files are correct
- [ ] The folder structure matches the architecture layers
- [ ] A basic "hello world" page renders`;
}

export function generateFeaturePrompt(
  state: ProjectState,
  featureId: string
): string {
  const feature = state.features.find((f) => f.id === featureId);
  if (!feature) return "";

  const relatedTasks = state.tasks
    .filter((t) => t.featureIds.includes(featureId))
    .map(
      (t) =>
        `- ${t.name}${t.definitionOfDone ? `\n  Done when: ${t.definitionOfDone}` : ""}`
    )
    .join("\n");

  const rules = feature.businessRules
    .filter((r) => r.trim())
    .map((r) => `- ${r}`)
    .join("\n");

  return `Read PROJECT.md, then read docs/CONVENTIONS.md.

I'm implementing the "${feature.name}" feature.

Description: ${feature.description || "No description provided."}

${rules ? `Business Rules:\n${rules}\n` : ""}${feature.relatedTables.length > 0 ? `Related Tables: ${feature.relatedTables.join(", ")}\n` : ""}
${relatedTasks ? `Tasks for this feature:\n${relatedTasks}\n` : ""}
Please implement this feature following all conventions in CONVENTIONS.md. After completion, review your work against each business rule listed above.`;
}
