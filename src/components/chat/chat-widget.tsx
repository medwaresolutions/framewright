"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";

const STORAGE_KEY = "framewright_anthropic_key";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(state: ReturnType<typeof useProject>["state"], currentStep: number): string {
  const { identity, architecture, features, tasks, database, conventions } = state;

  const stepNames: Record<number, string> = {
    1: "Project Identity",
    2: "Architecture",
    3: "Styling & Brand",
    4: "Conventions",
    5: "Database Schema",
    6: "Features",
    7: "Tasks",
    8: "Review & Export",
    9: "Deployment Guide",
  };

  const featureSummary =
    features.length > 0
      ? features.map((f) => `- ${f.name}: ${f.description || "no description"}`).join("\n")
      : "None defined yet";

  const taskSummary =
    tasks.length > 0
      ? tasks.map((t) => `- task-${String(t.taskNumber).padStart(3, "0")}: ${t.name} [${t.status ?? "not-started"}]`).join("\n")
      : "None defined yet";

  const dbSummary =
    database.approach === "skip"
      ? "Skipped"
      : database.tables.length > 0
        ? database.tables.map((t) => `- ${t.name}: ${t.columns}`).join("\n")
        : database.plainEnglishDescription || database.pastedSchema || "Not defined yet";

  const conventionCount = conventions.decisions.filter((d) => d.selectedOptionId).length;

  return `You are a friendly AI assistant helping the user fill in the Framewright project planning wizard.

Framewright is a tool that helps developers structure software projects for AI-assisted development. It generates a set of markdown files (PROJECT.md, CONVENTIONS.md, feature files, task files, etc.) that serve as "surrogate memory" for AI coding assistants.

## Current Project State

**Project name:** ${identity.name || "Not set yet"}
**Purpose:** ${identity.purpose || "Not set yet"}
**Framework:** ${identity.techStack.framework || "Not selected"}
**Database:** ${identity.techStack.database || "Not selected"}
**Auth:** ${identity.techStack.auth || "Not selected"}
**App type:** ${architecture.appType || "Not set"}
**Conventions set:** ${conventionCount}

**Features:**
${featureSummary}

**Tasks:**
${taskSummary}

**Database tables:**
${dbSummary}

## Current step: ${stepNames[currentStep] ?? `Step ${currentStep}`}

## Your role
- Help the user fill in the current step they're on
- Ask clarifying questions to understand their project
- Suggest specific values, names, and descriptions they can copy into the form
- Keep answers concise and practical
- When suggesting feature names or task names, be specific to their project context
- If they describe their project, extract features, tasks, conventions, and database tables automatically
- Format suggestions clearly so they can copy-paste them

Be direct, practical, and helpful. Don't over-explain Framewright itself — focus on helping fill in the content.`;
}

export function ChatWidget() {
  const { state } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved API key on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimised) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimised]);

  useEffect(() => {
    if (isOpen && !isMinimised && apiKey) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimised, apiKey]);

  const saveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKey(trimmed);
    setApiKeyInput("");
    setShowKeyInput(false);
  };

  const removeApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || !apiKey) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(state, state.meta.currentStep),
          apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${(data as { error?: string }).error ?? "Something went wrong"}`,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: (data as { text: string }).text },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error — please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiKey, messages, state]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-200 w-[380px]",
        isMinimised ? "h-auto" : "h-[520px] flex flex-col"
      )}
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">AI Assistant</span>
          {apiKey && (
            <Badge variant="secondary" className="text-xs py-0">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimised(!isMinimised)}
            aria-label={isMinimised ? "Expand" : "Minimise"}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isMinimised && "rotate-180"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimised && (
        <>
          {/* API key setup */}
          {!apiKey ? (
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <KeyRound className="h-10 w-10 text-muted-foreground" />
              <div className="text-center space-y-1">
                <p className="font-semibold text-sm">Connect your Anthropic key</p>
                <p className="text-xs text-muted-foreground">
                  Your key is stored only in this browser and is never sent to our servers.
                </p>
              </div>
              <div className="w-full space-y-2">
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="sk-ant-..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={saveApiKey}
                  disabled={!apiKeyInput.trim().startsWith("sk-ant-")}
                >
                  Connect
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Get a key at{" "}
                  <span className="font-mono">console.anthropic.com</span>
                </p>
              </div>
            </CardContent>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8 space-y-2">
                    <p className="font-medium">Ask me anything about your project</p>
                    <p className="text-xs">
                      I can help you write descriptions, suggest features and tasks, define conventions, or explain what to fill in next.
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm max-w-[90%]",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2 w-fit">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t shrink-0">
                {showKeyInput ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showKey ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
                        className="pr-10 font-mono text-xs"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showKey ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 text-xs" onClick={saveApiKey}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => setShowKeyInput(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive"
                        onClick={removeApiKey}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowKeyInput(true)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      title="Change API key"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <Input
                      ref={inputRef}
                      placeholder="Ask for help filling in this step…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                      className="text-sm flex-1"
                    />
                    <Button
                      size="icon"
                      className="shrink-0 h-9 w-9"
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
