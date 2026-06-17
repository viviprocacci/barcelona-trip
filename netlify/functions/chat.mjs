const TRIP_CONTEXT = `
You are a helpful travel assistant for a 5-day Barcelona trip.

ITINERARY:
Day 1: Gothic Quarter & El Born — arrive BCN, settle in, old city walk, tapas
Day 2: Gaudí day — Sagrada Família morning, Passeig de Gràcia modernist houses, Park Güell afternoon
Day 3: Montserrat day trip — R5 train from Plaça Espanya, monastery, hikes or funiculars
Day 4: Beach morning (Barceloneta), neighborhood wander (Gràcia/Poblenou), sunset at Bunkers del Carmel
Day 5: La Boqueria market, last stroll, Aerobús/metro to BCN

PACK LIST: eSIM, power bank, walking shoes, light layers, sunscreen, euros cash, swimsuit, Montserrat daypack, timed-entry tickets for Sagrada & Park Güell, metro pass

WEATHER (general): Mediterranean — warm Apr–Oct, mild winters. Summer humid; beach best before 11am. Montserrat cooler and windier. Rain possible Oct–Apr.

TRANSLATION: Help with Spanish phrases useful in Barcelona (Catalan is also spoken). Common: "¿Cuánto cuesta?" (How much?), "Dos cañas, por favor" (Two beers), "¿Dónde está...?" (Where is...?), "La cuenta, por favor" (check please).

Be concise, practical, and safety-aware for pickpockets, timed-entry tickets, and metro strikes.
`.trim();

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "VITE_ANTHROPIC_API_KEY not configured" }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");
    const model = process.env.VITE_ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: TRIP_CONTEXT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: err }),
      };
    }

    const data = await response.json();
    const block = data.content?.find((c) => c.type === "text");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: block?.text?.trim() ?? "No response." }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: e instanceof Error ? e.message : "Chat request failed",
      }),
    };
  }
};
