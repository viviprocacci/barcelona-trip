export type TranslateLang = "en" | "es";

export interface TranslateResult {
  text: string;
  source: "instant" | "ai";
  usage?: { input_tokens: number; output_tokens: number };
  costUsd?: number;
}

export async function translateText(
  text: string,
  from: TranslateLang,
  to: TranslateLang,
  useAi = false,
): Promise<TranslateResult> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, from, to, useAi }),
  });
  const data = (await res.json()) as TranslateResult & { error?: string };
  if (!res.ok) throw new Error(data.error || "Translation failed");
  return data;
}
