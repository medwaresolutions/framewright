import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiting — 30 requests per IP per hour
// Note: resets across cold starts in serverless; good enough for basic protection
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------

interface AnthropicToolUse {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

type AnthropicContent = AnthropicToolUse | AnthropicTextBlock;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is not configured with an API key" },
        { status: 503 }
      );
    }

    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests — please try again in an hour" },
        { status: 429 }
      );
    }

    const { messages, systemPrompt, tools } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const body: Record<string, unknown> = {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    };

    if (tools && Array.isArray(tools) && tools.length > 0) {
      body.tools = tools;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message =
        (error as { error?: { message?: string } })?.error?.message ??
        `Anthropic API error ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    const content: AnthropicContent[] = data?.content ?? [];

    const text = content
      .filter((c): c is AnthropicTextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    const toolUses = content.filter(
      (c): c is AnthropicToolUse => c.type === "tool_use"
    );

    return NextResponse.json({ text, toolUses, content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
