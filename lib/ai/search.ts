import { parseExploreResult } from "./exploreResult";
import { buildExploreSearchPrompt, DEALS_SYSTEM, EXPLORE_SEARCH_SYSTEM } from "./prompts";
import { callClaude, getApiKey, getModel, tavilySearch } from "./anthropic";
import { estimateCostUsd } from "./types";
import type { ChatContext } from "./types";

export type SearchType = "activity" | "hotel" | "deal" | "general";

export interface SearchRequest {
  query: string;
  type?: SearchType;
  context?: ChatContext;
  /** Curated picks that matched locally — Claude can reference these */
  localMatches?: string[];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildTavilyQuery(query: string, type: SearchType, start: string): string {
  const base = query.trim();
  switch (type) {
    case "hotel":
      return `${base} hotel hostel Guatemala booking price ${start}`;
    case "deal":
      return `${base} Guatemala tour deal cheapest ${start}`;
    case "activity":
      return `${base} Guatemala tour activity price ${start}`;
    default:
      return `${base} Guatemala travel ${start}`;
  }
}

export async function runExploreSearch(
  req: SearchRequest,
  env: Record<string, string | undefined>,
) {
  const apiKey = getApiKey(env);
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured on server");

  const type = req.type ?? "general";
  const start = req.context?.tripStartDate ?? "";
  const end = start ? addDays(start, 4) : "";
  const tavilyQuery = buildTavilyQuery(req.query, type, start || "2026");

  const searchBlock = await tavilySearch(tavilyQuery, env);

  const userPrompt = buildExploreSearchPrompt({
    query: req.query,
    type,
    tripStart: start || undefined,
    tripEnd: end || undefined,
    searchBlock,
    localMatches: req.localMatches,
    reservations: req.context?.reservations?.map((r) => r.title),
  });

  const result = await callClaude(
    apiKey,
    getModel(env),
    EXPLORE_SEARCH_SYSTEM,
    [{ role: "user", content: userPrompt }],
    1500,
  );

  const structured = parseExploreResult(result.text);

  return {
    text: result.text,
    structured,
    usage: result.usage,
    costUsd: estimateCostUsd(result.usage),
    searchedWeb: Boolean(searchBlock),
  };
}

/** Full trip deal scan (AI → Deals tab) */
export async function runTripDealScan(
  context: ChatContext | undefined,
  focus: string | undefined,
  env: Record<string, string | undefined>,
) {
  const targets = focus
    ? [focus]
    : [
        "Acatenango overnight tour from Antigua",
        "Antigua Guatemala hotel/hostel",
        "La Casa del Mundo Santa Cruz Lake Atitlan",
        "Shuttle Antigua to Lake Atitlan",
        "Shuttle Lake Atitlan to Guatemala City airport",
        "El Descanso Spa Antigua massage",
      ];

  const start = context?.tripStartDate ?? "unknown";
  let searchBlock = "";
  for (const t of targets.slice(0, focus ? 1 : 3)) {
    const results = await tavilySearch(`${t} Guatemala cheapest ${start}`, env);
    if (results) searchBlock += `\n\nSearch: "${t}"\n${results}`;
  }

  const end = context?.tripStartDate ? addDays(context.tripStartDate, 4) : "unknown";

  const userPrompt = `Trip dates: ${start} to ${end} (5-day Guatemala: Antigua → Acatenango → Lake Atitlán).

${focus ? `Find the best deals for: **${focus}**` : "Scan for best deals on all major bookings for this trip."}

${searchBlock ? `WEB SEARCH RESULTS:${searchBlock}` : "No live web search — use typical Guatemala pricing and name exact sites."}

Already booked: ${context?.reservations?.length ? context.reservations.map((r) => r.title).join(", ") : "nothing yet"}

Give actionable deal-hunting advice with target prices in USD.`;

  const apiKey = getApiKey(env)!;
  const result = await callClaude(
    apiKey,
    getModel(env),
    DEALS_SYSTEM,
    [{ role: "user", content: userPrompt }],
    1200,
  );

  return {
    text: result.text,
    usage: result.usage,
    costUsd: estimateCostUsd(result.usage),
    searchedWeb: searchBlock.length > 0,
  };
}
