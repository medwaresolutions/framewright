import type { ProjectState } from "@/types/project";
import { getAllConventionQuestions } from "@/data/conventions";

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
