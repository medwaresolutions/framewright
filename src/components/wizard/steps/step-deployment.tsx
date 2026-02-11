"use client";

import { useProject } from "@/contexts/project-context";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { generateSkeletonPrompt } from "@/lib/prompts";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Copy, Rocket, CheckSquare } from "lucide-react";
import { useMemo } from "react";

const CHECKLIST_ITEMS = [
  "Project builds and runs without errors",
  "All configuration files match your tech stack",
  "Folder structure matches architecture layers",
  "Basic page/route renders correctly",
  "Database connection is working (if applicable)",
  "Authentication scaffolding is in place (if applicable)",
  "Environment variables are documented",
  "Git repository is initialized with .gitignore",
];

export function StepDeployment() {
  const { state, dispatch } = useProject();
  const { copy } = useCopyToClipboard();
  const { enabled, skeletonStructure, notes } = state.deployment;

  const skeletonPrompt = useMemo(
    () => generateSkeletonPrompt(state),
    [state]
  );

  const handleToggle = (checked: boolean) => {
    dispatch({ type: "SET_DEPLOYMENT", payload: { enabled: checked } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Deployment Guide
          </h2>
          <p className="mt-1 text-muted-foreground">
            Generate a skeleton file structure prompt and pre-flight checklist
            for your first AI coding session.
          </p>
        </div>
        <Badge variant="outline">Optional</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="enable-deployment"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor="enable-deployment" className="font-medium">
          Include deployment guide in export
        </Label>
      </div>

      {enabled && (
        <div className="space-y-6">
          {/* Skeleton Prompt */}
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Skeleton Deployment Prompt</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(skeletonPrompt, "Skeleton prompt")}
                  className="gap-1.5"
                >
                  <Copy className="h-3 w-3" />
                  Copy Prompt
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy this prompt and paste it into your AI tool to generate
                your project&apos;s initial file structure.
              </p>
              <pre className="rounded-md bg-muted p-4 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-[300px]">
                {skeletonPrompt}
              </pre>
            </CardContent>
          </Card>

          {/* Custom skeleton structure notes */}
          <div className="space-y-2">
            <Label htmlFor="skeleton-notes">
              Custom Skeleton Structure (optional)
            </Label>
            <Textarea
              id="skeleton-notes"
              placeholder="If you have a specific folder structure in mind, describe it here. This will be included in the deployment guide..."
              value={skeletonStructure}
              onChange={(e) =>
                dispatch({
                  type: "SET_DEPLOYMENT",
                  payload: { skeletonStructure: e.target.value },
                })
              }
              rows={4}
            />
          </div>

          {/* Pre-flight Checklist */}
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">Pre-flight Checklist</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Verify these items before starting feature work:
              </p>
              <ul className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-muted-foreground/60 mt-0.5">
                      &#9744;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Additional notes */}
          <div className="space-y-2">
            <Label htmlFor="deployment-notes">Additional Notes</Label>
            <Textarea
              id="deployment-notes"
              placeholder="Any additional deployment notes or requirements..."
              value={notes}
              onChange={(e) =>
                dispatch({
                  type: "SET_DEPLOYMENT",
                  payload: { notes: e.target.value },
                })
              }
              rows={3}
            />
          </div>
        </div>
      )}

      {!enabled && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          <p>
            Enable the deployment guide to get a skeleton prompt and
            pre-flight checklist.
          </p>
          <p className="text-sm mt-2">
            This step is optional — you can skip it and start coding right
            away.
          </p>
        </div>
      )}
    </div>
  );
}
