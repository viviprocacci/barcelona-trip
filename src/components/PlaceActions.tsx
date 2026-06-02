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
  const mapActions = [
    { label: "Weather", icon: Cloud, url: weatherUrl(place), external: true },
    { label: "Maps", icon: MapPin, url: appleMapsUrl(place), external: true },
    { label: "Directions", icon: Navigation, url: googleMapsDirectionsUrl(place), external: true },
  ];

  return (
    <div className={`place-actions ${compact ? "place-actions--compact" : ""}`}>
      {mapActions.map(({ label, icon: Icon, url }) => (
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
      <a href={uberUrl(place)} className="action-link action-link--ride">
        <Car size={14} strokeWidth={1.5} />
        Uber
      </a>
      <a href={inDriveUrl(place)} className="action-link action-link--ride">
        <Car size={14} strokeWidth={1.5} />
        InDrive
      </a>
    </div>
  );
}
