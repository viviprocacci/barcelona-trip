import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const text = String(req.query.text ?? "").trim();
  const lang = String(req.query.lang ?? "es").slice(0, 10);

  if (!text) return res.status(400).json({ error: "text required" });

  try {
    const url = new URL("https://translate.googleapis.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", lang);
    url.searchParams.set("q", text.slice(0, 200));

    const upstream = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "TTS upstream failed" });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(buffer);
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : "TTS failed",
    });
  }
}
