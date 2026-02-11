"use client";

import { toast } from "sonner";

export function useCopyToClipboard() {
  const copy = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        label ? `${label} copied to clipboard` : "Copied to clipboard"
      );
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return { copy };
}
