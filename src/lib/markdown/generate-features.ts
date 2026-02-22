import type { ProjectState, Feature, Task } from "@/types/project";

function formatTaskNumber(n: number): string {
  return `task-${String(n).padStart(3, "0")}`;
}

function taskSlug(task: Task): string {
  const slug = task.name
    ? task.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : "";
  return `${formatTaskNumber(task.taskNumber)}${slug ? `-${slug}` : ""}`;
}

export function generateFeaturesIndexMd(state: ProjectState): string {
  const { features, tasks } = state;

  const featureRows = features.map((f) => {
    const taskCount = tasks.filter((t) => t.featureIds.includes(f.id)).length;
    return `| [${f.name || "Unnamed"}](${f.slug || "unnamed"}.md) | ${f.description || "—"} | ${taskCount} |`;
  });

  const sections: string[] = [
    "# Features Index",
    "",
    `> ${features.length} feature${features.length !== 1 ? "s" : ""} defined.`,
    "",
    "---",
    "",
    ...(featureRows.length > 0
      ? [
          "| Feature | Description | Tasks |",
          "|---------|-------------|-------|",
          ...featureRows,
        ]
      : ["_No features defined._"]),
    "",
    "---",
    "",
    "*See [PROJECT.md](../PROJECT.md) for project overview.*",
    "",
  ];

  return sections.join("\n");
}

export function generateFeatureMd(
  feature: Feature,
  state: ProjectState
): string {
  const relatedTasks = state.tasks.filter((t) =>
    t.featureIds.includes(feature.id)
  );

  const rulesLines = feature.businessRules
    .filter((r) => r.trim())
    .map((r) => `- ${r}`);

  const criteriaLines = (feature.acceptanceCriteria ?? [])
    .filter((c) => c.trim())
    .map((c) => `- ${c}`);

  const tableLines = feature.relatedTables.map((t) => `- ${t}`);

  const taskLines = relatedTasks.map(
    (t) =>
      `- [${formatTaskNumber(t.taskNumber)}: ${t.name || "Unnamed"}](../tasks/${taskSlug(t)}.md)`
  );

  const sections: string[] = [
    `# Feature: ${feature.name || "Unnamed Feature"}`,
    "",
    feature.description || "_No description._",
    "",
    "---",
    "",
    "## Acceptance Criteria",
    "",
    "> What does success look like from the user's perspective?",
    "",
    ...(criteriaLines.length > 0
      ? criteriaLines
      : ["_No acceptance criteria defined._"]),
    "",
    "## Business Rules",
    "",
    "> Technical constraints and system requirements.",
    "",
    ...(rulesLines.length > 0 ? rulesLines : ["_No business rules defined._"]),
    "",
    "## Related Tables",
    "",
    ...(tableLines.length > 0 ? tableLines : ["_No related tables._"]),
    "",
    "## Related Tasks",
    "",
    ...(taskLines.length > 0
      ? taskLines
      : ["_No tasks linked to this feature._"]),
    "",
    "---",
    "",
    "*See [Features Index](FEATURES-INDEX.md) | [PROJECT.md](../PROJECT.md)*",
    "",
  ];

  return sections.join("\n");
}
