export interface GeoPlace {
  name: string;
  lat: number;
  lng: number;
  /** Full address for ride apps — improves dropoff accuracy */
  address?: string;
}

/** Apple Maps — opens native Maps on iPhone */
export function appleMapsUrl(place: GeoPlace): string {
  return `https://maps.apple.com/?ll=${place.lat},${place.lng}&q=${encodeURIComponent(place.name)}`;
}

/** Google Maps walking directions to destination */
export function googleMapsWalkingDirectionsUrl(place: GeoPlace): string {
  const dest = place.address
    ? encodeURIComponent(place.address)
    : `${place.lat},${place.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`;
}

/** Google Maps directions to destination */
export function googleMapsDirectionsUrl(place: GeoPlace): string {
  const dest = place.address
    ? encodeURIComponent(place.address)
    : `${place.lat},${place.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

/** Apple Maps walking directions */
export function appleMapsWalkingUrl(place: GeoPlace): string {
  return `https://maps.apple.com/?daddr=${place.lat},${place.lng}&dirflg=w`;
}

/** Weather.com forecast for coordinates */
export function weatherUrl(place: GeoPlace): string {
  return `https://weather.com/weather/today/l/${place.lat},${place.lng}`;
}

/** wttr.in — lightweight mobile-friendly forecast */
export function wttrUrl(place: GeoPlace): string {
  return `https://wttr.in/${place.lat},${place.lng}?format=j1`;
}

/** Yelp search — opens reviews for the place in Barcelona */
export function yelpUrl(place: GeoPlace): string {
  const findLoc = place.address ?? `${place.lat},${place.lng}`;
  const loc =
    findLoc.includes("Barcelona") || findLoc.includes("Spain")
      ? findLoc
      : `${findLoc}, Barcelona, Spain`;
  const params = new URLSearchParams({
    find_desc: place.name,
    find_loc: loc,
  });
  return `https://www.yelp.es/search?${params.toString()}`;
}

/**
 * Uber universal link — opens app with dropoff pre-filled.
 * @see https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction
 */
export function uberUrl(place: GeoPlace): string {
  const address = place.address ?? `${place.name}, Barcelona, Spain`;
  const params = [
    "action=setPickup",
    "pickup=my_location",
    `dropoff[latitude]=${place.lat}`,
    `dropoff[longitude]=${place.lng}`,
    `dropoff[nickname]=${encodeURIComponent(place.name)}`,
    `dropoff[formatted_address]=${encodeURIComponent(address)}`,
  ];
  return `https://m.uber.com/ul/?${params.join("&")}`;
}

/** Cabify / Bolt — common ride apps in Barcelona */
export function inDriveUrl(place: GeoPlace): string {
  const address = place.address ?? `${place.name}, Barcelona, Spain`;
  const params = new URLSearchParams({
    lat: String(place.lat),
    lon: String(place.lng),
    address,
  });
  return `https://indrive.com/en/home?${params.toString()}`;
}

export function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Ride app links must open in same tab on mobile so universal links hand off to the app. */
export function openRideLink(url: string) {
  window.location.assign(url);
}
