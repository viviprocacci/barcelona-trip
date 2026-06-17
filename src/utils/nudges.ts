import type { Nudge } from "../types";

/** Contextual nudges based on trip day and time of day (0–23) */
export function getNudges(tripDay: number, hour: number): Nudge[] {
  const nudges: Nudge[] = [];

  if (tripDay === 0) {
    nudges.push({
      id: "pre-trip",
      text: "Trip hasn't started yet. Review your pack list and confirm Sagrada Família tickets.",
    });
    return nudges;
  }

  if (tripDay > 5) {
    nudges.push({ id: "post-trip", text: "Safe travels home. Hope Barcelona was incredible." });
    return nudges;
  }

  switch (tripDay) {
    case 1:
      if (hour >= 18) {
        nudges.push({
          id: "d1-rest",
          text: "Sleep early — Gaudí day tomorrow. Double-check Sagrada & Park Güell entry times.",
          urgency: "high",
        });
      }
      if (hour >= 20) {
        nudges.push({
          id: "d1-pickpocket",
          text: "Keep bag in front in crowded alleys. Gothic Quarter after dark is magical but busy.",
        });
      }
      break;
    case 2:
      nudges.push({
        id: "d2-tickets",
        text: "Timed entry at Sagrada — don't be late. Allow 90 min inside.",
        urgency: "high",
      });
      if (hour >= 14) {
        nudges.push({
          id: "d2-park",
          text: "Park Güell is uphill — bus 24 or metro + walk. Monumental zone needs a ticket.",
        });
      }
      break;
    case 3:
      if (hour < 8) {
        nudges.push({
          id: "d3-early",
          text: "Catch an early R5 from Plaça Espanya — Montserrat crowds build by late morning.",
          urgency: "high",
        });
      }
      if (hour >= 16) {
        nudges.push({
          id: "d3-layers",
          text: "Mountain is cooler than the city. You'll appreciate those layers on the way down.",
        });
      }
      break;
    case 4:
      if (hour < 10) {
        nudges.push({
          id: "d4-beach",
          text: "Hit the beach before 10am — best swim window before crowds and heat peak.",
        });
      }
      if (hour >= 18) {
        nudges.push({
          id: "d4-sunset",
          text: "Head to Bunkers del Carmel for sunset — bring water and arrive 45 min early.",
        });
      }
      break;
    case 5:
      if (hour < 10) {
        nudges.push({
          id: "d5-boqueria",
          text: "La Boqueria is best before 10am — juice stands and jamón without the crush.",
        });
      }
      if (hour >= 12) {
        nudges.push({
          id: "d5-airport",
          text: "Allow 2+ hours before international flights. Aerobús or metro L9 to BCN.",
          urgency: "high",
        });
      }
      break;
  }

  return nudges;
}
