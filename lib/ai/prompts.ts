import { TRIP_CONTEXT } from "../../src/data/trip";
import type { ChatContext } from "./types";

export function buildSystemPrompt(ctx?: ChatContext): string {
  const parts = [TRIP_CONTEXT];

  if (ctx?.tripStartDate) {
    parts.push(`\nUSER TRIP START DATE: ${ctx.tripStartDate}`);
  }
  if (ctx?.tripDayLabel) {
    parts.push(`CURRENT TRIP STATUS: ${ctx.tripDayLabel}${ctx.tripDay != null ? ` (day index ${ctx.tripDay})` : ""}`);
  }
  if (ctx?.weather?.length) {
    parts.push(
      `\nLIVE WEATHER (today, °F):\n${ctx.weather
        .map((w) => `- ${w.label}: ${w.high}°F / ${w.low}°F, ${w.conditions}`)
        .join("\n")}`,
    );
  }
  if (ctx?.reservations?.length) {
    parts.push(
      `\nUSER BOOKINGS:\n${ctx.reservations
        .map(
          (r) =>
            `- ${r.title} (${r.category})${r.date ? ` on ${r.date}` : ""}${r.confirmation ? ` conf ${r.confirmation}` : ""}${r.location ? ` @ ${r.location}` : ""}`,
        )
        .join("\n")}`,
    );
  } else {
    parts.push("\nUSER BOOKINGS: none saved yet.");
  }
  if (ctx?.budgetRemainingUsd != null) {
    parts.push(
      `\nAI BUDGET: ~$${ctx.budgetRemainingUsd.toFixed(2)} remaining of $5 app allowance. Be concise.`,
    );
  }

  parts.push(
    "\nUse this context for personalized answers. Reference their actual day, weather, and bookings when relevant.",
  );

  return parts.join("");
}

export const DEALS_SYSTEM = `You are a Guatemala trip deal advisor. The user has set trip dates and wants the best bang for buck.

RULES:
- Compare realistic price ranges for tours, shuttles, hotels — not fake "deals"
- Name specific sites to check: GetYourGuide, Ox Expeditions, Wicho & Charlie's, direct hostel sites, GuateGo, Adrenalina tours, Booking.com, Airbnb, La Casa del Mundo direct
- If web search results are provided, cite them; otherwise use known typical Guatemala pricing
- Prioritize: Acatenango tour, Antigua night 1 hotel, La Casa del Mundo, lake shuttles, spa, airport shuttle
- Format: **Best move** (1 line), **Where to look** (bullets with sites), **Target price** (range), **Pro tip**
- Be concise. No fluff.`;

export const EXPLORE_SEARCH_SYSTEM = `You are a Guatemala travel search assistant helping users find the best bang for buck on activities and hotels.

RULES:
- Use web search results when provided; include real booking URLs from search when available
- For HOTELS: compare Booking.com, Airbnb, Hostelworld, direct hotel sites, WhatsApp booking
- For ACTIVITIES/TOURS: compare GetYourGuide, Viator, direct operators, hostel bulletin boards
- For DEALS: emphasize cheapest reliable option, not sketchy operators
- Max 5 items. Be honest if search is thin.
- Trip context: 5-day route Antigua → Acatenango → Lake Atitlán when relevant.

OUTPUT: Reply with ONLY raw JSON — no markdown, no code fences, no text before or after:
{
  "title": "Short headline for the search",
  "intro": "1-2 sentence overview",
  "items": [
    {
      "name": "Operator or place name",
      "price": "$X–Y/day or /night",
      "group": "Optional section label e.g. SALTWATER or BUDGET HOTELS",
      "links": [{"label": "site.com", "url": "https://..."}],
      "book": "Plain-text booking note if no URL",
      "why": "One line why it's worth it",
      "highlight": "Optional badge e.g. Best Budget Match"
    }
  ],
  "footer": "Optional reality check or timing tip"
}`;

export function buildExploreSearchPrompt(opts: {
  query: string;
  type: string;
  tripStart?: string;
  tripEnd?: string;
  searchBlock: string | null;
  localMatches?: string[];
  reservations?: string[];
}): string {
  const lines = [
    `Search query: "${opts.query}"`,
    `Search type: ${opts.type}`,
  ];
  if (opts.tripStart) lines.push(`Trip dates: ${opts.tripStart} to ${opts.tripEnd ?? "?"}`);
  if (opts.localMatches?.length) {
    lines.push(`Curated app matches: ${opts.localMatches.join("; ")}`);
  }
  if (opts.reservations?.length) {
    lines.push(`Already booked: ${opts.reservations.join(", ")}`);
  }
  lines.push(
    opts.searchBlock
      ? `WEB SEARCH RESULTS:\n${opts.searchBlock}`
      : "No live web search — use known Guatemala pricing and name sites to check.",
  );
  lines.push("Return JSON only with title, intro, items array, and optional footer.");
  return lines.join("\n\n");
}
