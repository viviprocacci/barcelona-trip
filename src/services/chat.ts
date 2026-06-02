export const QUICK_PROMPTS = [
  { label: "Translate", prompt: "How do I say 'boat to Santa Cruz' in Spanish?" },
  { label: "Pack list", prompt: "What should I pack for Acatenango overnight?" },
  { label: "Weather", prompt: "What should I wear today based on my weather and trip day?" },
  { label: "My bookings", prompt: "Summarize what I still need to book based on my saved reservations." },
];

/** Offline fallback when API unavailable */
export function localFallback(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (/translate|spanish|say|how do i|cómo/i.test(q)) {
    return `**Useful Spanish:**

- *La lancha a Santa Cruz, por favor*
- *¿Cuánto cuesta?*
- *La cuenta, por favor*

Deploy with \`ANTHROPIC_API_KEY\` on Vercel for live AI.`;
  }

  if (/deal|cheap|price|book/i.test(q)) {
    return `**Deal hunting tips:**

- Acatenango: compare Ox Expeditions, Wicho & Charlie's, GetYourGuide
- Lake hotel: book La Casa del Mundo direct
- Shuttles: GuateGo or hostel desks beat airport rates

Use the **Deals** tab once AI is connected.`;
  }

  return `AI needs to be deployed with an API key. Use **Explore** and **Today** offline, or connect Claude on Vercel.`;
}
