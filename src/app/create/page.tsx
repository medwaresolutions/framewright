"use client";

import { ProjectProvider } from "@/contexts/project-context";
import { ChatProvider } from "@/contexts/chat-context";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function CreatePage() {
  return (
    <ErrorBoundary>
      <ProjectProvider>
        <ChatProvider>
          <WizardShell />
          <ChatWidget />
        </ChatProvider>
      </ProjectProvider>
    </ErrorBoundary>
  );
}
