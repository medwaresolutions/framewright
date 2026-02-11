"use client";

import { useMemo } from "react";
import { useProject } from "@/contexts/project-context";
import { WIZARD_STEPS } from "@/types/wizard";
import { WizardProgress } from "./wizard-progress";
import { WizardNavigation } from "./wizard-navigation";
import { ExportBanner } from "./export-banner";
import { StepProjectIdentity } from "./steps/step-project-identity";
import { StepArchitecture } from "./steps/step-architecture";
import { StepStyling } from "./steps/step-styling";
import { StepConventions } from "./steps/step-conventions";
import { StepDatabase } from "./steps/step-database";
import { StepFeatures } from "./steps/step-features";
import { StepTasks } from "./steps/step-tasks";
import { StepReview } from "./steps/step-review";
import { StepDeployment } from "./steps/step-deployment";

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: StepProjectIdentity,
  2: StepArchitecture,
  3: StepStyling,
  4: StepConventions,
  5: StepDatabase,
  6: StepFeatures,
  7: StepTasks,
  8: StepReview,
  9: StepDeployment,
};

export function WizardShell() {
  const { state } = useProject();
  const currentStep = state.meta.currentStep;

  // Check if step 5 (database) is applicable
  const isDatabaseStepApplicable =
    state.architecture.layers.some(
      (layer) => layer.id === "database" && layer.enabled
    );

  // If on step 5 but database isn't applicable, show step 6 instead
  const effectiveStep =
    currentStep === 5 && !isDatabaseStepApplicable ? 6 : currentStep;

  const CurrentStepComponent = STEP_COMPONENTS[effectiveStep];

  // Step 8 (Review) needs wider layout for file tree sidebar
  const isWideStep = effectiveStep === 8;

  // Show export banner if the user has reached step 8 before and navigated away
  const hasReachedReview = useMemo(
    () => state.meta.highestStepReached >= 8,
    [state.meta.highestStepReached]
  );
  const showExportBanner = hasReachedReview && effectiveStep !== 8;

  return (
    <div
      className={`mx-auto px-4 py-8 sm:px-6 ${isWideStep ? "max-w-5xl" : "max-w-3xl"}`}
    >
      <WizardProgress />
      {showExportBanner && <ExportBanner />}
      <div className="mt-8">
        {CurrentStepComponent ? <CurrentStepComponent /> : null}
      </div>
      <WizardNavigation />
    </div>
  );
}
