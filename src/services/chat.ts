export const QUICK_PROMPTS = [
  { label: "Today", prompt: "What should I focus on today based on my trip day and what's already booked?" },
  { label: "Food & tapas", prompt: "Where should I eat in Barcelona? Best tapas bars and must-tries?" },
  { label: "Gaudí day", prompt: "What should I know for Sagrada Família and Park Güell? Timing and tickets?" },
  { label: "Montserrat", prompt: "How do I get to Montserrat? Trains, funiculars, and what to do there?" },
];

/** Offline fallback when API unavailable */
export function localFallback(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (/translate|how do i say|cómo se dice|in spanish|español/i.test(q)) {
    return `Use the **Español** tab for offline phrase cards, instant translate, and speak-back.`;
  }

  if (/sagrada|gaudi|guell|modernist/i.test(q)) {
    return `**Gaudí tips:**

- Book **Sagrada Família** and **Park Güell** online — same-day often sold out
- Sagrada morning light through stained glass is best
- Passeig de Gràcia: Casa Batlló + Casa Milà walkable in one afternoon`;
  }

  if (/montserrat|monastery|cremallera/i.test(q)) {
    return `**Montserrat:**

- R5 train from **Plaça Espanya** (~1 hr) + rack railway (Cremallera) or cable car
- ToT Montserrat ticket bundles train + mountain transport
- Start early; hike Sant Jeroni or take Sant Joan funicular for views`;
  }

  if (/food|eat|restaurant|tapas|vermut/i.test(q)) {
    return `**Eating in Barcelona:**

- Tapas crawl in **El Born** or **Gràcia** — dinner starts ~9pm
- Cervecería Catalana, Cal Pep, Bar del Pla for classics
- Vermut Sunday tradition in Gràcia plazas
- Carry euros — some bars are cash-only`;
  }

  if (/metro|transport|airport|bcn|aerobus/i.test(q)) {
    return `**Getting around:**

- **T-casual** (10 rides) or **Hola BCN** at any metro station
- Aerobús Plaça Catalunya ↔ BCN, or metro L9 Sud
- Uber/Cabify/Bolt work well; watch for metro strike days
- Walk the Gothic Quarter — driving is pointless in centro`;
  }

  return `Mateo works offline here. Connect API keys for live chat. **Today**, **Explore**, **Plan**, and **Español** still work without keys. ¡Pregúntame lo que quieras!`;
}
