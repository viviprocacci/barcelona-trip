/** Zero-deps status check — avoids bundling issues on Vercel. */
export default function handler(
  _req: { method?: string },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
  },
) {
  const key = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  res.status(200).json({
    enabled: Boolean(key),
    budgetCapUsd: 5,
    webSearch: Boolean(process.env.TAVILY_API_KEY),
  });
}
