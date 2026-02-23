import { NextRequest, NextResponse } from "next/server";

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
    const { messages, systemPrompt, apiKey, tools } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key provided" },
        { status: 401 }
      );
    }

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
