"use client";

import { useMemo } from "react";
import { useProject } from "@/contexts/project-context";
import { WIZARD_STEPS } from "@/types/wizard";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const VISIBLE_COUNT = 4;

export function WizardProgress() {
  const { state, goToStep } = useProject();
  const currentStep = state.meta.currentStep;

  // Filter out conditional steps that aren't applicable
  const applicableSteps = WIZARD_STEPS.filter((step) => {
    if (!step.isConditional) return true;
    if (step.number === 5) {
      return state.architecture.layers.some(
        (layer) => layer.id === "database" && layer.enabled
      );
    }
    return true;
  });

  const currentIndex = applicableSteps.findIndex(
    (s) => s.number === currentStep
  );

  // Calculate the visible window — center the current step within 4 slots
  const windowStart = useMemo(() => {
    const total = applicableSteps.length;
    if (total <= VISIBLE_COUNT) return 0;

    // Try to center the current step
    let start = currentIndex - Math.floor(VISIBLE_COUNT / 2);
    // Clamp to valid range
    start = Math.max(0, Math.min(start, total - VISIBLE_COUNT));
    return start;
  }, [currentIndex, applicableSteps.length]);

  const visibleSteps = applicableSteps.slice(
    windowStart,
    windowStart + VISIBLE_COUNT
  );

  const canScrollLeft = windowStart > 0;
  const canScrollRight =
    windowStart + VISIBLE_COUNT < applicableSteps.length;

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= currentStep) {
      goToStep(stepNumber);
    }
  };

  // Navigate to the step just before / after the visible window
  const handleScrollLeft = () => {
    const targetStep = applicableSteps[windowStart - 1];
    if (targetStep && targetStep.number <= currentStep) {
      goToStep(targetStep.number);
    }
  };

  const handleScrollRight = () => {
    const targetStep = applicableSteps[windowStart + VISIBLE_COUNT];
    if (targetStep && targetStep.number <= currentStep) {
      goToStep(targetStep.number);
    }
  };

  return (
    <div>
      {/* Desktop view */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <div className="flex items-center gap-2">
            {/* Left arrow */}
            <button
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                canScrollLeft
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-transparent cursor-default"
              )}
              aria-label="Previous steps"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Steps */}
            <ol className="flex flex-1 items-center">
              {visibleSteps.map((step, index) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;
                const isClickable = step.number <= currentStep;
                const isLastVisible = index === visibleSteps.length - 1;

                return (
                  <li
                    key={step.number}
                    className={cn("relative flex-1", !isLastVisible && "pr-4")}
                  >
                    {/* Connecting line */}
                    {!isLastVisible && (
                      <div
                        className="absolute left-0 top-4 h-0.5 w-full pr-4"
                        aria-hidden="true"
                      >
                        <div
                          className={cn(
                            "h-full w-full",
                            isCompleted ? "bg-primary" : "bg-border"
                          )}
                        />
                      </div>
                    )}

                    {/* Step button */}
                    <button
                      onClick={() => handleStepClick(step.number)}
                      disabled={!isClickable}
                      className={cn(
                        "group relative flex flex-col items-center text-center w-full",
                        isClickable && "cursor-pointer",
                        !isClickable && "cursor-not-allowed"
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                          isCompleted &&
                            "border-primary bg-primary text-primary-foreground",
                          isCurrent &&
                            "border-primary bg-background text-primary",
                          !isCompleted &&
                            !isCurrent &&
                            "border-border bg-background text-muted-foreground group-hover:border-primary/50"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">
                            {step.number}
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "mt-1.5 text-xs font-medium transition-colors leading-tight",
                          isCurrent && "text-foreground",
                          isCompleted && "text-foreground",
                          !isCompleted &&
                            !isCurrent &&
                            "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      {step.isOptional && (
                        <span className="text-[10px] text-muted-foreground">
                          Optional
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Right arrow */}
            <button
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                canScrollRight
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-transparent cursor-default"
              )}
              aria-label="Next steps"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {currentIndex + 1} of {applicableSteps.length}
          </span>
          <span>
            {Math.round((currentIndex / (applicableSteps.length - 1)) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${(currentIndex / (applicableSteps.length - 1)) * 100}%`,
            }}
          />
        </div>
        <div className="text-lg font-semibold">
          {applicableSteps[currentIndex]?.title}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {applicableSteps[currentIndex]?.description}
        </div>
      </div>
    </div>
  );
}
