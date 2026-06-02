import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runTripDealScan } from "../lib/ai/search";
import type { ChatContext } from "../lib/ai/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { context, focus } = req.body as {
      context?: ChatContext;
      focus?: string;
    };

    const result = await runTripDealScan(context, focus, process.env);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : "Deals request failed",
    });
  }
}
