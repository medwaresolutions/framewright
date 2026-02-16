"use client";

import { useMemo, useState } from "react";
import { useProject } from "@/contexts/project-context";
import { generateAll } from "@/lib/markdown";
import { createAndDownloadZip } from "@/lib/export/create-zip";
import { buildFileTree } from "@/lib/export/file-tree";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "sonner";
import {
  PROJECT_MD_WORD_WARNING,
  PROJECT_MD_WORD_DANGER,
} from "@/lib/constants";
import type { FileTreeNode } from "@/types/export";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Download,
  Copy,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  Pencil,
  Eye,
  Zap,
  Rocket,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function StepReview() {
  const { state, dispatch } = useProject();
  const { copy } = useCopyToClipboard();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showGettingStarted, setShowGettingStarted] = useState(false);

  const files = useMemo(() => generateAll(state), [state]);
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  // Validation warnings
  const warnings = useMemo(() => {
    const w: string[] = [];
    // Features with no name
    const unnamedFeatures = state.features.filter((f) => !f.name.trim());
    if (unnamedFeatures.length > 0) {
      w.push(`${unnamedFeatures.length} feature${unnamedFeatures.length > 1 ? "s" : ""} with no name`);
    }
    // Features with no tasks linked
    const featureIds = new Set(state.tasks.flatMap((t) => t.featureIds));
    const unlinkedFeatures = state.features.filter((f) => !featureIds.has(f.id));
    if (unlinkedFeatures.length > 0) {
      w.push(`${unlinkedFeatures.length} feature${unlinkedFeatures.length > 1 ? "s" : ""} with no tasks linked: ${unlinkedFeatures.map((f) => f.name || "Unnamed").join(", ")}`);
    }
    // Tasks with no Definition of Done
    const noDodTasks = state.tasks.filter((t) => !t.definitionOfDone.trim());
    if (noDodTasks.length > 0) {
      w.push(`${noDodTasks.length} task${noDodTasks.length > 1 ? "s" : ""} with no Definition of Done`);
    }
    // Tasks not linked to any feature
    const orphanedTasks = state.tasks.filter((t) => t.featureIds.length === 0);
    if (orphanedTasks.length > 0) {
      w.push(`${orphanedTasks.length} task${orphanedTasks.length > 1 ? "s" : ""} not linked to any feature`);
    }
    // Empty convention decisions
    const totalQuestions = state.conventions.decisions.length;
    const answeredQuestions = state.conventions.decisions.filter((d) => d.selectedOptionId !== null).length;
    const unanswered = totalQuestions - answeredQuestions;
    if (unanswered > 0) {
      w.push(`${unanswered} convention question${unanswered > 1 ? "s" : ""} not answered`);
    } else if (totalQuestions === 0) {
      w.push("No convention decisions made — consider going back to the Conventions step");
    }
    return w;
  }, [state]);

  const selectedFile = selectedFilePath
    ? files.find((f) => f.path === selectedFilePath) ?? null
    : null;

  const totalWords = files.reduce((sum, f) => sum + f.wordCount, 0);
  const projectMd = files.find((f) => f.path === "PROJECT.md");

  const handleDownloadZip = async () => {
    try {
      await createAndDownloadZip(files, state.identity.slug || "project");
      toast.success("ZIP downloaded successfully");
      setShowGettingStarted(true);
    } catch {
      toast.error("Failed to create ZIP file");
    }
  };

  const handleCopyFile = () => {
    if (selectedFile) {
      copy(selectedFile.content, selectedFile.filename);
    }
  };

  const handleStartEdit = () => {
    if (selectedFile) {
      setEditContent(selectedFile.content);
      setEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedFile) {
      dispatch({
        type: "SET_MARKDOWN_OVERRIDE",
        payload: { key: selectedFile.path, value: editContent },
      });
      setEditing(false);
      toast.success(`${selectedFile.filename} saved`);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditContent("");
  };

  const contextFile = files.find(
    (f) => f.path === "CONTEXT-WINDOW-STARTERS.md"
  );
  const handleCopyContextStarters = () => {
    if (contextFile) {
      copy(contextFile.content, "Context Window Starters");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Review & Export
          </h2>
          <p className="mt-1 text-muted-foreground">
            Review your framework files, edit if needed, then download.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="secondary">{totalWords} words</Badge>
        </div>
      </div>

      {/* Word count warning for PROJECT.md */}
      {projectMd && projectMd.wordCount >= PROJECT_MD_WORD_WARNING && (
        <div
          className={cn(
            "rounded-md border p-3 text-sm",
            projectMd.wordCount >= PROJECT_MD_WORD_DANGER
              ? "border-red-500/50 bg-red-500/10 text-red-700"
              : "border-yellow-500/50 bg-yellow-500/10 text-yellow-700"
          )}
        >
          PROJECT.md is {projectMd.wordCount} words
          {projectMd.wordCount >= PROJECT_MD_WORD_DANGER
            ? " — this may be too long for an AI context window. Consider trimming."
            : " — getting long. Keep under 3000 words for best results."}
        </div>
      )}

      {/* Validation warnings */}
      {warnings.length > 0 && (
        <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Heads up — {warnings.length} thing{warnings.length > 1 ? "s" : ""} to review:</span>
          </div>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400 ml-6 list-disc">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadZip} className="gap-2">
          <Download className="h-4 w-4" />
          Download ZIP
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyContextStarters}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          Copy Context Starters
        </Button>
      </div>

      {/* Getting Started panel — shown after download */}
      {showGettingStarted && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-5 pb-5 space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">What&apos;s Next</h3>
            </div>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">1</span>
                <div>
                  <p className="font-medium">Create your repo & drop in the framework files</p>
                  <p className="text-muted-foreground">Unzip the download and copy all files into your project root. Commit them as your first commit.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">2</span>
                <div>
                  <p className="font-medium">Copy the Skeleton Deployment prompt → paste into your AI</p>
                  <p className="text-muted-foreground">Open <code className="text-xs bg-muted px-1 py-0.5 rounded">CONTEXT-WINDOW-STARTERS.md</code> and copy the task-000 starter. Paste it into your AI coding assistant to scaffold the project.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">3</span>
                <div>
                  <p className="font-medium">Verify the checklist</p>
                  <p className="text-muted-foreground">Work through the Definition of Done for task-000. Make sure the skeleton app builds, deploys, and every team member can run it locally.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">4</span>
                <div>
                  <p className="font-medium">Start task-001 with the Context Window Starter</p>
                  <p className="text-muted-foreground">Once the skeleton is deployed, move on to your first real task. Each task file has a ready-to-paste prompt for your AI.</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Main layout: file tree + preview */}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
        {/* File tree */}
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Files
            </p>
            <FileTreeView
              node={fileTree}
              selectedPath={selectedFilePath}
              onSelect={setSelectedFilePath}
              depth={0}
            />
          </CardContent>
        </Card>

        {/* File preview / editor */}
        <Card>
          <CardContent className="p-4">
            {selectedFile ? (
              <div className="space-y-3">
                {/* File header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {selectedFile.path}
                    </span>
                    <WordCountBadge
                      count={selectedFile.wordCount}
                      isProject={selectedFile.path === "PROJECT.md"}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyFile}
                      className="gap-1.5 text-xs"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                    {editing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="text-xs"
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEdit}
                        className="gap-1.5 text-xs"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content */}
                {editing ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    rows={20}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[500px] rounded-md border p-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedFile.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Eye className="h-8 w-8 mb-2" />
                <p className="text-sm">Select a file to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WordCountBadge({
  count,
  isProject,
}: {
  count: number;
  isProject: boolean;
}) {
  const variant = isProject
    ? count >= PROJECT_MD_WORD_DANGER
      ? ("destructive" as const)
      : count >= PROJECT_MD_WORD_WARNING
        ? ("secondary" as const)
        : ("outline" as const)
    : ("outline" as const);

  return (
    <Badge variant={variant} className="text-xs font-mono">
      {count}w
    </Badge>
  );
}

function FileTreeView({
  node,
  selectedPath,
  onSelect,
  depth,
}: {
  node: FileTreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.type === "file") {
    return (
      <button
        onClick={() => onSelect(node.filePath!)}
        className={cn(
          "flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-xs transition-colors",
          selectedPath === node.filePath
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <FileText className="h-3 w-3 shrink-0" />
        {node.name}
      </button>
    );
  }

  return (
    <div>
      {depth > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 w-full text-left px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0" />
          )}
          <Folder className="h-3 w-3 shrink-0" />
          {node.name}
        </button>
      )}
      {expanded &&
        node.children?.map((child) => (
          <FileTreeView
            key={child.filePath ?? child.name}
            node={child}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={depth > 0 ? depth + 1 : depth}
          />
        ))}
    </div>
  );
}
