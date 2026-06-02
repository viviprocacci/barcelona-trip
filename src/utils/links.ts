export interface GeoPlace {
  name: string;
  lat: number;
  lng: number;
}

/** Apple Maps — opens native Maps on iPhone */
export function appleMapsUrl(place: GeoPlace): string {
  return `https://maps.apple.com/?ll=${place.lat},${place.lng}&q=${encodeURIComponent(place.name)}`;
}

/** Google Maps directions to destination */
export function googleMapsDirectionsUrl(place: GeoPlace): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=&travelmode=driving`;
}

/** Weather.com forecast for coordinates (works in mobile browser; can open in Apple Weather from share on some iOS versions) */
export function weatherUrl(place: GeoPlace): string {
  return `https://weather.com/weather/today/l/${place.lat},${place.lng}`;
}

/** wttr.in — lightweight mobile-friendly forecast */
export function wttrUrl(place: GeoPlace): string {
  return `https://wttr.in/${place.lat},${place.lng}?format=j1`;
}

/** Uber dropoff deep link — opens Uber app if installed, else mobile web */
export function uberUrl(place: GeoPlace): string {
  const params = new URLSearchParams({
    "dropoff[latitude]": String(place.lat),
    "dropoff[longitude]": String(place.lng),
    "dropoff[nickname]": place.name,
  });
  return `https://m.uber.com/looking?${params.toString()}`;
}

/** InDrive is widely used in Guatemala */
export function inDriveUrl(place: GeoPlace): string {
  return `https://indrive.com/?destination=${place.lat},${place.lng}`;
}

export function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
