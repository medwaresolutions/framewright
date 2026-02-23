"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/contexts/project-context";
import type { Feature, Task } from "@/types/project";
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

// ---------------------------------------------------------------------------
// Tool definitions sent to Anthropic
// ---------------------------------------------------------------------------
const FORM_TOOLS = [
  {
    name: "set_project_identity",
    description:
      "Set the project name and/or purpose. Call this as soon as the user tells you what they are building.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Short project name" },
        purpose: {
          type: "string",
          description:
            "One sentence: what the project does and who it is for",
        },
      },
    },
  },
  {
    name: "add_feature",
    description:
      "Add a new product feature. Call once per feature — do not combine multiple features into one call.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Short feature name, e.g. 'User Authentication'",
        },
        description: {
          type: "string",
          description: "What this feature does from the user's perspective",
        },
        businessRules: {
          type: "array",
          items: { type: "string" },
          description: "Technical constraints and business rules (optional)",
        },
        acceptanceCriteria: {
          type: "array",
          items: { type: "string" },
          description:
            "Testable criteria for when this feature is complete (optional)",
        },
      },
      required: ["name", "description"],
    },
  },
  {
    name: "add_task",
    description:
      "Add a single development task. Tasks are bite-sized units of AI-assisted coding work. Call once per task.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Short imperative name, e.g. 'Build login page and auth flow'",
        },
        definitionOfDone: {
          type: "string",
          description:
            "Clear, testable criteria for when this task is complete",
        },
        fileBoundaries: {
          type: "string",
          description:
            "Which files or directories the AI coder should touch, e.g. 'src/app/login/, src/components/auth/'",
        },
        outOfScope: {
          type: "string",
          description: "What the AI coder must NOT change while on this task",
        },
      },
      required: ["name", "definitionOfDone"],
    },
  },
  {
    name: "set_database_description",
    description:
      "Set a plain-English description of the database tables needed. Call this when the user describes their data model.",
    input_schema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description:
            "Plain English description of the tables, columns, and relationships",
        },
      },
      required: ["description"],
    },
  },
];

// ---------------------------------------------------------------------------
// Execute a single tool call — dispatches to project state
// ---------------------------------------------------------------------------
function executeToolCall(
  name: string,
  input: Record<string, unknown>,
  state: ReturnType<typeof useProject>["state"],
  dispatch: ReturnType<typeof useProject>["dispatch"],
  taskOffset: number,
  featureOffset: number
): string {
  switch (name) {
    case "set_project_identity": {
      const updates: { name?: string; purpose?: string } = {};
      if (input.name) updates.name = input.name as string;
      if (input.purpose) updates.purpose = input.purpose as string;
      dispatch({ type: "SET_IDENTITY", payload: updates });
      const parts: string[] = [];
      if (input.name) parts.push(`name → "${input.name}"`);
      if (input.purpose) parts.push(`purpose set`);
      return `Updated project identity — ${parts.join(", ")}`;
    }

    case "add_feature": {
      const featureName = (input.name as string) ?? "Unnamed feature";
      const feature: Feature = {
        id: crypto.randomUUID(),
        name: featureName,
        slug: featureName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        description: (input.description as string) ?? "",
        businessRules: (input.businessRules as string[]) ?? [],
        acceptanceCriteria: (input.acceptanceCriteria as string[]) ?? [],
        relatedTables: [],
        sortOrder: state.features.length + featureOffset,
      };
      dispatch({ type: "ADD_FEATURE", payload: feature });
      return `Added feature: "${feature.name}"`;
    }

    case "add_task": {
      const maxTaskNumber =
        state.tasks.length > 0
          ? Math.max(...state.tasks.map((t) => t.taskNumber))
          : 0;
      const taskNumber = maxTaskNumber + 1 + taskOffset;
      const task: Task = {
        id: crypto.randomUUID(),
        taskNumber,
        name: (input.name as string) ?? "Unnamed task",
        featureIds: [],
        definitionOfDone: (input.definitionOfDone as string) ?? "",
        fileBoundaries: (input.fileBoundaries as string) ?? "",
        outOfScope: (input.outOfScope as string) ?? "",
        status: "not-started",
        sortOrder: state.tasks.length + taskOffset,
      };
      dispatch({ type: "ADD_TASK", payload: task });
      return `Added task-${String(task.taskNumber).padStart(3, "0")}: "${task.name}"`;
    }

    case "set_database_description": {
      dispatch({
        type: "SET_DATABASE",
        payload: {
          approach: "plain-english",
          plainEnglishDescription: (input.description as string) ?? "",
        },
      });
      return `Set database description`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
function buildSystemPrompt(
  state: ReturnType<typeof useProject>["state"],
  currentStep: number
): string {
  const { identity, architecture, features, tasks, database, conventions } =
    state;

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
      ? features
          .map((f) => `- ${f.name}: ${f.description || "no description"}`)
          .join("\n")
      : "None defined yet";

  const taskSummary =
    tasks.length > 0
      ? tasks
          .map(
            (t) =>
              `- task-${String(t.taskNumber).padStart(3, "0")}: ${t.name} [${t.status ?? "not-started"}]`
          )
          .join("\n")
      : "None defined yet";

  const dbSummary =
    database.approach === "skip"
      ? "Skipped"
      : database.tables.length > 0
        ? database.tables.map((t) => `- ${t.name}: ${t.columns}`).join("\n")
        : database.plainEnglishDescription ||
          database.pastedSchema ||
          "Not defined yet";

  const conventionCount = conventions.decisions.filter(
    (d) => d.selectedOptionId
  ).length;

  return `You are a friendly AI assistant helping the user fill in the Framewright project planning wizard.

Framewright generates structured markdown files (PROJECT.md, CONVENTIONS.md, feature files, task files, etc.) that serve as "surrogate memory" for AI coding assistants working on the project.

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
You have tools available that let you fill in the form directly — use them proactively.

- When the user tells you what they are building, immediately call set_project_identity.
- When the user describes features, call add_feature once per feature.
- When the user describes tasks or work to be done, call add_task once per task.
- When the user describes their data model, call set_database_description.

Do NOT ask for confirmation before filling — just do it and tell the user what you added. After filling, ask what else they want to add or refine. Keep replies concise and practical.`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ChatWidget() {
  const { state, dispatch } = useProject();
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
    if (!trimmed.startsWith("sk-ant-")) return;
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
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const systemPrompt = buildSystemPrompt(state, state.meta.currentStep);
    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // ── First call — with tools ──────────────────────────────────────────
      const res1 = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt,
          apiKey,
          tools: FORM_TOOLS,
        }),
      });

      if (!res1.ok) {
        const errData = await res1.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${(errData as { error?: string }).error ?? "Something went wrong"}`,
          },
        ]);
        return;
      }

      type ApiResponse = {
        text: string;
        toolUses: Array<{
          id: string;
          name: string;
          input: Record<string, unknown>;
        }>;
        content: unknown[];
      };

      const d1 = (await res1.json()) as ApiResponse;

      // ── Pure text — no tools called ──────────────────────────────────────
      if (d1.toolUses.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: d1.text },
        ]);
        return;
      }

      // ── Execute tools locally ────────────────────────────────────────────
      const filledActions: string[] = [];
      let taskOffset = 0;
      let featureOffset = 0;

      for (const toolUse of d1.toolUses) {
        const result = executeToolCall(
          toolUse.name,
          toolUse.input,
          state,
          dispatch,
          taskOffset,
          featureOffset
        );
        if (toolUse.name === "add_task") taskOffset++;
        if (toolUse.name === "add_feature") featureOffset++;
        filledActions.push(result);
      }

      // ── Second call — get conversational follow-up ───────────────────────
      const toolResults = d1.toolUses.map((tu, i) => ({
        type: "tool_result",
        tool_use_id: tu.id,
        content: filledActions[i],
      }));

      const res2 = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...apiMessages,
            { role: "assistant", content: d1.content },
            { role: "user", content: toolResults },
          ],
          systemPrompt,
          apiKey,
          // no tools on second call — just get text
        }),
      });

      const d2 = (await res2.json()) as { text: string };
      const finalText =
        d2.text ||
        filledActions.map((a) => `✓ ${a}`).join("\n");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: finalText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Network error — please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiKey, messages, state, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Closed state — floating pill ──────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-5 w-5 shrink-0" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold leading-tight">
            AI Assistant
          </span>
          <span className="text-xs opacity-80 leading-tight">
            Bring your AI — help me fill this in
          </span>
        </div>
      </button>
    );
  }

  // ── Open state ────────────────────────────────────────────────────────────
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
                  Your key is stored only in this browser and never sent to our
                  servers.
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
                    <p className="font-medium">
                      Describe your project and I&apos;ll fill in the form
                    </p>
                    <p className="text-xs">
                      Tell me what you&apos;re building — I can set the project
                      name and purpose, add features, create tasks, and describe
                      your database automatically.
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
                    <span className="text-xs text-muted-foreground">
                      Filling in form…
                    </span>
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
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={saveApiKey}
                      >
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
                      placeholder="Describe your project or ask for help…"
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
