import { callClaude, getApiKey, getModel } from "./anthropic";
import { estimateCostUsd } from "./types";

const TRANSLATE_SYSTEM = `You translate for a traveler in Guatemala. Reply with ONLY the translation — no quotes, labels, or explanation. Use natural Guatemalan/Latin American Spanish when translating to Spanish.`;

async function myMemoryTranslate(text: string, from: string, to: string): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 500));
  url.searchParams.set("langpair", `${from}|${to}`);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Translation service unavailable");

  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
  };

  const out = data.responseData?.translatedText?.trim();
  if (!out) throw new Error("No translation returned");
  return out;
}

export async function runTranslate(
  text: string,
  from: "en" | "es",
  to: "en" | "es",
  useAi: boolean,
  env: Record<string, string | undefined>,
) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Text required");

  if (useAi) {
    const apiKey = getApiKey(env);
    if (!apiKey) throw new Error("AI translation requires ANTHROPIC_API_KEY");

    const target = to === "es" ? "Spanish (Guatemala)" : "English";
    const result = await callClaude(
      apiKey,
      getModel(env),
      TRANSLATE_SYSTEM,
      [{ role: "user", content: `Translate to ${target}:\n\n${trimmed}` }],
      200,
    );

    return {
      text: result.text,
      source: "ai" as const,
      usage: result.usage,
      costUsd: estimateCostUsd(result.usage),
    };
  }

  const translated = await myMemoryTranslate(trimmed, from, to);
  return {
    text: translated,
    source: "instant" as const,
    usage: { input_tokens: 0, output_tokens: 0 },
    costUsd: 0,
  };
}
