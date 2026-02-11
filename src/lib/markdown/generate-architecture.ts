import type { ProjectState } from "@/types/project";
import { APP_TYPES } from "@/lib/constants";
import { getTechLabel } from "@/data/tech-stacks";

export function generateArchitectureMd(state: ProjectState): string {
  const { architecture, identity } = state;
  const ts = identity.techStack;

  const appTypeLabel =
    APP_TYPES.find((t) => t.id === architecture.appType)?.label ??
    architecture.appType;

  const enabledLayers = architecture.layers.filter((l) => l.enabled);

  const layerSections = enabledLayers.map((layer) => {
    const parts = [`### ${layer.name}`];
    if (layer.technologies.length > 0) {
      parts.push("");
      parts.push(`**Technologies:** ${layer.technologies.join(", ")}`);
    }
    if (layer.notes) {
      parts.push("");
      parts.push(layer.notes);
    }
    return parts.join("\n");
  });

  const sections: string[] = [
    `# Architecture — ${identity.name || "Project"}`,
    "",
    "---",
    "",
    "## Application Type",
    "",
    appTypeLabel || "_Not specified_",
    "",
    "## Tech Stack Overview",
    "",
    ...[
      ts.framework &&
        `- **Framework:** ${getTechLabel("framework", ts.framework)}`,
      ts.styling &&
        `- **Styling:** ${getTechLabel("styling", ts.styling)}`,
      ts.database &&
        `- **Database:** ${getTechLabel("database", ts.database)}`,
      ts.auth && `- **Auth:** ${getTechLabel("auth", ts.auth)}`,
      ts.deployment &&
        `- **Deployment:** ${getTechLabel("deployment", ts.deployment)}`,
      ts.componentLibrary &&
        `- **Components:** ${getTechLabel("componentLibrary", ts.componentLibrary)}`,
    ].filter(Boolean) as string[],
    "",
    "## Architecture Layers",
    "",
    ...(layerSections.length > 0
      ? layerSections.flatMap((s) => [s, ""])
      : ["_No layers defined._", ""]),
    "---",
    "",
    "*See [PROJECT.md](../PROJECT.md) for project overview.*",
    "",
  ];

  return sections.join("\n");
}
