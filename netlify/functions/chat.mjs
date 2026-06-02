const TRIP_CONTEXT = `
You are a helpful travel assistant for a 5-day Guatemala trip.

ITINERARY:
Day 1: Antigua — arrive from GUA, acclimatize, pack for hike
Day 2-3: Acatenango overnight — La Soledad base, high camp ~3900m, watch Fuego erupt, optional summit at dawn, descend by 10am Day 3
Day 3 PM: Massage in Antigua, shuttle to Lake Atitlán, La Casa del Mundo (boat only, last lanchas 6-7pm)
Day 4: Kayaking/fishing, cliff jumps, San Marcos/San Pedro, Cerro Tzankujil
Day 5: Breakfast at lake, shuttle to GUA with 3+ hr buffer

PACK LIST: eSIM, power bank, buff, layers/gloves/beanie, Diamox, Dramamine, Q cash, padlock, hand warmers, wet wipes, 4L+ water for hike

WEATHER (general): Antigua dry season Nov-Apr (warm days, cool nights). Acatenango camp near freezing at night, very windy. Lake Atitlán mornings calmer, windy afternoons. Rainy season May-Oct.

TRANSLATION: Help with Spanish phrases useful in Guatemala (formal/informal as appropriate). Common: "¿Cuánto cuesta?" (How much?), "La lancha a Santa Cruz" (boat to Santa Cruz), "¿Dónde está...?" (Where is...?), "Gracias", "Por favor", "La cuenta, por favor" (check please).

Be concise, practical, and safety-aware for altitude and boat schedules.
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
