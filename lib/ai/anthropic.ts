import type { ClaudeResult, TokenUsage } from "./types";
import { DEFAULT_MODEL } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

/** Map retired / shorthand model names to current API ids */
const MODEL_ALIASES: Record<string, string> = {
  "claude-3-5-haiku-latest": "claude-haiku-4-5-20251001",
  "claude-3-5-haiku-20241022": "claude-haiku-4-5-20251001",
  "claude-3-haiku-20240307": "claude-haiku-4-5-20251001",
  "claude-sonnet-4-20250514": "claude-sonnet-4-5-20250929",
};

const FALLBACK_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-5-20250929",
];

export function formatApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: { type?: string; message?: string } };
    const msg = parsed.error?.message;
    if (msg?.includes("model:") || parsed.error?.type === "not_found_error") {
      return `Invalid AI model. Use ANTHROPIC_MODEL=claude-haiku-4-5-20251001 in .env`;
    }
    return msg || raw;
  } catch {
    return raw;
  }
}

function isModelNotFound(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("not_found_error") || msg.includes("model:");
}

async function callClaudeOnce(
  apiKey: string,
  model: string,
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens: number,
): Promise<ClaudeResult> {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(formatApiError(err || `Anthropic error ${response.status}`));
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
    usage?: TokenUsage;
  };

  const block = data.content?.find((c) => c.type === "text");
  return {
    text: block?.text?.trim() ?? "No response.",
    usage: data.usage ?? { input_tokens: 0, output_tokens: 0 },
  };
}

export async function callClaude(
  apiKey: string,
  model: string,
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 1024,
): Promise<ClaudeResult> {
  const primary = resolveModel(model);
  const candidates = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await callClaudeOnce(apiKey, candidate, system, messages, maxTokens);
    } catch (e) {
      lastError = e;
      if (!isModelNotFound(e)) throw e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All AI models failed");
}

export function getApiKey(env: Record<string, string | undefined>): string | undefined {
  return env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY;
}

export function resolveModel(model: string): string {
  return MODEL_ALIASES[model] ?? model;
}

export function getModel(env: Record<string, string | undefined>): string {
  const raw = env.ANTHROPIC_MODEL || env.VITE_ANTHROPIC_MODEL || DEFAULT_MODEL;
  return resolveModel(raw);
}

export async function tavilySearch(
  query: string,
  env: Record<string, string | undefined>,
): Promise<string | null> {
  const key = env.TAVILY_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    results?: { title: string; url: string; content: string }[];
  };

  if (!data.results?.length) return null;

  return data.results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content?.slice(0, 300)}`)
    .join("\n\n");
}
