import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runTranslate } from "../lib/ai/translate";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, from, to, useAi } = req.body as {
      text: string;
      from: "en" | "es";
      to: "en" | "es";
      useAi?: boolean;
    };

    if (!text?.trim()) return res.status(400).json({ error: "text required" });

    const result = await runTranslate(
      text,
      from ?? "en",
      to ?? "es",
      Boolean(useAi),
      process.env,
    );

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : "Translation failed",
    });
  }
}
