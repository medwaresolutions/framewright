"use client";

import { useProject } from "@/contexts/project-context";
import { getConventionsForStack } from "@/data/conventions";
import { getSmartDefaults } from "@/data/smart-defaults";
import type { ConventionQuestion, ConventionOption } from "@/types/conventions";
import type { ConventionDecision } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useCallback } from "react";

export function StepConventions() {
  const { state, dispatch } = useProject();
  const frameworkId = state.identity.techStack.framework;
  const decisions = state.conventions.decisions;

  const questions = useMemo(
    () => getConventionsForStack(frameworkId || "nextjs"),
    [frameworkId]
  );

  const smartDefaults = useMemo(
    () => getSmartDefaults(state.identity.techStack),
    [state.identity.techStack]
  );

  const getSelectedOption = useCallback(
    (questionId: string): string | null => {
      const decision = decisions.find((d) => d.questionId === questionId);
      return decision?.selectedOptionId ?? null;
    },
    [decisions]
  );

  const selectOption = (questionId: string, optionId: string) => {
    const existing = decisions.filter((d) => d.questionId !== questionId);
    const updated: ConventionDecision[] = [
      ...existing,
      { questionId, selectedOptionId: optionId, customAnswer: null },
    ];
    dispatch({ type: "SET_CONVENTIONS", payload: { decisions: updated } });
  };

  const applyRecommended = () => {
    const recommended = questions
      .map((q) => {
        // Check smart defaults first
        const smartDefault = smartDefaults.conventionRecommendations[q.id];
        if (smartDefault) {
          return {
            questionId: q.id,
            selectedOptionId: smartDefault,
            customAnswer: null,
          } as ConventionDecision;
        }
        // Fall back to isRecommended option
        const rec = q.options.find((o) => o.isRecommended);
        if (rec) {
          return {
            questionId: q.id,
            selectedOptionId: rec.id,
            customAnswer: null,
          } as ConventionDecision;
        }
        return null;
      })
      .filter((d): d is ConventionDecision => d !== null);

    dispatch({ type: "SET_CONVENTIONS", payload: { decisions: recommended } });
  };

  // Group questions by category
  const grouped = useMemo(() => {
    const groups: Record<string, ConventionQuestion[]> = {};
    for (const q of questions) {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    }
    return groups;
  }, [questions]);

  const answeredCount = questions.filter(
    (q) => getSelectedOption(q.id) !== null
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Conventions
          </h2>
          <p className="mt-1 text-muted-foreground">
            Choose the coding patterns your project will follow. These become
            rules in your CONVENTIONS.md file.
          </p>
        </div>
        <Badge variant="secondary">
          {answeredCount}/{questions.length}
        </Badge>
      </div>

      {questions.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={applyRecommended}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Apply Recommended Defaults
        </Button>
      )}

      {Object.entries(grouped).map(([category, categoryQuestions]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-medium">{category}</h3>
          {categoryQuestions.map((question) => (
            <ConventionCard
              key={question.id}
              question={question}
              selectedOptionId={getSelectedOption(question.id)}
              onSelect={(optionId) => selectOption(question.id, optionId)}
            />
          ))}
        </div>
      ))}

      {questions.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          Select a framework in Step 1 to see relevant convention questions.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="custom-conventions">
          Additional Custom Conventions
        </Label>
        <Textarea
          id="custom-conventions"
          placeholder="Add any other conventions or rules not covered above..."
          value={state.conventions.customConventions}
          onChange={(e) =>
            dispatch({
              type: "SET_CONVENTIONS",
              payload: { customConventions: e.target.value },
            })
          }
          rows={4}
        />
      </div>
    </div>
  );
}

function ConventionCard({
  question,
  selectedOptionId,
  onSelect,
}: {
  question: ConventionQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="font-medium">{question.question}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {question.description}
            </p>
          </div>
          {question.isRequired && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Required
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "w-full text-left rounded-md border p-3 transition-colors",
                selectedOptionId === option.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{option.label}</span>
                {option.isRecommended && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-xs"
                  >
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
