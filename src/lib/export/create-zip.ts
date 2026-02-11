import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { GeneratedFile } from "@/types/export";

export async function createAndDownloadZip(
  files: GeneratedFile[],
  projectSlug: string
) {
  const zip = new JSZip();
  const folderName = `${projectSlug || "project"}-framework`;
  const root = zip.folder(folderName);

  if (!root) throw new Error("Failed to create zip folder");

  for (const file of files) {
    root.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${folderName}.zip`);
}
