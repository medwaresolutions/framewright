import type { GeneratedFile } from "@/types/export";
import type { FileTreeNode } from "@/types/export";

export function buildFileTree(files: GeneratedFile[]): FileTreeNode {
  const root: FileTreeNode = {
    name: "project-framework",
    type: "folder",
    children: [],
  };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.children!.push({
          name: part,
          type: "file",
          filePath: file.path,
        });
      } else {
        let folder = current.children!.find(
          (c) => c.name === part && c.type === "folder"
        );
        if (!folder) {
          folder = { name: part, type: "folder", children: [] };
          current.children!.push(folder);
        }
        current = folder;
      }
    }
  }

  return root;
}
