import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApiKey } from "../lib/ai/anthropic";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const enabled = Boolean(getApiKey(process.env));
  return res.status(200).json({
    enabled,
    budgetCapUsd: 5,
    webSearch: Boolean(process.env.TAVILY_API_KEY),
  });
}
