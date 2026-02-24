"use client";

import { useProject } from "@/contexts/project-context";
import { useChat } from "@/contexts/chat-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  frameworkOptions,
  stylingOptions,
  databaseOptions,
  authOptions,
  deploymentOptions,
  componentLibraryOptions,
} from "@/data/tech-stacks";

export function StepProjectIdentity() {
  const { state, dispatch } = useProject();
  const { identity } = state;
  const { setFocusedField } = useChat();

  // Generate slug from project name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    dispatch({
      type: "SET_IDENTITY",
      payload: { name: value, slug },
    });
  };

  // Update purpose
  const handlePurposeChange = (value: string) => {
    dispatch({
      type: "SET_IDENTITY",
      payload: { purpose: value },
    });
  };

  // Update individual tech stack selections
  const handleTechStackChange = (
    category: keyof typeof identity.techStack,
    value: string
  ) => {
    dispatch({
      type: "SET_IDENTITY",
      payload: {
        techStack: {
          ...identity.techStack,
          [category]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Project Identity
        </h2>
        <p className="mt-1 text-muted-foreground">
          Name your project and choose your tech stack
        </p>
      </div>

      {/* Project Mode Toggle */}
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Switch
          id="project-mode"
          checked={identity.projectMode === "existing"}
          onCheckedChange={(checked) =>
            dispatch({
              type: "SET_IDENTITY",
              payload: { projectMode: checked ? "existing" : "new" },
            })
          }
        />
        <Label htmlFor="project-mode" className="cursor-pointer">
          {identity.projectMode === "existing" ? "Existing Project" : "New Project"}
        </Label>
        <span className="text-sm text-muted-foreground">
          {identity.projectMode === "existing"
            ? "Import an existing project structure"
            : "Start from scratch"}
        </span>
      </div>

      {/* Project Name & Slug */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="e.g. My Awesome App"
            value={identity.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() =>
              setFocusedField({
                fieldId: "identity.name",
                fieldLabel: "Project Name",
                fieldDescription: "Short, memorable name for the project",
                step: 1,
              })
            }
            onBlur={() => setFocusedField(null)}
          />
          {identity.slug && (
            <p className="text-sm text-muted-foreground">
              Slug: <Badge variant="secondary">{identity.slug}</Badge>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-purpose">Project Purpose</Label>
          <Textarea
            id="project-purpose"
            placeholder="Describe what this project does and who it's for. Keep it concise (2-3 sentences)."
            value={identity.purpose}
            onChange={(e) => handlePurposeChange(e.target.value)}
            rows={4}
            className="resize-none"
            onFocus={() =>
              setFocusedField({
                fieldId: "identity.purpose",
                fieldLabel: "Project Purpose",
                fieldDescription:
                  "One or two sentences describing what the project does and who it is for",
                step: 1,
              })
            }
            onBlur={() => setFocusedField(null)}
          />
        </div>
      </div>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack</CardTitle>
          <CardDescription>
            Select the technologies you'll use for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Framework */}
          <div className="space-y-2">
            <Label htmlFor="tech-framework">Framework</Label>
            <Select
              value={identity.techStack.framework}
              onValueChange={(value) =>
                handleTechStackChange("framework", value)
              }
            >
              <SelectTrigger id="tech-framework">
                <SelectValue placeholder="Choose a framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworkOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Styling */}
          <div className="space-y-2">
            <Label htmlFor="tech-styling">Styling</Label>
            <Select
              value={identity.techStack.styling}
              onValueChange={(value) => handleTechStackChange("styling", value)}
            >
              <SelectTrigger id="tech-styling">
                <SelectValue placeholder="Choose a styling approach" />
              </SelectTrigger>
              <SelectContent>
                {stylingOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Database */}
          <div className="space-y-2">
            <Label htmlFor="tech-database">Database</Label>
            <Select
              value={identity.techStack.database}
              onValueChange={(value) =>
                handleTechStackChange("database", value)
              }
            >
              <SelectTrigger id="tech-database">
                <SelectValue placeholder="Choose a database" />
              </SelectTrigger>
              <SelectContent>
                {databaseOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Authentication */}
          <div className="space-y-2">
            <Label htmlFor="tech-auth">Authentication</Label>
            <Select
              value={identity.techStack.auth}
              onValueChange={(value) => handleTechStackChange("auth", value)}
            >
              <SelectTrigger id="tech-auth">
                <SelectValue placeholder="Choose an auth provider" />
              </SelectTrigger>
              <SelectContent>
                {authOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deployment */}
          <div className="space-y-2">
            <Label htmlFor="tech-deployment">Deployment</Label>
            <Select
              value={identity.techStack.deployment}
              onValueChange={(value) =>
                handleTechStackChange("deployment", value)
              }
            >
              <SelectTrigger id="tech-deployment">
                <SelectValue placeholder="Choose a deployment platform" />
              </SelectTrigger>
              <SelectContent>
                {deploymentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Component Library */}
          <div className="space-y-2">
            <Label htmlFor="tech-component-library">Component Library</Label>
            <Select
              value={identity.techStack.componentLibrary}
              onValueChange={(value) =>
                handleTechStackChange("componentLibrary", value)
              }
            >
              <SelectTrigger id="tech-component-library">
                <SelectValue placeholder="Choose a component library" />
              </SelectTrigger>
              <SelectContent>
                {componentLibraryOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Existing Project Import */}
      {identity.projectMode === "existing" && (
        <Card>
          <CardHeader>
            <CardTitle>Import Existing Project</CardTitle>
            <CardDescription>
              Paste your folder structure and/or database schema to pre-fill what we can infer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="folder-tree">Folder Tree</Label>
              <Textarea
                id="folder-tree"
                placeholder={`Paste your folder structure, e.g.:\nsrc/\n  app/\n    layout.tsx\n    page.tsx\n  components/\n    ui/\n  lib/\n    utils.ts`}
                value={identity.existingFolderTree}
                onChange={(e) =>
                  dispatch({
                    type: "SET_IDENTITY",
                    payload: { existingFolderTree: e.target.value },
                  })
                }
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Run <code className="bg-muted px-1 rounded">find src -type f | head -100</code> or <code className="bg-muted px-1 rounded">tree src</code> in your project and paste the output.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="existing-schema">Existing Database Schema (SQL)</Label>
              <Textarea
                id="existing-schema"
                placeholder={`Paste your CREATE TABLE statements or schema dump...`}
                value={identity.existingSchema}
                onChange={(e) =>
                  dispatch({
                    type: "SET_IDENTITY",
                    payload: { existingSchema: e.target.value },
                  })
                }
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This will be included in your SCHEMA.md output so your AI has full database context.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
