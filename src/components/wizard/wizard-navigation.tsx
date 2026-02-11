"use client";

import { useProject } from "@/contexts/project-context";
import { WIZARD_STEPS } from "@/types/wizard";
import { Button } from "@/components/ui/button";

export function WizardNavigation() {
  const { state, goToStep, nextStep, prevStep } = useProject();
  const currentStep = state.meta.currentStep;

  // Check if database step is applicable
  const isDatabaseStepApplicable =
    state.architecture.layers.some(
      (layer) => layer.id === "database" && layer.enabled
    );

  const currentStepData = WIZARD_STEPS.find((s) => s.number === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 9;

  const handleNext = () => {
    // If moving from step 4 and database isn't enabled, skip to step 6
    if (currentStep === 4 && !isDatabaseStepApplicable) {
      goToStep(6);
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    // If moving back from step 6 and database isn't enabled, skip back to step 4
    if (currentStep === 6 && !isDatabaseStepApplicable) {
      goToStep(4);
    } else {
      prevStep();
    }
  };

  const handleSkip = () => {
    // Only available on optional steps
    if (currentStepData?.isOptional) {
      nextStep();
    }
  };

  // Determine button text
  let nextButtonText = "Next";
  if (currentStep === 7) {
    nextButtonText = "Review & Export";
  } else if (currentStep === 8) {
    nextButtonText = "Deployment Guide";
  }

  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={isFirstStep}
        className="min-w-24"
      >
        Back
      </Button>

      <div className="flex gap-3">
        {currentStepData?.isOptional && (
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
        )}
        {!isLastStep && (
          <Button onClick={handleNext} className="min-w-24">
            {nextButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
