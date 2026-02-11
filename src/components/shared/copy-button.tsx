"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function CopyButton({
  text,
  label,
  variant = "outline",
  size = "default",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { copy } = useCopyToClipboard();

  const handleCopy = async () => {
    await copy(text, label);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant={variant} size={size} onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {size !== "icon" && (
        <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
      )}
    </Button>
  );
}
