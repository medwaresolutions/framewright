"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  ChevronLeft,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { createAndDownloadZip } from "@/lib/export/create-zip";
import type { ExampleProject } from "@/data/examples";
import type { GeneratedFile } from "@/types/export";

interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  path?: string;
  children?: FileTreeNode[];
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.push({ name: part, type: "file", path: file.path });
      } else {
        let folder = current.find(
          (n) => n.name === part && n.type === "folder"
        );
        if (!folder) {
          folder = { name: part, type: "folder", children: [] };
          current.push(folder);
        }
        current = folder.children!;
      }
    }
  }

  // Sort: folders first, then files, alphabetically
  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map((n) =>
      n.children ? { ...n, children: sortNodes(n.children) } : n
    );
  };

  return sortNodes(root);
}

function FileTreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = node.path === selectedPath;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm hover:bg-muted/50 text-muted-foreground"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {open ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-blue-500" />
          )}
          <span>{node.name}</span>
        </button>
        {open &&
          node.children?.map((child) => (
            <FileTreeItem
              key={child.path || child.name}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.path && onSelect(node.path)}
      className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted/50 text-foreground"
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function ProjectDetail({
  project,
  onBack,
}: {
  project: ExampleProject;
  onBack: () => void;
}) {
  const [selectedPath, setSelectedPath] = useState<string>(
    project.files[0]?.path || ""
  );
  const tree = useMemo(() => buildFileTree(project.files), [project.files]);
  const selectedFile = project.files.find((f) => f.path === selectedPath);

  const handleDownload = () => {
    createAndDownloadZip(project.files, project.id);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          Back to examples
        </Button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <Badge variant="secondary">{project.subtitle}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
          <Download className="h-4 w-4" />
          Download ZIP
        </Button>
      </div>

      <div className="grid grid-cols-[260px_1fr] gap-4 rounded-lg border bg-card min-h-[600px]">
        {/* File tree */}
        <div className="border-r overflow-y-auto p-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-2">
            {project.files.length} files
          </div>
          {tree.map((node) => (
            <FileTreeItem
              key={node.path || node.name}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {selectedFile ? (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <code className="text-sm text-muted-foreground">
                  {selectedFile.path}
                </code>
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedFile.wordCount} words
                </span>
              </div>
              <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-mt-4 prose-pre:bg-muted prose-pre:text-foreground prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedFile.content}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a file to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExampleViewer({
  projects,
}: {
  projects: ExampleProject[];
}) {
  const [activeProject, setActiveProject] = useState<string | null>(null);

  const selected = projects.find((p) => p.id === activeProject);

  if (selected) {
    return (
      <ProjectDetail
        project={selected}
        onBack={() => setActiveProject(null)}
      />
    );
  }

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{project.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {project.subtitle}
              </Badge>
            </div>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">Features:</p>
              <ul className="space-y-1">
                {project.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-muted-foreground"
                  >
                    &bull; {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {project.taskCount} tasks &middot; {project.files.length} files
              </p>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setActiveProject(project.id)}
              >
                <Eye className="h-4 w-4" />
                View Example
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
