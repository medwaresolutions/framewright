import type { ProjectState } from "@/types/project";
import { getTechLabel } from "@/data/tech-stacks";

export function generateStylingMd(state: ProjectState): string {
  const { styling, identity } = state;

  const colorRows = styling.colors
    .filter((c) => c.hex)
    .map((c) => `| ${c.name} | \`${c.hex}\` |`);

  const fontLines: string[] = [];
  if (styling.fonts.heading)
    fontLines.push(`- **Headings:** ${styling.fonts.heading}`);
  if (styling.fonts.body)
    fontLines.push(`- **Body:** ${styling.fonts.body}`);
  if (styling.fonts.mono)
    fontLines.push(`- **Monospace:** ${styling.fonts.mono}`);

  const compLib = styling.componentLibrary
    ? getTechLabel("componentLibrary", styling.componentLibrary)
    : null;

  const sections: string[] = [
    `# Styling Guide — ${identity.name || "Project"}`,
    "",
    "---",
    "",
    "## Brand Colors",
    "",
    ...(colorRows.length > 0
      ? ["| Name | Hex |", "|------|-----|", ...colorRows]
      : ["_No colors defined._"]),
    "",
    "## Typography",
    "",
    ...(fontLines.length > 0 ? fontLines : ["_No fonts specified._"]),
    "",
    "## Component Library",
    "",
    compLib || "_None selected._",
    "",
  ];

  if (styling.additionalNotes.trim()) {
    sections.push("## Additional Styling Notes", "");
    sections.push(styling.additionalNotes.trim(), "");
  }

  sections.push(
    "",
    "---",
    "",
    "*See [PROJECT.md](../PROJECT.md) for project overview.*",
    ""
  );

  return sections.join("\n");
}
