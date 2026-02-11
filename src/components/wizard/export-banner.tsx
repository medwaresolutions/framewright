"use client";

import { useMemo } from "react";
import { useProject } from "@/contexts/project-context";
import { generateAll } from "@/lib/markdown";
import { createAndDownloadZip } from "@/lib/export/create-zip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";

export function ExportBanner() {
  const { state, goToStep } = useProject();

  const files = useMemo(() => generateAll(state), [state]);
  const totalFiles = files.length;

  const handleDownload = async () => {
    try {
      await createAndDownloadZip(files, state.identity.slug || "project");
      toast.success("ZIP downloaded successfully");
    } catch {
      toast.error("Failed to create ZIP file");
    }
  };

  return (
    <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-sm text-foreground">
        Your framework is ready —{" "}
        <span className="font-medium">{totalFiles} files</span> generated.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToStep(8)}
          className="gap-1.5 text-xs"
        >
          Review
          <ArrowRight className="h-3 w-3" />
        </Button>
        <Button size="sm" onClick={handleDownload} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Download ZIP
        </Button>
      </div>
    </div>
  );
}
