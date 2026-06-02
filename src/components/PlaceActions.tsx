import { Car, Cloud, MapPin, Navigation } from "lucide-react";
import type { GeoPlace } from "../utils/links";
import {
  appleMapsUrl,
  googleMapsDirectionsUrl,
  inDriveUrl,
  openExternal,
  uberUrl,
  weatherUrl,
} from "../utils/links";

interface PlaceActionsProps {
  place: GeoPlace;
  compact?: boolean;
}

export function PlaceActions({ place, compact }: PlaceActionsProps) {
  const actions = [
    { label: "Weather", icon: Cloud, url: weatherUrl(place) },
    { label: "Maps", icon: MapPin, url: appleMapsUrl(place) },
    { label: "Directions", icon: Navigation, url: googleMapsDirectionsUrl(place) },
    { label: "Uber", icon: Car, url: uberUrl(place) },
    { label: "InDrive", icon: Car, url: inDriveUrl(place) },
  ];

  return (
    <div className={`place-actions ${compact ? "place-actions--compact" : ""}`}>
      {actions.map(({ label, icon: Icon, url }) => (
        <button
          key={label}
          type="button"
          className="action-link"
          onClick={() => openExternal(url)}
        >
          <Icon size={14} strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </div>
  );
}
