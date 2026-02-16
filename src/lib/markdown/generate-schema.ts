import type { ProjectState } from "@/types/project";

export function generateSchemaMd(state: ProjectState): string {
  const { database, identity } = state;

  if (database.approach === "skip") {
    return [
      `# Database Schema — ${identity.name || "Project"}`,
      "",
      "_Database schema has been skipped. Define it later when ready._",
      "",
    ].join("\n");
  }

  const sections: string[] = [
    `# Database Schema — ${identity.name || "Project"}`,
    "",
    "---",
    "",
  ];

  if (database.approach === "plain-english" && database.plainEnglishDescription.trim()) {
    sections.push("## Description", "");
    sections.push(database.plainEnglishDescription.trim(), "");
    sections.push("");
  }

  if (database.approach === "paste-sql" && database.pastedSchema.trim()) {
    sections.push("## SQL Schema", "");
    sections.push("```sql");
    sections.push(database.pastedSchema.trim());
    sections.push("```", "");
  }

  // Include existing project schema if provided
  if (identity.existingSchema?.trim()) {
    sections.push("## Existing Schema (Imported)", "");
    sections.push("```sql");
    sections.push(identity.existingSchema.trim());
    sections.push("```", "");
  }

  if (database.tables.length > 0) {
    sections.push("## Tables", "");

    for (const table of database.tables) {
      sections.push(`### ${table.name || "Unnamed Table"}`);
      sections.push("");
      if (table.description) {
        sections.push(table.description);
        sections.push("");
      }
      if (table.columns) {
        sections.push("**Columns:**");
        sections.push("");
        sections.push(table.columns);
        sections.push("");
      }
    }
  }

  sections.push(
    "---",
    "",
    "*See [PROJECT.md](../PROJECT.md) for project overview.*",
    ""
  );

  return sections.join("\n");
}
