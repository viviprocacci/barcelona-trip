import type { Phrase } from "../types";

export const PHRASE_CATEGORIES: { id: Phrase["category"]; label: string }[] = [
  { id: "metro", label: "Metro / Transport" },
  { id: "taxi", label: "Taxi / Ride" },
  { id: "restaurant", label: "Food" },
  { id: "catalan", label: "Catalan basics" },
  { id: "general", label: "General" },
];

export const PHRASES: Phrase[] = [
  { id: "m1", category: "metro", spanish: "Dos billetes al centro, por favor", english: "Two tickets to the center, please" },
  { id: "m2", category: "metro", spanish: "¿Qué línea va a la Sagrada Família?", english: "Which line goes to Sagrada Família?" },
  { id: "m3", category: "metro", spanish: "¿Dónde está la estación más cercana?", english: "Where is the nearest metro station?" },
  { id: "m4", category: "metro", spanish: "Un T-casual, por favor", english: "One T-casual pass, please (10 rides)" },
  { id: "m5", category: "metro", spanish: "¿Este tren va a Plaça Espanya?", english: "Does this train go to Plaça Espanya?" },
  { id: "t1", category: "taxi", spanish: "Al aeropuerto, por favor", english: "To the airport, please" },
  { id: "t2", category: "taxi", spanish: "A la Sagrada Família", english: "To Sagrada Família" },
  { id: "t3", category: "taxi", spanish: "¿Cuánto cuesta al Barrio Gótico?", english: "How much to the Gothic Quarter?" },
  { id: "t4", category: "taxi", spanish: "Pare aquí, por favor", english: "Stop here, please" },
  { id: "t5", category: "taxi", spanish: "Tengo reserva en este hotel", english: "I have a reservation at this hotel" },
  { id: "r1", category: "restaurant", spanish: "La cuenta, por favor", english: "The check, please" },
  { id: "r2", category: "restaurant", spanish: "¿Tienen opciones vegetarianas?", english: "Do you have vegetarian options?" },
  { id: "r3", category: "restaurant", spanish: "Sin picante, por favor", english: "Not spicy, please" },
  { id: "r4", category: "restaurant", spanish: "Dos cañas, por favor", english: "Two small beers, please" },
  { id: "r5", category: "restaurant", spanish: "Una tabla de jamón y queso", english: "A plate of ham and cheese" },
  { id: "c1", category: "catalan", spanish: "Bon dia (Catalan: good morning)", english: "Good morning" },
  { id: "c2", category: "catalan", spanish: "Gràcies (Catalan: thank you)", english: "Thank you" },
  { id: "c3", category: "catalan", spanish: "On arriba la platja? (Where is the beach?)", english: "Where is the beach? (Catalan)" },
  { id: "c4", category: "catalan", spanish: "Parla castellà? (Do you speak Spanish?)", english: "Do you speak Spanish? (Catalan)" },
  { id: "g1", category: "general", spanish: "¿Cuánto cuesta?", english: "How much does it cost?" },
  { id: "g2", category: "general", spanish: "¿Dónde está el baño?", english: "Where is the bathroom?" },
  { id: "g3", category: "general", spanish: "Gracias, muy amable", english: "Thank you, very kind" },
  { id: "g4", category: "general", spanish: "No entiendo. ¿Puede repetir?", english: "I don't understand. Can you repeat?" },
  { id: "g5", category: "general", spanish: "¿Aceptan tarjeta?", english: "Do you accept card?" },
  { id: "g6", category: "general", spanish: "Cuidado con mi mochila", english: "Watch my backpack (pickpocket areas)" },
];
