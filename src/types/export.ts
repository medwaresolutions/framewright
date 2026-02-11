export interface GeneratedFile {
  path: string;
  filename: string;
  content: string;
  wordCount: number;
  category: "root" | "docs" | "features" | "tasks";
}

export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  filePath?: string;
}
