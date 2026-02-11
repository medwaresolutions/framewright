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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function StepReview() {
  const { state, dispatch } = useProject();
  const { copy } = useCopyToClipboard();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const files = useMemo(() => generateAll(state), [state]);
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const selectedFile = selectedFilePath
    ? files.find((f) => f.path === selectedFilePath) ?? null
    : null;

  const totalWords = files.reduce((sum, f) => sum + f.wordCount, 0);
  const projectMd = files.find((f) => f.path === "PROJECT.md");

  const handleDownloadZip = async () => {
    try {
      await createAndDownloadZip(files, state.identity.slug || "project");
      toast.success("ZIP downloaded successfully");
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
