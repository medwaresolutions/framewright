import type { ProjectState, Task } from "@/types/project";

function formatTaskNumber(n: number): string {
  return `task-${String(n).padStart(3, "0")}`;
}

function taskSlug(task: Task): string {
  const slug = task.name
    ? task.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : "";
  return `${formatTaskNumber(task.taskNumber)}${slug ? `-${slug}` : ""}`;
}

export function generateTasksMasterMd(state: ProjectState): string {
  const { tasks, features } = state;

  const taskRows = tasks.map((task) => {
    const linkedFeatures = features
      .filter((f) => task.featureIds.includes(f.id))
      .map((f) => f.name || "Unnamed");
    const featureStr = linkedFeatures.join(", ") || "—";

    return `| [${formatTaskNumber(task.taskNumber)}](${taskSlug(task)}.md) | ${task.name || "Unnamed"} | ${featureStr} |`;
  });

  const sections: string[] = [
    "# Tasks Master",
    "",
    `> ${tasks.length} task${tasks.length !== 1 ? "s" : ""} defined.`,
    "",
    "---",
    "",
    ...(taskRows.length > 0
      ? [
          "| ID | Name | Feature(s) |",
          "|----|------|-----------|",
          ...taskRows,
        ]
      : ["_No tasks defined._"]),
    "",
    "---",
    "",
    "*See [PROJECT.md](../PROJECT.md) for project overview.*",
    "",
  ];

  return sections.join("\n");
}

export function generateTaskMd(task: Task, state: ProjectState): string {
  const linkedFeatures = state.features.filter((f) =>
    task.featureIds.includes(f.id)
  );

  const featureLinks = linkedFeatures.map(
    (f) => `- [${f.name || "Unnamed"}](../features/${f.slug || "unnamed"}.md)`
  );

  const sections: string[] = [
    `# ${formatTaskNumber(task.taskNumber)}: ${task.name || "Unnamed Task"}`,
    "",
    "---",
    "",
    "## Related Features",
    "",
    ...(featureLinks.length > 0
      ? featureLinks
      : ["_Not linked to any feature._"]),
    "",
    "## Definition of Done",
    "",
    task.definitionOfDone.trim() || "_Not specified._",
    "",
    "## File Boundaries",
    "",
    task.fileBoundaries.trim() || "_Not specified._",
    "",
    "---",
    "",
    "*See [Tasks Master](TASKS-MASTER.md) | [PROJECT.md](../PROJECT.md)*",
    "",
  ];

  return sections.join("\n");
}
