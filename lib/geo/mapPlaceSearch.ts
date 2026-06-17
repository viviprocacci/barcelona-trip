import { geocodePlace, searchPlaces, type GeocodeResult } from "./nominatim";

export interface MapPlaceResult {
  name: string;
  lat: number;
  lng: number;
  notes?: string;
  address?: string;
  sourceUrl?: string;
}

function shortName(displayName: string, fallback: string): string {
  const first = displayName.split(",")[0]?.trim();
  return first || fallback;
}

function fromGeocode(query: string, hit: GeocodeResult): MapPlaceResult {
  return {
    name: shortName(hit.displayName, query),
    lat: hit.lat,
    lng: hit.lng,
    notes: hit.displayName,
    address: hit.displayName,
  };
}

const QUERY_VARIANTS = (q: string) => [
  q,
  `${q}, Barcelona`,
  `${q}, Eixample, Barcelona`,
  `${q}, Gothic Quarter, Barcelona`,
  `${q}, Montserrat, Spain`,
];

export async function runMapPlaceSearch(query: string): Promise<MapPlaceResult> {
  const q = query.trim();
  if (!q) throw new Error("query required");

  const direct = await geocodePlace(q);
  if (direct) return fromGeocode(q, direct);

  const hits = await searchPlaces(q, 6);
  if (hits[0]) return fromGeocode(q, hits[0]);

  for (const variant of QUERY_VARIANTS(q)) {
    if (variant === q) continue;
    const hit = await geocodePlace(variant);
    if (hit) return fromGeocode(q, hit);
  }

  throw new Error(`Couldn't find "${q}" on the map. Try name + neighborhood (e.g. Sagrada Família, Barcelona).`);
}
