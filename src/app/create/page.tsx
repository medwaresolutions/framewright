"use client";

import { ProjectProvider } from "@/contexts/project-context";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function CreatePage() {
  return (
    <ErrorBoundary>
      <ProjectProvider>
        <WizardShell />
      </ProjectProvider>
    </ErrorBoundary>
  );
}
