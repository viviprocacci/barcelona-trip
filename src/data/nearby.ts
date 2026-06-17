export type NearbyCategory = "pilates" | "markets" | "shopping";

export interface NearbyPlace {
  id: string;
  name: string;
  category: NearbyCategory;
  lat: number;
  lng: number;
  address: string;
  hours: string;
  notes?: string;
}

export const NEARBY_CATEGORIES: { id: NearbyCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pilates", label: "Pilates" },
  { id: "markets", label: "Markets" },
  { id: "shopping", label: "Shopping" },
];

export const NEARBY_CATEGORY_LABELS: Record<NearbyCategory, string> = {
  pilates: "Pilates studios",
  markets: "Markets",
  shopping: "Shopping",
};

export const NEARBY_CATEGORY_COLORS: Record<NearbyCategory, string> = {
  pilates: "#7a6b8e",
  markets: "#c47a3a",
  shopping: "#4a7c9b",
};

export const NEARBY_PLACES: NearbyPlace[] = [
  {
    id: "pilates-heartcore",
    name: "Heartcore Barcelona",
    category: "pilates",
    lat: 41.3942,
    lng: 2.1618,
    address: "Carrer de Provença 281, Eixample",
    hours: "Mon–Fri 7:00–21:00, Sat 8:00–14:00",
    notes: "Reformer classes in English; book ahead on weekends",
  },
  {
    id: "pilates-club",
    name: "Club Pilates Eixample",
    category: "pilates",
    lat: 41.3898,
    lng: 2.1684,
    address: "Carrer de Roger de Llúria 81",
    hours: "Mon–Fri 6:30–21:00, Sat–Sun 9:00–13:00",
    notes: "Intro packages for visitors; mats provided",
  },
  {
    id: "pilates-espai",
    name: "ESPAi FITNESS Pilates",
    category: "pilates",
    lat: 41.3971,
    lng: 2.1572,
    address: "Carrer de València 284",
    hours: "Mon–Fri 7:00–22:00, Sat 9:00–14:00",
    notes: "Mat and reformer; showers on site",
  },
  {
    id: "pilates-sana",
    name: "Sana Fisio & Pilates",
    category: "pilates",
    lat: 41.4012,
    lng: 2.1695,
    address: "Carrer de Girona 112",
    hours: "Mon–Thu 8:00–20:00, Fri 8:00–18:00",
    notes: "Clinical pilates + physio — good for recovery days",
  },
  {
    id: "pilates-yogalinda",
    name: "Yogalinda Barcelona",
    category: "pilates",
    lat: 41.3846,
    lng: 2.1809,
    address: "Carrer de l'Argenteria 5, Born",
    hours: "Daily 8:00–21:00",
    notes: "Pilates reformer + yoga in a bright loft studio",
  },
  {
    id: "market-boqueria",
    name: "Mercat de la Boqueria",
    category: "markets",
    lat: 41.3816,
    lng: 2.1715,
    address: "La Rambla 91, Ciutat Vella",
    hours: "Mon–Sat 8:00–20:30 (stalls taper after 17:00)",
    notes: "Go before 10am for juice stands and fewer crowds",
  },
  {
    id: "market-sant-antoni",
    name: "Mercat de Sant Antoni",
    category: "markets",
    lat: 41.3789,
    lng: 2.1634,
    address: "Carrer del Comte d'Urgell 1",
    hours: "Mon–Sat 8:00–20:30; Sun flea market 8:00–14:00",
    notes: "Sunday book & vintage market outside the main hall",
  },
  {
    id: "market-concepcio",
    name: "Mercat de la Concepció",
    category: "markets",
    lat: 41.3938,
    lng: 2.1651,
    address: "Carrer de Aragó 313, Eixample",
    hours: "Mon–Sat 8:00–20:30",
    notes: "Flower stalls on the upper level — great for photos",
  },
  {
    id: "market-barceloneta",
    name: "Mercat de la Barceloneta",
    category: "markets",
    lat: 41.3805,
    lng: 2.1887,
    address: "Plaça de la Font 1",
    hours: "Mon–Sat 7:00–20:30",
    notes: "Neighborhood market near the beach; fresh seafood counters",
  },
  {
    id: "market-abaceria",
    name: "Mercat de l'Abaceria",
    category: "markets",
    lat: 41.4042,
    lng: 2.1587,
    address: "Travessera de Gràcia 186",
    hours: "Mon–Sat 8:00–20:30",
    notes: "Gràcia locals' market — less touristy than Boqueria",
  },
  {
    id: "market-encants",
    name: "Encants Barcelona",
    category: "markets",
    lat: 41.4018,
    lng: 2.1864,
    address: "Carrer de los Castillejos 158",
    hours: "Mon, Wed, Fri, Sat 9:00–20:00",
    notes: "Flea market under a mirrored canopy — haggle expected",
  },
  {
    id: "shop-passeig-gracia",
    name: "Passeig de Gràcia",
    category: "shopping",
    lat: 41.3916,
    lng: 2.1649,
    address: "Passeig de Gràcia (Casa Batlló to Diagonal)",
    hours: "Most shops Mon–Sat 10:00–20:00",
    notes: "Modernist façades + Zara, Mango, luxury flagships",
  },
  {
    id: "shop-corte-ingles-diagonal",
    name: "El Corte Inglés Diagonal",
    category: "shopping",
    lat: 41.3965,
    lng: 2.1582,
    address: "Avinguda Diagonal 471–473",
    hours: "Mon–Sat 10:00–22:00",
    notes: "Department store — cosmetics, home, rooftop restaurant",
  },
  {
    id: "shop-uniqlo-pg",
    name: "Uniqlo Passeig de Gràcia",
    category: "shopping",
    lat: 41.3904,
    lng: 2.1662,
    address: "Passeig de Gràcia 22",
    hours: "Mon–Sat 10:00–21:00, Sun 11:00–21:00",
    notes: "Travel basics and layers; air-conditioned break",
  },
  {
    id: "shop-born-boutiques",
    name: "El Born boutiques",
    category: "shopping",
    lat: 41.3851,
    lng: 2.1827,
    address: "Carrer de la Princesa & Passeig del Born",
    hours: "Most shops Tue–Sat 11:00–20:00",
    notes: "Independent designers, ceramics, and concept stores",
  },
  {
    id: "shop-diagonal-mar",
    name: "Diagonal Mar centre",
    category: "shopping",
    lat: 41.4098,
    lng: 2.2164,
    address: "Avinguda Diagonal 3, Sant Martí",
    hours: "Mon–Sat 10:00–22:00",
    notes: "Mall by the beach — Zara Home, Nike, cinema",
  },
  {
    id: "shop-gracia",
    name: "Gràcia shopping streets",
    category: "shopping",
    lat: 41.4036,
    lng: 2.1564,
    address: "Carrer de Verdi & Travessera de Gràcia",
    hours: "Most shops Tue–Sat 10:30–20:30",
    notes: "Vintage, vinyl, and local brands — village feel",
  },
];
