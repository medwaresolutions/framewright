export interface GeneratedFile {
  path: string;
  filename: string;
  content: string;
  wordCount: number;
  category: "root" | "docs" | "features" | "tasks" | "ai-configs";
}

export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  filePath?: string;
}
