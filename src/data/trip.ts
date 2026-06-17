import { DAY_IMAGES } from "../../lib/images";

export type PlaceCategory =
  | "airport"
  | "city"
  | "hike"
  | "spa"
  | "beach"
  | "activity"
  | "restaurant"
  | "hotel";

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  day?: number;
  notes?: string;
  address?: string;
}

export interface Activity {
  time?: string;
  text: string;
  rideTo?: { name: string; lat: number; lng: number; address?: string };
}

export interface DayPlan {
  day: number;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  activities: Activity[];
  tips?: string[];
  stay?: string;
}

export const PACK_LIST = [
  { item: "eSIM or EU roaming plan", category: "tech" },
  { item: "Power bank", category: "tech" },
  { item: "Comfortable walking shoes", category: "essentials" },
  { item: "Light layers + light jacket", category: "essentials" },
  { item: "Sunscreen & sunglasses", category: "essentials" },
  { item: "Reusable water bottle", category: "essentials" },
  { item: "Cash in euros (small bills)", category: "essentials" },
  { item: "Tapas appetite", category: "essentials" },
  { item: "Swimsuit & towel", category: "beach" },
  { item: "Daypack for Montserrat", category: "hike" },
  { item: "Sagrada Família timed entry", category: "tickets" },
  { item: "Park Güell timed entry", category: "tickets" },
  { item: "Metro T-casual or Hola BCN card", category: "transport" },
  { item: "Pickpocket-proof bag", category: "essentials" },
];

export const MONTserrat_ESSENTIALS = [
  "Comfortable hiking shoes — monastery paths are rocky",
  "Layers: cool morning in Barcelona, breezy on the mountain",
  "Water + snacks for the hike or funicular wait",
  "Book R5 train + rack railway (Cremallera) or cable car ahead in peak season",
  "Start early — crowds build by late morning",
];

export const PLACES: Place[] = [
  {
    id: "bcn",
    name: "Barcelona-El Prat Airport (BCN)",
    lat: 41.2974,
    lng: 2.0833,
    category: "airport",
    notes: "Aerobús or metro L9 to city. Allow 2+ hrs before international flights",
  },
  {
    id: "gothic",
    name: "Barri Gòtic",
    lat: 41.3834,
    lng: 2.1761,
    category: "city",
    day: 1,
    notes: "Cathedral, narrow alleys, Plaça Reial. Watch bags in crowds",
  },
  {
    id: "born",
    name: "El Born",
    lat: 41.3851,
    lng: 2.1827,
    category: "city",
    day: 1,
    notes: "Santa Maria del Mar, boutiques, tapas bars",
  },
  {
    id: "eixample",
    name: "Eixample",
    lat: 41.3925,
    lng: 2.164,
    category: "city",
    notes: "Grid of modernist blocks — good base for hotels",
  },
  {
    id: "sagrada",
    name: "Sagrada Família",
    lat: 41.4036,
    lng: 2.1744,
    category: "activity",
    day: 2,
    notes: "Book timed entry weeks ahead. Metro L2/L5 Sagrada Família",
  },
  {
    id: "park-guell",
    name: "Park Güell",
    lat: 41.4145,
    lng: 2.1527,
    category: "activity",
    day: 2,
    notes: "Timed entry for monumental zone. Bus 24 or metro + uphill walk",
  },
  {
    id: "casa-batllo",
    name: "Casa Batlló",
    lat: 41.3916,
    lng: 2.1649,
    category: "activity",
    day: 2,
    notes: "Passeig de Gràcia modernist strip — combine with Casa Milà",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    lat: 41.5917,
    lng: 1.8372,
    category: "hike",
    day: 3,
    notes: "R5 train from Plaça Espanya + Cremallera rack railway. Monastery + hikes",
  },
  {
    id: "barceloneta",
    name: "Barceloneta Beach",
    lat: 41.3809,
    lng: 2.189,
    category: "beach",
    day: 4,
    notes: "Morning swim before crowds. Metro L4 Barceloneta",
  },
  {
    id: "gracia",
    name: "Gràcia",
    lat: 41.4036,
    lng: 2.1564,
    category: "city",
    day: 4,
    notes: "Village vibe, vermut bars, Plaça del Sol",
  },
  {
    id: "bunkers",
    name: "Bunkers del Carmel",
    lat: 41.4194,
    lng: 2.1617,
    category: "activity",
    day: 4,
    notes: "Best city sunset panorama. Bus V17 or taxi up the hill",
  },
  {
    id: "boqueria",
    name: "Mercat de la Boqueria",
    lat: 41.3816,
    lng: 2.1715,
    category: "activity",
    day: 5,
    notes: "Go early for fruit juices & jamón. La Rambla entrance",
  },
  {
    id: "ciutadella",
    name: "Parc de la Ciutadella",
    lat: 41.3881,
    lng: 2.1869,
    category: "activity",
    day: 5,
    notes: "Arc de Triomf, fountain, relaxed final-morning stroll",
  },
  {
    id: "tickets",
    name: "Tickets Bar (Albert Adrià)",
    lat: 41.3752,
    lng: 2.1492,
    category: "restaurant",
    notes: "Book months ahead if you want this — legendary tasting menu",
  },
  {
    id: "cerveseria",
    name: "Cervecería Catalana",
    lat: 41.3924,
    lng: 2.1619,
    category: "restaurant",
    notes: "Classic tapas bar on Carrer de Mallorca — arrive before 8pm",
  },
  {
    id: "school-diputacio",
    name: "Language school",
    lat: 41.3826,
    lng: 2.1565,
    category: "hotel",
    day: 1,
    address: "Carrer de la Diputació 119, 08015 Barcelona",
    notes: "Mom's language school — Eixample, near Urgell metro (L1)",
  },
];

export const SCHOOL_BASE_ID = "school-diputacio";

export function getSchoolBase(): Place {
  const place = PLACES.find((p) => p.id === SCHOOL_BASE_ID);
  if (!place) throw new Error("School base not found in PLACES");
  return place;
}

export const DAYS: DayPlan[] = [
  {
    day: 1,
    title: "Barcelona · Arrive & Old City",
    subtitle: "Land BCN, settle in",
    image: DAY_IMAGES[1],
    imageAlt: "Narrow streets in the Gothic Quarter",
    stay: "Carrer de la Diputació 119, Eixample",
    activities: [
      { time: "Morning", text: "Land BCN, Aerobús or metro L9 to the center (~35 min)", rideTo: { name: "Plaça Catalunya", lat: 41.387, lng: 2.17, address: "Plaça de Catalunya, Barcelona, Spain" } },
      { text: "Check in, drop bags, grab a café con leche" },
      { text: "Wander Barri Gòtic: Cathedral, Plaça Sant Jaume, Plaça Reial" },
      { text: "El Born for Santa Maria del Mar and evening tapas" },
      { text: "Early night — big Gaudí day tomorrow" },
    ],
    tips: [
      "Keep passport and wallet in front pockets — tourist areas attract pickpockets",
      "Buy a T-casual (10 rides) or Hola BCN card at any metro station",
    ],
  },
  {
    day: 2,
    title: "Gaudí & Modernisme",
    subtitle: "Sagrada Família + Park Güell",
    image: DAY_IMAGES[2],
    imageAlt: "Sagrada Família basilica towers",
    activities: [
      { time: "Morning", text: "Sagrada Família — timed entry, allow 90 min inside", rideTo: { name: "Sagrada Família", lat: 41.4036, lng: 2.1744, address: "Carrer de Mallorca, 401, Barcelona, Spain" } },
      { text: "Walk Passeig de Gràcia: Casa Batlló, Casa Milà (La Pedrera)" },
      { time: "Afternoon", text: "Park Güell — monumental zone + city views", rideTo: { name: "Park Güell", lat: 41.4145, lng: 2.1527, address: "Carrer d'Olot, Barcelona, Spain" } },
      { text: "Dinner in Gràcia or Eixample — book popular spots ahead" },
    ],
    tips: [
      "Book Sagrada and Park Güell online — same-day tickets often sell out",
    ],
  },
  {
    day: 3,
    title: "Montserrat · Mountain Day Trip",
    subtitle: "Monastery, views & hiking",
    image: DAY_IMAGES[3],
    imageAlt: "Montserrat monastery perched on rocky peaks",
    activities: [
      { time: "Early", text: "R5 train from Plaça Espanya to Montserrat (~1 hr)", rideTo: { name: "Plaça Espanya", lat: 41.375, lng: 2.149, address: "Plaça d'Espanya, Barcelona, Spain" } },
      { text: "Cremallera rack railway or Aeri cable car up to the monastery" },
      { text: "Basilica, Black Madonna (optional queue), mountain walks" },
      { text: "Hike to Sant Jeroni summit or take Sant Joan funicular for views" },
      { time: "Evening", text: "Back to Barcelona for relaxed tapas — you've earned it" },
    ],
    tips: [
      "Start by 8am to beat tour groups. Pack layers — it's cooler on the mountain",
    ],
  },
  {
    day: 4,
    title: "Beach · Neighborhoods · Sunset",
    image: DAY_IMAGES[4],
    imageAlt: "Barceloneta beach and Mediterranean coast",
    activities: [
      { time: "Morning", text: "Barceloneta or Bogatell beach — swim before the crowds", rideTo: { name: "Barceloneta Beach", lat: 41.3809, lng: 2.189, address: "Barceloneta, Barcelona, Spain" } },
      { text: "Seafood lunch on the promenade (La Mar Salada, Can Paixano)" },
      { text: "Afternoon in Gràcia or Poblenou — vermut, shops, slow wander" },
      { time: "Sunset", text: "Bunkers del Carmel for panoramic city views", rideTo: { name: "Bunkers del Carmel", lat: 41.4194, lng: 2.1617, address: "Carrer de Marià Labernia, Barcelona, Spain" } },
      { text: "Optional: Magic Fountain show at Montjuïc (check schedule)" },
    ],
  },
  {
    day: 5,
    title: "Markets · Last Stroll · Fly Home",
    image: DAY_IMAGES[5],
    imageAlt: "Colorful stalls at La Boqueria market",
    activities: [
      { time: "Morning", text: "Mercat de la Boqueria — fruit, jamón, last-minute gifts", rideTo: { name: "La Boqueria", lat: 41.3816, lng: 2.1715, address: "La Rambla, 91, Barcelona, Spain" } },
      { text: "Stroll Parc de la Ciutadella or revisit a favorite barrio" },
      { time: "Midday", text: "Metro or Aerobús to BCN", rideTo: { name: "BCN Airport", lat: 41.2974, lng: 2.0833, address: "Aeropuerto Josep Tarradellas Barcelona-El Prat, Spain" } },
      { text: "Allow 2+ hours before international departure (security can be slow)" },
    ],
  },
];

export const EXTRA_IDEAS = [
  "Camp Nou / Spotify Camp Nou tour",
  "Picasso Museum (El Born)",
  "Flamenco show in Palau Dalmases",
  "Day trip to Sitges beach town",
  "Montjuïc castle & cable car",
  "El Raval street art walk",
  "Pintxos crawl in El Born",
];

export const TRIP_CONTEXT = `
You are a helpful travel assistant for a 5-day Barcelona trip.

ITINERARY:
Day 1: Gothic Quarter & El Born — arrive BCN, settle in, old city walk, tapas
Day 2: Gaudí day — Sagrada Família morning, Passeig de Gràcia modernist houses, Park Güell afternoon
Day 3: Montserrat day trip — R5 train from Plaça Espanya, monastery, hikes or funiculars
Day 4: Beach morning (Barceloneta), neighborhood wander (Gràcia/Poblenou), sunset at Bunkers del Carmel
Day 5: La Boqueria market, last stroll, Aerobús/metro to BCN

PACK LIST: eSIM, power bank, walking shoes, light layers, sunscreen, euros cash, swimsuit, Montserrat daypack, timed-entry tickets for Sagrada & Park Güell, metro pass

WEATHER (general): Mediterranean — warm Apr–Oct (70–85°F days), mild winters. Summer humid; afternoon beach is best before 11am. Montserrat cooler and windier than the city. Rain possible Oct–Apr — pack a light jacket.

TRANSLATION: Help with Spanish phrases useful in Barcelona (Catalan is also spoken — Spanish works everywhere with tourists). Common: "¿Cuánto cuesta?" (How much?), "Una cerveza / agua, por favor", "¿Dónde está...?" (Where is...?), "La cuenta, por favor" (check please), "Dos cañas, por favor" (two small beers).

Be concise, practical, and safety-aware for pickpockets, timed-entry tickets, and metro strikes.
`.trim();
