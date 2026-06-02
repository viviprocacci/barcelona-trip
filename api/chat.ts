import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSystemPrompt } from "../lib/ai/prompts";
import { callClaude, getApiKey, getModel } from "../lib/ai/anthropic";
import { estimateCostUsd } from "../lib/ai/types";
import type { ChatContext } from "../lib/ai/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getApiKey(process.env);
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server" });
  }

  try {
    const { messages, context } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
      context?: ChatContext;
    };

    if (!messages?.length) {
      return res.status(400).json({ error: "messages required" });
    }

    const system = buildSystemPrompt(context);
    const result = await callClaude(apiKey, getModel(process.env), system, messages);

    return res.status(200).json({
      text: result.text,
      usage: result.usage,
      costUsd: estimateCostUsd(result.usage),
    });
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : "Chat request failed",
    });
  }
}
