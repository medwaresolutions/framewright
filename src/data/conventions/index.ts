import type { ConventionQuestion } from "@/types/conventions";
import { generalConventions } from "./general";
import { nextjsConventions } from "./nextjs";
import { pythonFastapiConventions } from "./python-fastapi";

const conventionsByFramework: Record<string, ConventionQuestion[]> = {
  nextjs: nextjsConventions,
  "react-vite": nextjsConventions.filter((q) =>
    q.applicableTo.includes("react-vite")
  ),
  "python-fastapi": pythonFastapiConventions,
  "python-django": pythonFastapiConventions.filter((q) =>
    q.applicableTo.includes("python-django")
  ),
  express: [
    ...nextjsConventions.filter((q) => q.applicableTo.includes("express")),
    ...pythonFastapiConventions.filter((q) =>
      q.applicableTo.includes("express")
    ),
  ],
};

export function getConventionsForStack(
  frameworkId: string
): ConventionQuestion[] {
  const stackSpecific = conventionsByFramework[frameworkId] ?? [];
  const general = generalConventions.filter((q) =>
    q.applicableTo.includes(frameworkId)
  );

  // Deduplicate by id (stack-specific takes priority)
  const seenIds = new Set(stackSpecific.map((q) => q.id));
  const filteredGeneral = general.filter((q) => !seenIds.has(q.id));

  return [...stackSpecific, ...filteredGeneral];
}

export function getAllConventionQuestions(): ConventionQuestion[] {
  const all = [
    ...nextjsConventions,
    ...pythonFastapiConventions,
    ...generalConventions,
  ];

  // Deduplicate
  const seen = new Set<string>();
  return all.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}
