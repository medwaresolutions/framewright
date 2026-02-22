import type { ProjectState } from "@/types/project";
import { getAllConventionQuestions } from "@/data/conventions";

/** Short quick-reference file — the critical rules in one glance */
export function generateConventionsQuickRefMd(state: ProjectState): string {
  const { conventions } = state;
  const allQuestions = getAllConventionQuestions();

  const quickRules = conventions.decisions
    .map((decision) => {
      const question = allQuestions.find((q) => q.id === decision.questionId);
      if (!question) return null;
      const selectedOption = question.options.find(
        (o) => o.id === decision.selectedOptionId
      );
      if (!selectedOption) return null;
      const firstLine =
        selectedOption.generatedText
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l.length > 0) ?? selectedOption.label;
      const cleaned = firstLine
        .replace(/^#+\s*/, "")
        .replace(/\*\*/g, "")
        .trim();
      return `- **${question.category}:** ${cleaned}`;
    })
    .filter(Boolean) as string[];

  const sections: string[] = [
    "# Conventions — Quick Reference",
    "",
    "> The most critical rules for this project. Read this at the start of every session.",
    "> For full detail, see `CONVENTIONS.md`.",
    "",
    "---",
    "",
    ...(quickRules.length > 0 ? quickRules : ["_No conventions configured._"]),
    "",
  ];

  if (conventions.customConventions.trim()) {
    const customFirstLines = conventions.customConventions
      .trim()
      .split("\n")
      .filter((l) => l.trim())
      .slice(0, 5)
      .map((l) => `- ${l.replace(/^[-•*]\s*/, "").trim()}`);
    sections.push("**Additional:**", "", ...customFirstLines, "");
  }

  sections.push(
    "",
    "*Full detail: [CONVENTIONS.md](CONVENTIONS.md) · Project: [PROJECT.md](../PROJECT.md)*",
    ""
  );

  return sections.join("\n");
}

export function generateConventionsMd(state: ProjectState): string {
  const { conventions } = state;
  const allQuestions = getAllConventionQuestions();

  const resolvedDecisions = conventions.decisions
    .map((decision) => {
      const question = allQuestions.find((q) => q.id === decision.questionId);
      if (!question) return null;

      const selectedOption = question.options.find(
        (o) => o.id === decision.selectedOptionId
      );
      if (!selectedOption) return null;

      return {
        category: question.category,
        question: question.question,
        generatedText: selectedOption.generatedText,
        label: selectedOption.label,
      };
    })
    .filter(Boolean) as {
    category: string;
    question: string;
    generatedText: string;
    label: string;
  }[];

  // Group by category
  const grouped: Record<string, typeof resolvedDecisions> = {};
  for (const d of resolvedDecisions) {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  }

  const categorySections = Object.entries(grouped).map(
    ([category, decisions]) => {
      const rules = decisions.map((d) => d.generatedText).join("\n\n");
      return `## ${category}\n\n${rules}`;
    }
  );

  const sections: string[] = [
    `# Conventions`,
    "",
    "> These conventions must be followed in all code written for this project.",
    "> Read this file at the start of every coding session.",
    "",
    "---",
    "",
    ...(categorySections.length > 0
      ? categorySections.flatMap((s) => [s, "", "---", ""])
      : ["_No conventions configured._", ""]),
  ];

  if (conventions.customConventions.trim()) {
    sections.push("## Additional Conventions", "");
    sections.push(conventions.customConventions.trim(), "");
  }

  sections.push(
    "",
    "*See [PROJECT.md](../PROJECT.md) for project overview.*",
    ""
  );

  return sections.join("\n");
}
