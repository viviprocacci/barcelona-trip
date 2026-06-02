import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runExploreSearch, type SearchType } from "../lib/ai/search";
import type { ChatContext } from "../lib/ai/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, type, context, localMatches } = req.body as {
      query: string;
      type?: SearchType;
      context?: ChatContext;
      localMatches?: string[];
    };

    if (!query?.trim()) {
      return res.status(400).json({ error: "query required" });
    }

    const result = await runExploreSearch(
      { query: query.trim(), type, context, localMatches },
      process.env,
    );

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : "Search failed",
    });
  }
}
